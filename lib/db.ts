import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Ma'lumotlar bazasi вЂ” SQLite (Node.js'ning o'z ichidagi `node:sqlite`).
 *
 * вњ… Qo'shimcha paket yoki native build kerak emas
 * вњ… Bir fayl вЂ” nusxalash, ko'chirish oson
 * вњ… ACID transakksiyalar, WAL rejimi
 *
 * вљ пёЏ Production (Vercel) da fayl tizimi faqat o'qiladigan вЂ” u yerda
 * Postgres/Turso kerak. `lib/*-store.ts` interfeyslari shu uchun
 * DB almashtirilishi mumkin.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "appnest.db");

let db: DatabaseSync | null = null;

function migrate(database: DatabaseSync) {
  database.exec(`
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
  `);
}

/** Ma'lumotlar bazasini ochadi (bir marta) */
export function getDb(): DatabaseSync {
  if (db) return db;

  mkdirSync(DATA_DIR, { recursive: true });

  db = new DatabaseSync(DB_FILE);

  // WAL вЂ” o'qish va yozish parallel ishlaydi
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");

  migrate(db);
  seedIfEmpty(db);

  return db;
}

/** Test uchun: xotiradagi (`:memory:`) baza */
export function createMemoryDb(): DatabaseSync {
  const memory = new DatabaseSync(":memory:");
  memory.exec("PRAGMA foreign_keys = ON;");
  migrate(memory);
  return memory;
}

/** Baza bo'sh bo'lsa namuna ma'lumotlar bilan to'ldiradi */
function seedIfEmpty(database: DatabaseSync) {
  const row = database
    .prepare("SELECT COUNT(*) AS count FROM clients")
    .get() as unknown as { count: number };

  if (row.count > 0) return;

  const now = new Date().toISOString();
  const insert = database.prepare(
    "INSERT INTO clients (name, email, status, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const samples: [string, string, string, string][] = [
    ["Alisher Karimov", "alisher@company.uz", "Faol", "Korporativ sayt вЂ” 2026"],
    ["Dilnoza Rustamova", "dilnoza@company.uz", "Faol", "Brend identifikatsiyasi"],
    ["Sardor Tursunov", "sardor@company.uz", "Arxiv", "Loyihani yopdi"],
    ["Nilufar Aliyeva", "nilufar@company.uz", "Faol", "UX audit"],
    ["Javlon Ergashev", "javlon@company.uz", "Faol", "Dashboard ishga tushdi"],
  ];

  for (const [name, email, status, note] of samples) {
    insert.run(name, email, status, note, now, now);
  }
}

/** Joriy vaqt (ISO) */
export const nowIso = () => new Date().toISOString();

