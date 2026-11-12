import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";

/**
 * Autentifikatsiya yordamchilari.
 *
 * - Parol hash: `scrypt` (Node.js'ning o'z kiritilgan funksiyasi — qo'shimcha
 *   paket yoki native build kerak emas)
 * - Sessiya: HMAC imzolangan cookie (httpOnly, sameSite=lax)
 */

const SCRYPT_KEYLEN = 64;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 kun

export const SESSION_COOKIE = "appnest_session";

/** Sessiya imzolash kaliti. Production'da muhit o'zgaruvchisidan olinadi. */
function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;

  if (process.env.NODE_ENV === "production") {
    // Production'da kalit bo'lmasa — tasodifiy kalit (sessiyalar restartda o'ladi)
    console.warn(
      "[auth] AUTH_SECRET belgilanmagan — sessiyalar serverga qayta ishga tushganda bekor bo'ladi."
    );
    return randomBytes(32).toString("hex");
  }

  // Development uchun barqaror kalit
  return "appnest-development-secret-do-not-use-in-production";
}

/** Parolni hash qiladi: `salt:hash` formatida */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${derived}`;
}

/** Parolni tekshiradi (vaqt bo'yicha barqaror taqqoslash) */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  try {
    const derived = scryptSync(password, salt, SCRYPT_KEYLEN);
    const expected = Buffer.from(hash, "hex");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** Sessiya tokenini yaratadi: `base64(payload).signature` */
export function createSessionToken(userId: string): string {
  const payload = JSON.stringify({
    uid: userId,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = createHmac("sha256", getSecret())
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

/** Sessiya tokenini tekshiradi va userId ni qaytaradi (yoki null) */
export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = createHmac("sha256", getSecret())
    .update(encoded)
    .digest("base64url");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as {
      uid: string;
      exp: number;
    };
    if (!payload.uid || Date.now() > payload.exp) return null;
    return payload.uid;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
