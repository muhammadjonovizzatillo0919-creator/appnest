import {
  CATEGORIES,
  buildTemplateSpec,
  validateAppSpec,
  type AppSpec,
  type Platform,
} from "./ai-generator";
import {
  MODEL_CHAIN,
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

const SYSTEM_PROMPT = `You are the AI architect of "AppNest", a no-code app builder for people who cannot code.

Given a business CATEGORY and a free-text BRIEF, you design a complete application specification.

RULES
- Design PAGES the user actually needs for this business (2 to 5 pages).
- Each page contains ROWS. A row is a vertical section ("window") containing 1 to 4 BLOCKS.
- Only use these block components: Navbar, Hero, Card, Grid, Button, Input, Table, StatCard, Badge, Alert, Dropdown, Toast, Loading, Footer.
- Keep the structure simple and buildable. Every block must have sensible default props.
- dataModels lists the data the app stores, with field names and types.
- features lists 3 to 6 user-facing capabilities.
- summary is one clear sentence describing the app.
- Respond with JSON only. No markdown fences, no commentary.

OUTPUT SCHEMA
{
  "title": string,
  "category": string,
  "platform": "web" | "mobile",
  "summary": string,
  "pages": [
    {
      "id": string,
      "name": string,
      "route": string,
      "purpose": string,
      "rows": [
        {
          "id": string,
          "type": "window",
          "blocks": [
            { "id": string, "component": string, "props": object }
          ]
        }
      ]
    }
  ],
  "dataModels": [
    { "name": string, "fields": [{ "name": string, "type": string }] }
  ],
  "features": string[]
}`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    category: { type: "string" },
    platform: { type: "string", enum: ["web", "mobile"] },
    summary: { type: "string" },
    pages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          route: { type: "string" },
          purpose: { type: "string" },
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string" },
                blocks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      component: { type: "string" },
                      props: { type: "object" },
                    },
                    required: ["id", "component", "props"],
                  },
                },
              },
              required: ["id", "type", "blocks"],
            },
          },
        },
        required: ["id", "name", "route", "purpose", "rows"],
      },
    },
    dataModels: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string" },
              },
              required: ["name", "type"],
            },
          },
        },
        required: ["name", "fields"],
      },
    },
    features: { type: "array", items: { type: "string" } },
  },
  required: ["title", "category", "platform", "summary", "pages", "dataModels", "features"],
} as const;

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
          responseSchema: RESPONSE_SCHEMA as never,
          ...(cacheName ? { cachedContent: cacheName } : {}),
        },
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
