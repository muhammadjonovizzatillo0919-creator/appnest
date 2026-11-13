import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./auth";
import { userStore, type StoredUser } from "./user-store";

/**
 * Joriy sessiya foydalanuvchisini oladi (API route'lar uchun).
 * Sessiya yo'q yoki muddati o'tgan bo'lsa → null.
 */
export async function getCurrentUser(): Promise<StoredUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const userId = verifySessionToken(token);

  if (!userId) return null;

  return userStore.findById(userId);
}

/** Standart javob: 401 (tizimga kirmagan) */
export function unauthorized(message = "Tizimga kiring") {
  return NextResponse.json({ error: message }, { status: 401 });
}

/** Standart javob: 403 (ruxsat yo'q) */
export function forbidden(message = "Ruxsat yo'q") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/** Standart javob: 400 (noto'g'ri so'rov) */
export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
