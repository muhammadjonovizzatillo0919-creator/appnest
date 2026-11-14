#!/usr/bin/env node
/**
 * Turso (libSQL) ma'lumotlar bazasini Vercel'ga ulash.
 *
 * 1) https://turso.tech → hisob yarating (GitHub bilan)
 * 2) "Create Database" → DATABASE_URL va Auth Token oling
 * 3) $env:VERCEL_TOKEN = "..."
 *    $env:TURSO_DATABASE_URL = "libsql://..."
 *    $env:TURSO_AUTH_TOKEN = "..."
 *    node scripts/setup-turso.mjs
 *
 * Skript env o'zgaruvchilarini Vercel'ga qo'shadi va sxema yaratilishini tekshiradi.
 */

const token = process.env.VERCEL_TOKEN;
const dbUrl = process.env.TURSO_DATABASE_URL;
const dbToken = process.env.TURSO_AUTH_TOKEN;
const projectId = process.env.VERCEL_PROJECT_ID ?? "appnest";

if (!token || !dbUrl || !dbToken) {
  console.error("❌ Kerakli o'zgaruvchilar yetishmayapti:");
  console.error("   VERCEL_TOKEN, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function vercel(path, method = "GET", body) {
  const res = await fetch(`https://api.vercel.com${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    console.error(`❌ ${method} ${path} -> ${res.status}`);
    console.error(typeof data === "string" ? data : JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

async function upsertEnv(key, value) {
  const existing = await vercel(
    `/v10/projects/${projectId}/env?decrypt=false`
  );
  const found = (existing.envs ?? []).find((e) => e.key === key);

  const target = ["production", "preview", "development"];

  if (found) {
    await vercel(`/v10/projects/${projectId}/env/${found.id}`, "PATCH", {
      value,
      target,
      type: "encrypted",
    });
    console.log(`   ♻️  ${key} yangilandi`);
  } else {
    await vercel(`/v10/projects/${projectId}/env`, "POST", {
      key,
      value,
      target,
      type: "encrypted",
    });
    console.log(`   ➕ ${key} qo'shildi`);
  }
}

async function main() {
  console.log("\n▸ Turso sxemasini tekshiramiz...\n");

  // 1) Bazaga ulanib, jadvallarni yaratamiz (idempotent)
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url: dbUrl, authToken: dbToken });

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      plan TEXT NOT NULL DEFAULT 'free',
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Faol',
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      brief TEXT,
      platform TEXT NOT NULL DEFAULT 'web',
      status TEXT NOT NULL DEFAULT 'draft',
      ai_spec TEXT,
      layout TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS generation_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      attempt_no INTEGER NOT NULL DEFAULT 1,
      model TEXT,
      duration_ms INTEGER,
      status TEXT NOT NULL DEFAULT 'ok',
      error TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category)`,
    `CREATE INDEX IF NOT EXISTS idx_attempts_project ON generation_attempts(project_id)`,
  ];

  for (const sql of tables) {
    await client.execute(sql);
  }
  console.log("   ✅ Jadvallar tayyor");

  const users = await client.execute("SELECT COUNT(*) AS count FROM users");
  console.log(
    `   ℹ️  Bazadagi foydalanuvchilar: ${users.rows[0].count}`
  );

  // 2) Vercel env'lariga qo'shamiz
  console.log("\n▸ Vercel muhit o'zgaruvchilari:\n");
  await upsertEnv("TURSO_DATABASE_URL", dbUrl);
  await upsertEnv("TURSO_AUTH_TOKEN", dbToken);

  console.log("\n✅ Tayyor. Endi GitHub'ga push qiling — Vercel avtomatik deploy qiladi.");
  console.log("   Keyin /api/health da 'database: file (Turso)' ko'rinishi kerak.\n");
}

main().catch((e) => {
  console.error("Xato:", e);
  process.exit(1);
});
