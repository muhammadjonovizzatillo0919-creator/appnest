#!/usr/bin/env node
/**
 * Foydalanuvchini superadmin qilish (bo'lgan foydalanuvchi uchun).
 *
 * Ishga tushirish:
 *   node scripts/make-superadmin.mjs admin@appnest.uz
 *
 * Qayerda ishlaydi:
 *   - Lokal (SQLite): .data/appnest.db
 *   - Turso: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN muhitda bo'lsa
 */

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";

const email = (process.argv[2] ?? "").trim().toLowerCase();

if (!email) {
  console.error("❌ Email kiriting:  node scripts/make-superadmin.mjs admin@appnest.uz");
  process.exit(1);
}

async function connect() {
  // ── Turso (serverless) ──
  if (process.env.TURSO_DATABASE_URL) {
    const { createClient } = await import("@libsql/client");
    return createClient(
      process.env.TURSO_AUTH_TOKEN
        ? {
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
          }
        : { url: process.env.TURSO_DATABASE_URL }
    );
  }

  // ── Lokal SQLite ──
  const dir = path.join(process.cwd(), ".data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return new DatabaseSync(path.join(dir, "appnest.db"));
}

const db = await connect();
const isTurso = Boolean(process.env.TURSO_DATABASE_URL);

async function exec(sql, args = []) {
  if (isTurso) {
    const result = await db.execute({ sql, args });
    return result.rows;
  }
  return db.prepare(sql).all(...args);
}

const rows = await exec("SELECT id, name, email, role, plan FROM users WHERE email = ?", [
  email,
]);

if (!rows || rows.length === 0) {
  console.error(`❌ Foydalanuvchi topilmadi: ${email}`);
  console.error(
    "   Avval u ro'yxatdan o'tsin yoki SUPERADMIN_EMAILS muhit o'zgaruvchisiga qo'shing."
  );
  process.exit(1);
}

const user = rows[0];
console.log(`\n▸ Topildi: ${user.name} (${user.email})`);
console.log(`  hozirgi rol: ${user.role} | tarif: ${user.plan}\n`);

await exec("UPDATE users SET role = 'superadmin' WHERE email = ?", [email]);

console.log("✅ Superadmin qilindi.\n");
console.log("   Endi shu email bilan kiring → /admin ochiladi.\n");

if (isTurso) {
  console.log("ℹ️  Turso rejimida ishlading — serverless DB yangilandi.");
}
