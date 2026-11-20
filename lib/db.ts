import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Ma'lumotlar bazasi qatlami.
 *
 * Ikki implementatsiya — bitta interfeys orqali:
 *
 * 1. **node:sqlite** ( lokal development) — Node.js'ning o'z moduli,
 *    qo'shimcha paket yoki native build kerak emas.
 * 2. **Turso / libSQL** ( production) — serverless, Vercel'da ishlaydi.
 *    SQL dialekti bir xil (SQLite) — shuning uchun store kodi o'zgarmaydi.
 *
 * Tanlash avtomatik: `TURSO_DATABASE_URL` belgilangan bo'lsa — Turso,
 * aks holda lokal fayl.
 */

export interface Db {
  all<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<T[]>;
  get<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<T | undefined>;
  run(
    sql: string,
    params?: unknown[]
  ): Promise<{ lastInsertRowid: number; rowsAffected: number }>;
  execute(sql: string): Promise<void>;
  close(): void;
}

export const nowIso = () => new Date().toISOString();

/* ── Schema ─────────────────────────────────────────────── */

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user',
    plan          TEXT NOT NULL DEFAULT 'free',
    created_at    TEXT NOT NULL,
    accent_color  TEXT NOT NULL DEFAULT 'appnest'
  );

  CREATE TABLE IF NOT EXISTS clients (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'Faol',
    note       TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id  INTEGER,
    action     TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    title      TEXT NOT NULL,
    category   TEXT NOT NULL,
    brief      TEXT,
    platform   TEXT NOT NULL DEFAULT 'web',
    status     TEXT NOT NULL DEFAULT 'draft',
    ai_spec    TEXT,
    layout     TEXT,
    palette    TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS generation_attempts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id   TEXT NOT NULL,
    attempt_no   INTEGER NOT NULL DEFAULT 1,
    model        TEXT,
    duration_ms  INTEGER,
    status       TEXT NOT NULL DEFAULT 'ok',
    error        TEXT,
    created_at   TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_clients_status    ON clients(status);
  CREATE INDEX IF NOT EXISTS idx_clients_name      ON clients(name);
  CREATE INDEX IF NOT EXISTS idx_activity_time     ON activity(created_at);
  CREATE INDEX IF NOT EXISTS idx_projects_user      ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
  CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects(status);
  CREATE INDEX IF NOT EXISTS idx_attempts_project  ON generation_attempts(project_id);
`;

/**
 * Eski bazalarga ustun qo'shish (ALTER TABLE).
 * `CREATE TABLE IF NOT EXISTS` mavjud jadvalni o'zgartirmaydi — shuning uchun
 * yangi ustunlar alohida tekshiriladi.
 */
const COLUMN_MIGRATIONS: { table: string; column: string; ddl: string }[] = [
  { table: "users", column: "role", ddl: "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'" },
  { table: "users", column: "plan", ddl: "ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'" },
  { table: "users", column: "created_at", ddl: "ALTER TABLE users ADD COLUMN created_at TEXT" },
  { table: "users", column: "accent_color", ddl: "ALTER TABLE users ADD COLUMN accent_color TEXT NOT NULL DEFAULT 'appnest'" },
  { table: "projects", column: "palette", ddl: "ALTER TABLE projects ADD COLUMN palette TEXT" },
];

/* ── Namuna ma'lumotlar ────────────────────────────────── */

const SEED_CLIENTS: [string, string, string, string][] = [
  ["Alisher Karimov", "alisher@company.uz", "Faol", "Korporativ sayt — 2026"],
  ["Dilnoza Rustamova", "dilnoza@company.uz", "Faol", "Brend identifikatsiyasi"],
  ["Sardor Tursunov", "sardor@company.uz", "Arxiv", "Loyihani yopdi"],
  ["Nilufar Aliyeva", "nilufar@company.uz", "Faol", "UX audit"],
  ["Javlon Ergashev", "javlon@company.uz", "Faol", "Dashboard ishga tushdi"],
];

/* ── node:sqlite implementatsiyasi ──────────────────────── */

/**
 * SQLite bazasini ochadi.
 *
 * ⚠️ Vercel serverless muhitida fayl tizimi **faqat o'qiladigan** — `.data/` papkasini
 * yaratib bo'lmaydi. Shu holatda biz xotiradagi (`:memory:`) bazaga o'tamiz:
 * sayt ishlaydi, lekin ma'lumotlar saqlanmaydi.
 *
 * Doimiy saqlanish uchun **Turso** (yoki Postgres) ulanish kerak:
 * `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` muhit o'zgaruvchilarini qo'ying.
 */
export function createSqliteDb(file: string): Db {
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    storageMode = "file";
    return openSqliteFile(file);
  } catch {
    // Faqat o'qiladigan fayl tizimi (Vercel) — xotirada ishlaymiz
    storageMode = "memory";
    return openSqliteFile(":memory:");
  }
}

function openSqliteFile(file: string): Db {
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);

  const count = db.prepare("SELECT COUNT(*) AS count FROM clients").get() as unknown as {
    count: number;
  };

  if (count.count === 0) {
    const now = nowIso();
    const insert = db.prepare(
      "INSERT INTO clients (name, email, status, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    );
    for (const [name, email, status, note] of SEED_CLIENTS) {
      insert.run(name, email, status, note, now, now);
    }
  }

  return {
    async all<T>(sql: string, params: unknown[] = []) {
      return db.prepare(sql).all(...(params as never[])) as unknown as T[];
    },
    async get<T>(sql: string, params: unknown[] = []) {
      return db.prepare(sql).get(...(params as never[])) as unknown as T | undefined;
    },
    async run(sql: string, params: unknown[] = []) {
      const result = db.prepare(sql).run(...(params as never[]));
      return {
        lastInsertRowid: Number(result.lastInsertRowid),
        rowsAffected: Number(result.changes),
      };
    },
    async execute(sql: string) {
      db.exec(sql);
    },
    close() {
      db.close();
    },
  };
}

/** Test uchun: xotiradagi baza */
export function createMemoryDb(): Db {
  return openSqliteFile(":memory:");
}

/* ── Turso / libSQL implementatsiyasi ───────────────────── */

export async function createTursoDb(
  url: string,
  authToken?: string
): Promise<Db> {
  const { createClient } = await import("@libsql/client");
  const client = createClient(
    authToken ? { url, authToken } : { url }
  );

  // Schema — bir necha statementni alohida bajarish kerak
  for (const statement of SCHEMA.split(";").map((s) => s.trim()).filter(Boolean)) {
    await client.execute(statement);
  }

  const countRow = await client.execute("SELECT COUNT(*) AS count FROM clients");
  const count = Number(
    (countRow.rows[0] as unknown as { count: number }).count
  );

  if (count === 0) {
    const now = nowIso();
    for (const [name, email, status, note] of SEED_CLIENTS) {
      await client.execute({
        sql: "INSERT INTO clients (name, email, status, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        args: [name, email, status, note, now, now],
      });
    }
  }

  return {
    async all<T>(sql: string, params: unknown[] = []) {
      const result = await client.execute({ sql, args: params as never[] });
      return result.rows as unknown as T[];
    },
    async get<T>(sql: string, params: unknown[] = []) {
      const result = await client.execute({ sql, args: params as never[] });
      return result.rows[0] as unknown as T | undefined;
    },
    async run(sql: string, params: unknown[] = []) {
      const result = await client.execute({ sql, args: params as never[] });
      return {
        lastInsertRowid: Number(result.lastInsertRowid ?? 0),
        rowsAffected: Number(result.rowsAffected ?? 0),
      };
    },
    async execute(sql: string) {
      await client.execute(sql);
    },
    close() {
      client.close();
    },
  };
}

/* ── Global obyekt ─────────────────────────────────────── */

let dbPromise: Promise<Db> | null = null;

/**
 * Saqlash rejimi:
 * - "file"   — ma'lumotlar diskda saqlanadi (lokal yoki Turso)
 * - "memory" — faqat jarayon ichida (Vercel serverless, fayl tizimi faqat o'qiladigan)
 */
export type StorageMode = "file" | "memory";
let storageMode: StorageMode = "file";

export function getStorageMode(): StorageMode {
  return storageMode;
}

/** Yetishmayotgan ustunlarni qo'shadi (eski bazalar uchun) */
async function migrateColumns(db: Db) {
  for (const migration of COLUMN_MIGRATIONS) {
    const rows = await db.all<{ name: string }>(
      `PRAGMA table_info(${migration.table})`
    );
    if (rows.some((r) => r.name === migration.column)) continue;
    try {
      await db.execute(migration.ddl);
    } catch {
      // Ustun allaqachon qo'shilgan bo'lishi mumkin
    }
  }
}

/**
 * Joriy ma'lumotlar bazasi.
 *
 * - `TURSO_DATABASE_URL` belgilangan → Turso (production)
 * - Aks holda → lokal `.data/appnest.db` fayli (development)
 */
export function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const url = process.env.TURSO_DATABASE_URL;

      if (url) {
        const remote = await createTursoDb(url, process.env.TURSO_AUTH_TOKEN);
        await migrateColumns(remote);
        return remote;
      }

      const file = path.join(process.cwd(), ".data", "appnest.db");
      const local = createSqliteDb(file);
      await migrateColumns(local);
      return local;
    })();
  }

  return dbPromise;
}

/** Turso moduli faqat serverda ishlatiladi — testlarda kerak emas */
export function isRemoteDb(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}
