import { NextResponse } from "next/server";
import { userStore } from "@/lib/user-store";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/register
 * body: { name, email, password }
 *
 * Rate limit: IP bo'yicha daqiqada 5 ta ro'yxatdan o'tish.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`register:${clientIp(req)}`, 5, 60);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Juda ko'p urinishlar. ${limit.retryAfterSeconds} soniya kutib, qayta urinib ko'ring.`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  if (name.length < 2) {
    return NextResponse.json({ error: "Ism kamida 2 ta belgidan iborat bo'lishi kerak" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email manzili noto'g'ri" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" }, { status: 400 });
  }

  try {
    const user = await userStore.create({ name, email, password });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "Bu email bilan ro'yxatdan o'tilgan" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Ro'yxatdan o'tishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
