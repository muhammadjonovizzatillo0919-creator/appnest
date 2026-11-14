import { NextResponse } from "next/server";
import { userStore } from "@/lib/user-store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  SESSION_COOKIE,
  createSessionToken,
  getSessionCookieOptions,
  isSecureRequest,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 * body: { email, password }
 * Muvaffaqiyatli bo'lsa — httpOnly sessiya cookie qo'yiladi.
 *
 * Rate limit: faqat **muvaffaqiyatsiz** urinishlar hisoblanadi
 * (IP bo'yicha daqiqada 10 ta) — muvaffaqiyatli kirish cheklanmaydi.
 */
export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email va parolni kiriting" }, { status: 400 });
  }

  const user = await userStore.findByEmail(email);

  // Xato javob har doim bir xil — foydalanuvchi mavjudligini oshkor qilmaydi
  if (!user || !verifyPassword(password, user.passwordHash)) {
    // Faqat muvaffaqiyatsiz urinishlar limitga hisoblanadi
    const limit = rateLimit(`login:${clientIp(req)}`, 10, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Juda ko'p urinishlar. ${limit.retryAfterSeconds} soniya kutib, qayta urinib ko'ring.`,
        },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    return NextResponse.json(
      { error: "Email yoki parol noto'g'ri" },
      { status: 401 }
    );
  }

  const token = await createSessionToken(user.id);
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
  });

  response.cookies.set(
    SESSION_COOKIE,
    token,
    getSessionCookieOptions(isSecureRequest(req))
  );
  return response;
}
