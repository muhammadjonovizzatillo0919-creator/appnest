import { existsSync } from "node:fs";
import path from "node:path";

/**
 * `.env` faylini yuklash.
 *
 * Next.js `next dev` va `next build` da `.env` ni avtomatik yuklaydi,
 * lekin `next start` da ba'zi holatlarda yuklamaydi. Shu sabab biz
 * o'zimiz yuklaymiz (Node.js 20.12+ `process.loadEnvFile`).
 *
 * Vercel'da muhit o'zgaruvchilari allaqachon `process.env` da bo'ladi —
 * bu funksiya hech narsani o'zgartirmaydi.
 */
let loaded = false;

export function ensureEnvLoaded() {
  if (loaded) return;
  loaded = true;

  if (process.env.SUPERADMIN_EMAILS) return; // allaqachon yuklangan

  const file = path.join(process.cwd(), ".env");
  if (!existsSync(file)) return;

  try {
    process.loadEnvFile(file);
  } catch {
    // fayl yo'q yoki noto'g'ri format — jim o'tamiz
  }
}
