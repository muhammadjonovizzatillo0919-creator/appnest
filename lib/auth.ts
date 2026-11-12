import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";

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

const SECRET_FILE = path.join(process.cwd(), ".data", "secret");

/**
 * Sessiya kaliti.
 *
 * 1) `AUTH_SECRET` muhit o'zgaruvchisi (production uchun shuni belgilang)
 * 2) Aks holda — `.data/secret` faylida barqaror saqlanadigan tasodifiy kalit.
 *
 * ⚠️ Muhim: har so'rovda yangi kalit yaratilsa, sessiyalar hech qachon
 * tasdiqlanmaydi — shuning uchun kalit barqaror saqlanadi.
 */
let cachedSecret: string | null = null;

async function resolveSecret(): Promise<string> {
  if (cachedSecret) return cachedSecret;

  const fromEnv = process.env.AUTH_SECRET;
  if (fromEnv && fromEnv.length >= 16) {
    cachedSecret = fromEnv;
    return cachedSecret;
  }

  try {
    const existing = (await fs.readFile(SECRET_FILE, "utf8")).trim();
    if (existing.length >= 32) {
      cachedSecret = existing;
      return cachedSecret;
    }
  } catch {
    // fayl yo'q — yaratamiz
  }

  const generated = randomBytes(32).toString("hex");
  try {
    await fs.mkdir(path.dirname(SECRET_FILE), { recursive: true });
    await fs.writeFile(SECRET_FILE, generated, "utf8");
  } catch {
    // yozib bo'lmasa ham sessiya ishlaydi (faqat restartda o'ladi)
  }

  cachedSecret = generated;
  return cachedSecret;
}

/** Sinxron variant (proxy va route handler'lar uchun) */
function getSecret(): string {
  if (cachedSecret) return cachedSecret;

  const fromEnv = process.env.AUTH_SECRET;
  if (fromEnv && fromEnv.length >= 16) {
    cachedSecret = fromEnv;
    return cachedSecret;
  }

  try {
    const existing = readFileSync(SECRET_FILE, "utf8").trim();
    if (existing.length >= 32) {
      cachedSecret = existing;
      return cachedSecret;
    }
  } catch {
    /* ignore */
  }

  cachedSecret = randomBytes(32).toString("hex");
  console.warn(
    "[auth] AUTH_SECRET belgilanmagan — vaqtinchalik kalit ishlatilmoqda. " +
      "Production uchun .env ga AUTH_SECRET qo'ying."
  );
  return cachedSecret;
}

/** Promise bilan kalitni olish (server route'lar uchun) */
export const ensureSecret = resolveSecret;

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
export async function createSessionToken(userId: string): Promise<string> {
  const secret = await resolveSecret();
  const payload = JSON.stringify({
    uid: userId,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = createHmac("sha256", secret)
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

/**
 * Cookie sozlamalari.
 *
 * `secure` faqat HTTPS so'rovlar uchun — lokal development'da
 * `http://localhost` orqali ishlatilishi kerak.
 */
export function getSessionCookieOptions(isSecure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isSecure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/** So'rov HTTPS orqali kelayotganini aniqlaydi */
export function isSecureRequest(req: Request): boolean {
  const forwarded = req.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded === "https";

  const host = req.headers.get("host") ?? "";
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]");

  return !isLocal && process.env.NODE_ENV === "production";
}
