import { NextResponse } from "next/server";
import { getDb, getStorageMode } from "@/lib/db";
import { githubStoreConfig } from "@/lib/json-db";
import { hasGeminiKey } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health — tizim holati.
 *
 * Monitoring uchun ham, deployment'dan keyin "hammasi ishlayaptimi?" ni
 * tekshirish uchun ham ishlatiladi.
 */
export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  // 0) Qaysi ombor ishlatiladi
  const github = githubStoreConfig();
  checks.storage = {
    ok: true,
    detail: github
      ? `GitHub ombori (${github.repo}) — doimiy`
      : getStorageMode() === "file"
        ? "fayl / Turso — doimiy"
        : "xotira (memory) — VERTINCHALIK, ma'lumot o'chadi",
  };

  // 1) Ma'lumotlar bazasi
  try {
    const db = await getDb();
    const users = await db.get<{ count: number }>(
      "SELECT COUNT(*) AS count FROM users"
    );
    const projects = await db.get<{ count: number }>(
      "SELECT COUNT(*) AS count FROM projects"
    );

    checks.database = {
      ok: true,
      detail: `${getStorageMode()}${github ? " (GitHub orqali)" : ""} | ${users?.count ?? 0} foydalanuvchi, ${
        projects?.count ?? 0
      } loyiha`,
    };
  } catch (e) {
    checks.database = {
      ok: false,
      detail: e instanceof Error ? e.message : "DB ga ulanib bo'lmadi",
    };
  }

  // 2) Gemini kaliti
  checks.gemini = {
    ok: hasGeminiKey(),
    detail: hasGeminiKey()
      ? "kalit bor — AI generatsiya ishlaydi"
      : "kalit yo'q — shablon asosida ishlaydi",
  };

  // 3) Sessiya kaliti
  checks.session = {
    ok: Boolean(process.env.AUTH_SECRET),
    detail: process.env.AUTH_SECRET
      ? "AUTH_SECRET o'rnatilgan"
      : "AUTH_SECRET yo'q — sessiyalar restartda o'ladi",
  };

  const healthy = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      ok: healthy,
      checks,
      time: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
