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
    created_at    TEXT NOT NULL
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

  CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
  CREATE INDEX IF NOT EXISTS idx_clients_name   ON clients(name);
  CREATE INDEX IF NOT EXISTS idx_activity_time  ON activity(created_at);
`;

/* ── Namuna ma'lumotlar ────────────────────────────────── */

const SEED_CLIENTS: [string, string, string, string][] = [
  ["Alisher Karimov", "alisher@company.uz", "Faol", "Korporativ sayt — 2026"],
  ["Dilnoza Rustamova", "dilnoza@company.uz", "Faol", "Brend identifikatsiyasi"],
  ["Sardor Tursunov", "sardor@company.uz", "Arxiv", "Loyihani yopdi"],
  ["Nilufar Aliyeva", "nilufar@company.uz", "Faol", "UX audit"],
  ["Javlon Ergashev", "javlon@company.uz", "Faol", "Dashboard ishga tushdi"],
];

/* ── node:sqlite implementatsiyasi ──────────────────────── */

export function createSqliteDb(file: string): Db {
  mkdirSync(path.dirname(file), { recursive: true });

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
  return createSqliteDb(":memory:");
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
        return await createTursoDb(url, process.env.TURSO_AUTH_TOKEN);
      }

      const file = path.join(process.cwd(), ".data", "appnest.db");
      return createSqliteDb(file);
    })();
  }

  return dbPromise;
}

/** Turso moduli faqat serverda ishlatiladi — testlarda kerak emas */
export function isRemoteDb(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}
