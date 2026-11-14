/**
 * Rate limiting — IP bo'yicha oddiy token chelkasi.
 *
 * Autentifikatsiya endpoint'lariga hujum (brute force, ro'yxatdan o'tish spam)
 * dan himoya qiladi. Serverless muhitda jarayon o'zgarishi mumkin —
 * shuning uchun bu "yaxshi qoralash", maksimal kafolat emas.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Ba'zi misollarda eskirgan chelkalarni tozalash */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * So'rovni tekshiradi.
 * @param key    O'ziga xos kalit (masalan IP + route)
 * @param limit  Vaqt oralig'ida ruxsat etilgan so'rovlar soni
 * @param windowSeconds  Vaqt oralig'i (sekund)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    retryAfterSeconds: 0,
  };
}

/** So'rov IP manzilini oladi (Vercel'da `x-forwarded-for` orqali) */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
