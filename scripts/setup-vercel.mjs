#!/usr/bin/env node
/**
 * Vercel loyihasini ommaga ochish va muhit o'zgaruvchilarini qo'yish.
 *
 * Ishga tushirish:
 *   1) Vercel → Account Settings → Tokens → Create Token
 *   2) $env:VERCEL_TOKEN = "..."            (PowerShell)
 *   3) node scripts/setup-vercel.mjs
 *
 * Skript qiladi:
 *   - Deployment Protection'ni o'chiradi (sayt tashqaridan ochiq bo'ladi)
 *   - AUTH_SECRET, SUPERADMIN_EMAILS, GEMINI_API_KEY, TURSO_* ni env sifatida qo'shadi
 *
 * ⚠️ Turso kalitlarini ham shu yerda kiritish mumkin — skript ularni alohida
 *    so'ramaydi, faqat mavjud bo'lsa qo'shadi.
 */

const API = "https://api.vercel.com";
const PROJECT_ID = process.env.VERCEL_PROJECT_ID ?? "appnest";

const token = process.env.VERCEL_TOKEN;
if (!token) {
  console.error("❌ VERCEL_TOKEN topilmadi.");
  console.error("   PowerShell: $env:VERCEL_TOKEN = \"vercel_xxx\"");
  process.exit(1);
}

async function api(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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
    console.error(
      typeof data === "string" ? data : JSON.stringify(data, null, 2)
    );
    process.exit(1);
  }
  return data;
}

/** Muhit o'zgaruvchilarini qo'shadi (mavjud bo'lsa yangilaydi) */
async function upsertEnv(key, value, target = ["production", "preview", "development"]) {
  const existing = await api(`/v10/projects/${PROJECT_ID}/env?decrypt=false`);

  const found = (existing.envs ?? []).find((e) => e.key === key);

  if (found) {
    await api(`/v10/projects/${PROJECT_ID}/env/${found.id}`, "PATCH", {
      value,
      target,
      type: "encrypted",
    });
    console.log(`   ♻️  ${key} yangilandi`);
    return;
  }

  await api(`/v10/projects/${PROJECT_ID}/env`, "POST", {
    key,
    value,
    target,
    type: "encrypted",
  });
  console.log(`   ➕ ${key} qo'shildi`);
}

async function main() {
  console.log(`\n▸ Loyiha: ${PROJECT_ID}\n`);

  // 1. Deployment Protection'ni o'chirish
  console.log("1) Deployment Protection o'chirilmoqda...");
  await api(`/v9/projects/${PROJECT_ID}`, "PATCH", {
    ssoProtection: null,
  });
  console.log("   ✅ Sayt endi tashqaridan ochiq (Login - Vercel yo'qoladi)");

  // 2. Muhit o'zgaruvchilari
  console.log("\n2) Muhit o'zgaruvchalari qo'shilmoqda...");

  if (process.env.AUTH_SECRET) {
    await upsertEnv("AUTH_SECRET", process.env.AUTH_SECRET);
  } else {
    console.log("   ⚠️  AUTH_SECRET berilmadi — o'tkazib yuborildi");
  }

  if (process.env.SUPERADMIN_EMAILS) {
    await upsertEnv("SUPERADMIN_EMAILS", process.env.SUPERADMIN_EMAILS);
  }

  if (process.env.GEMINI_API_KEY) {
    await upsertEnv("GEMINI_API_KEY", process.env.GEMINI_API_KEY);
  }

  if (process.env.TURSO_DATABASE_URL) {
    await upsertEnv("TURSO_DATABASE_URL", process.env.TURSO_DATABASE_URL);
  }
  if (process.env.TURSO_AUTH_TOKEN) {
    await upsertEnv("TURSO_AUTH_TOKEN", process.env.TURSO_AUTH_TOKEN);
  }

  console.log("\n✅ Tayyor. Endi GitHub'ga push qiling — Vercel avtomatik deploy qiladi.\n");
}

main().catch((e) => {
  console.error("Xato:", e);
  process.exit(1);
});
