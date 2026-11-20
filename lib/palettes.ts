/**
 * AppNest ranglar palitrasi.
 *
 * Ikki xil ishlatiladi:
 * 1. Foydalanuvchi ish muhiti (dashboard) rangi — user.accentColor
 * 2. Generatsiya qilinadigan loyiha rangi — project.palette
 *
 * Ranglar CSS o'zgaruvchilari orqali qo'llanadi: --brand, --brand-accent.
 */

export interface Palette {
  /** Ichki kalit (saqlash uchun) */
  id: string;
  /** Foydalanuvchiga ko'rinadigan nom */
  name: string;
  /** Asosiy rang */
  primary: string;
  /** Qo'shimcha rang */
  accent: string;
  /** Fon rangi (loyiha ichi uchun) */
  background: string;
  /** Yuzalar rangi */
  surface: string;
  /** Belgilar (emoji) */
  emoji: string;
}

/** Tayyor palitralar — foydalanuvchi bir bosishda tanlaydi */
export const PRESET_PALETTES: Palette[] = [
  {
    // Qizil + to'q ko'k + oq + moviy (asosiy tavsiya)
    id: "appnest",
    name: "Crimson Navy",
    primary: "#E63946",
    accent: "#3B82F6",
    background: "#0E1A3C",
    surface: "#16264F",
    emoji: "🇺🇿",
  },
  {
    id: "gold",
    name: "Red Sky",
    primary: "#EF4444",
    accent: "#60A5FA",
    background: "#111C3A",
    surface: "#1B2C55",
    emoji: "🌅",
  },
  {
    id: "violet",
    name: "Fire & Ice",
    primary: "#DC2626",
    accent: "#38BDF8",
    background: "#0B1733",
    surface: "#132450",
    emoji: "🔥",
  },
  {
    id: "emerald",
    name: "Azure Rouge",
    primary: "#F43F5E",
    accent: "#2563EB",
    background: "#0A1633",
    surface: "#13224A",
    emoji: "💙",
  },
  {
    id: "coral",
    name: "Scarlet Blue",
    primary: "#B91C1C",
    accent: "#0EA5E9",
    background: "#0F172A",
    surface: "#1A2645",
    emoji: "⚔️",
  },
  {
    id: "ocean",
    name: "Patriot",
    primary: "#E63946",
    accent: "#1D4ED8",
    background: "#0E1A3C",
    surface: "#1A2C5A",
    emoji: "⭐",
  },
];

/** Standart palitra (eski foydalanuvchilar uchun) */
export const DEFAULT_PALETTE = PRESET_PALETTES[0];

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Rang qiymatini tekshiradi va normalizatsiya qiladi.
 * Noto'g'ri qiymat → null (chaqiruvchi standart rangga tushadi).
 */
export function normalizeColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!HEX_RE.test(trimmed)) return null;

  // #abc → #aabbcc
  if (trimmed.length === 4) {
    return (
      "#" +
      trimmed[1] +
      trimmed[1] +
      trimmed[2] +
      trimmed[2] +
      trimmed[3] +
      trimmed[3]
    ).toLowerCase();
  }
  return trimmed.toLowerCase();
}

/**
 * Saqlangan qiymatdan palitra olish.
 * Kalit bo'yicha tayyor palitra yoki custom hex bo'lishi mumkin.
 */
export function resolvePalette(value?: string | null): Palette {
  if (!value) return DEFAULT_PALETTE;

  const preset = PRESET_PALETTES.find((p) => p.id === value);
  if (preset) return preset;

  // To'g'ridan-to'g'ri hex kiritilgan bo'lsa — undan palitra yasaymiz
  const primary = normalizeColor(value);
  if (primary) {
    return {
      id: "custom",
      name: "Maxsus palitra",
      primary,
      accent: primary,
      background: "#0b1120",
      surface: "#111827",
      emoji: "🎨",
    };
  }

  return DEFAULT_PALETTE;
}

/** Foydalanuvchi saqlaydigan qiymat: preset id yoki hex */
export function normalizePaletteValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (PRESET_PALETTES.some((p) => p.id === trimmed)) return trimmed;
  return normalizeColor(trimmed);
}

/** CSS o'zgaruvchilari sifatida qo'llash uchun */
export function paletteToCss(palette: Palette): Record<string, string> {
  return {
    "--brand": palette.primary,
    "--brand-accent": palette.accent,
    "--palette-background": palette.background,
    "--palette-surface": palette.surface,
  };
}

/** AI promptiga uzatish uchun qisqa tavsif */
export function paletteToPrompt(palette: Palette): string {
  return [
    `Primary color: ${palette.primary}`,
    `Accent color: ${palette.accent}`,
    `Dark background: ${palette.background}`,
    `Surface color: ${palette.surface}`,
  ].join("\n");
}
