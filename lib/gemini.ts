import { GoogleGenAI } from "@google/genai";

/**
 * Gemini klienti — ilova spetsifikatsiyasini generatsiya qilish uchun.
 *
 * Model tanlash: murakkab so'rovlar uchun `gemini-2.5-pro`, qolgani uchun `flash`.
 * Kontekst cache: system prompt + JSON sxema 1 soatga keshlanadi (bepul kvotada tejamkorlik).
 */

export const MODELS = {
  fast: "gemini-3.5-flash",
  deep: "gemini-3.1-pro-preview",
} as const;

export type ModelName = (typeof MODELS)[keyof typeof MODELS];

/**
 * Model zanjiri — birinchi ishlamagan modelni keyingisiga o'tamiz.
 *
 * Sabablar:
 * - Ba'zi model yangi foydalanuvchilarga berilmaydi (404)
 * - Preview modellar vaqtincha band bo'lishi mumkin (503)
 * - Bepul kvota daqiqasiga limit qo'yadi (429)
 *
 * Shuning uchun har bir chaqiruvda zanjir bo'ylab sinab ko'ramiz.
 */
export const MODEL_CHAIN: Record<"fast" | "deep", string[]> = {
  // Bitta model, bitta urinish — serverless 60 s limitiga mos.
  // 3.8-flash 503, 3.1-pro 429 qaytargan — sinovdan o'tgan 3.5 ishlatamiz.
  fast: ["gemini-3.5-flash"],
  deep: ["gemini-3.5-flash"],
};

/** Har bir model chaqiruvining maksimal vaqti */
export const MODEL_TIMEOUT_MS = 28_000;

let client: GoogleGenAI | null = null;

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY topilmadi. `.env` faylida kalitni belgilang: https://aistudio.google.com/apikey"
    );
  }
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

/** Kontekst cache (1 soat) */
let cacheName: string | null = null;
let cacheModel: string | null = null;
let cachePending = false;

/**
 * Kontekst cache (1 soat) — system prompt va tool spetsiyalarini keshlaydi.
 *
 * ⚠️ Cache YARATISH sekin (1-2 sekund). Shuning uchun u so'rovning kritik
 * yo'lida bloklamaydi: `primeContextCache` fon rejimida yaratadi, keyin
 * keyingi so'rovlar undan foydalanadi.
 */
export async function primeContextCache(
  ai: GoogleGenAI,
  model: string,
  systemInstruction: string
): Promise<void> {
  if (cacheName && cacheModel === model) return;
  if (cachePending) return;

  cachePending = true;
  cacheModel = model;

  try {
    const cache = await ai.caches.create({
      model,
      config: {
        ttl: "3600s",
        systemInstruction,
        contents: [
          {
            role: "user",
            parts: [{ text: "Generate an app specification." }],
          },
          {
            role: "model",
            parts: [{ text: "Ready. Send the app brief." }],
          },
        ],
      },
    });

    cacheName = cache.name ?? null;
  } catch {
    cacheName = null;
  } finally {
    cachePending = false;
  }
}

/** Kesh tayyor bo'lsa — uni darhol qaytaradi */
export function getReadyCache(model: string): string | null {
  return cacheName && cacheModel === model ? cacheName : null;
}

