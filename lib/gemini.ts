import { GoogleGenAI } from "@google/genai";

/**
 * Gemini klienti вЂ” ilova spetsifikatsiyasini generatsiya qilish uchun.
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
 * Model zanjiri вЂ” birinchi ishlamagan modelni keyingisiga o'tamiz.
 *
 * Sabablar:
 * - Ba'zi model yangi foydalanuvchilarga berilmaydi (404)
 * - Preview modellar vaqtincha band bo'lishi mumkin (503)
 * - Bepul kvota daqiqasiga limit qo'yadi (429)
 *
 * Shuning uchun har bir chaqiruvda zanjir bo'ylab sinab ko'ramiz.
 */
export const MODEL_CHAIN: Record<"fast" | "deep", string[]> = {
  fast: ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.8-flash"],
  deep: ["gemini-3.1-pro-preview", "gemini-3.5-flash", "gemini-3.6-flash"],
};

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

export async function ensureContextCache(
  ai: GoogleGenAI,
  model: string,
  systemInstruction: string
): Promise<string | null> {
  if (cacheName && cacheModel === model) return cacheName;

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
    cacheModel = model;
    return cacheName;
  } catch {
    cacheName = null;
    cacheModel = model;
    return null;
  }
}

