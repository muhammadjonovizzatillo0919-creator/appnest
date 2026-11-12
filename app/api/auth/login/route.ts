import { NextResponse } from "next/server";
import { userStore } from "@/lib/user-store";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 * body: { email, password }
 * Muvaffaqiyatli bo'lsa — httpOnly sessiya cookie qo'yiladi.
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
    return NextResponse.json(
      { error: "Email yoki parol noto'g'ri" },
      { status: 401 }
    );
  }

  const token = createSessionToken(user.id);
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
  });

  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
