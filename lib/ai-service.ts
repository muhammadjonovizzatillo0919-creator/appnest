import {
  CATEGORIES,
  buildTemplateSpec,
  validateAppSpec,
  type AppSpec,
  type Platform,
} from "./ai-generator";
import {
  MODEL_CHAIN,
  MODEL_TIMEOUT_MS,
  getReadyCache,
  primeContextCache,
  getClient,
  hasGeminiKey,
} from "./gemini";

/**
 * Ilova spetsifikatsiyasini generatsiya qilish.
 *
 * Gemini kaliti bo'lsa → AI tahlil qiladi.
 * Yo'q bo'lsa yoki xato bersa → kategoriya shabloni (fallback).
 */

const SYSTEM_PROMPT = `Design a small app spec for a no-code builder. Return JSON only, no markdown, no commentary.

JSON: {"title":string,"category":string,"platform":"web","summary":string,"pages":[{"id":string,"name":string,"route":string,"purpose":string,"rows":[{"id":string,"type":"window","blocks":[{"id":string,"component":string,"props":object}]}]}],"dataModels":[{"name":string,"fields":[{"name":string,"type":string}]}],"features":string[]}

RULES: 2-3 pages. Each page has 2-3 rows. Each row has 2-3 blocks. Allowed components: Navbar, Hero, Card, Grid, Button, Input, Table, StatCard, Badge, Alert, Dropdown, Toast, Loading, Footer. Keep props short. IDs must be short and unique. features: 3 items. dataModels: 1-2 items.`;


export interface GenerateResult {
  spec: AppSpec;
  generatedBy: "gemini" | "template";
  model: string | null;
  durationMs: number;
  error?: string;
}

/**
 * Spetsifikatsiya yaratadi.
 * @param input.title        Loyiha nomi
 * @param input.category     Kategoriya kaliti (restoran | do-kon | maktab | universitet | boshqa)
 * @param input.brief        Foydalanuvchining erkin matni
 * @param input.platform     web | mobile
 */
export async function generateAppSpec(input: {
  title: string;
  category: string;
  brief?: string;
  platform?: Platform;
}): Promise<GenerateResult> {
  const startedAt = Date.now();
  const platform = input.platform ?? "web";

  // Gemini kaliti yo'q — shablon bilan ishlaymiz
  if (!hasGeminiKey()) {
    return {
      spec: buildTemplateSpec({ ...input, platform }),
      generatedBy: "template",
      model: null,
      durationMs: Date.now() - startedAt,
      error: "GEMINI_API_KEY topilmadi — shablon asosida spec yaratildi.",
    };
  }

  const ai = getClient();
  const useDeep = Boolean(input.brief && input.brief.length > 200);
  const chain = MODEL_CHAIN[useDeep ? "deep" : "fast"];

  const categoryList = CATEGORIES.map((c) => `- ${c.key}: ${c.label} — ${c.summary}`).join("\n");
  const known = CATEGORIES.find((c) => c.key === input.category.trim().toLowerCase());

  const prompt = `CATEGORY: ${input.category}${
    known ? ` (${known.label})` : " (not in the known list — design from the brief)"
  }

AVAILABLE CATEGORIES
${categoryList}

BRIEF
${input.brief?.trim() || "(bo'sh — kategoriya asosida loyiha yarat)"}

APP TITLE
${input.title.trim()}

PLATFORM
${platform}

Design the app specification now. JSON only.`;

  let lastError: unknown = null;
  let usedModel: string = chain[0];
  for (const candidate of chain) {
    try {
      // Kesh fon rejimida tayyorlanadi (so'rovni kechiktirmaydi)
      void primeContextCache(ai, candidate, SYSTEM_PROMPT);
      const cacheName = getReadyCache(candidate);

      const response = await ai.models.generateContent({
        model: candidate,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          ...(cacheName ? { cachedContent: cacheName } : {}),
          // Har bir modelga 18 s — bitta osib qolsa, keyingisiga o'tamiz.
          // Vercel serverless limiti 60 s, shuning uchun umumiy vaqt nazoratda.
          abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
        } as never,
      });

      const raw = response.text;
      if (!raw) throw new Error("AI bo'sh javob qaytardi");

      const parsed = JSON.parse(raw) as unknown;
      const validation = validateAppSpec(parsed);

      if (!validation.valid) {
        throw new Error(`AI natijasi to'g'ri emas: ${validation.errors.join(", ")}`);
      }

      const spec = parsed as AppSpec;

      return {
        spec: { ...spec, generatedBy: "gemini" },
        generatedBy: "gemini",
        model: candidate,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      lastError = error;
      usedModel = candidate;
      // Keyingi modelni sinab ko'ramiz
    }
  }

  // Barcha modellar ishlamadi — shablon bilan qaytaramiz
  return {
    spec: buildTemplateSpec({ ...input, platform }),
    generatedBy: "template",
    model: usedModel,
    durationMs: Date.now() - startedAt,
    error:
      lastError instanceof Error
        ? `AI ishlamadi (${lastError.message}) — shablon asosida spec yaratildi.`
        : "AI ishlamadi — shablon asosida spec yaratildi.",
  };
}
