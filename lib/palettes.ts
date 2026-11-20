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
    id: "appnest",
    name: "AppNest klassik",
    primary: "#0057FF",
    accent: "#00D287",
    background: "#0b1120",
    surface: "#111827",
    emoji: "🔵",
  },
  {
    id: "gold",
    name: "Oltin nurlar",
    primary: "#F5C451",
    accent: "#FF8A3D",
    background: "#1B1035",
    surface: "#251A47",
    emoji: "✨",
  },
  {
    id: "violet",
    name: "Binafsha tong",
    primary: "#A855F7",
    accent: "#EC4899",
    background: "#140B2E",
    surface: "#211443",
    emoji: "🟣",
  },
  {
    id: "emerald",
    name: "Zumrad bog'",
    primary: "#10B981",
    accent: "#84CC16",
    background: "#052E26",
    surface: "#0A3D33",
    emoji: "🟢",
  },
  {
    id: "coral",
    name: "Marjon quyoshi",
    primary: "#FF6B6B",
    accent: "#FFD93D",
    background: "#2B0F1A",
    surface: "#3D1626",
    emoji: "🔴",
  },
  {
    id: "ocean",
    name: "Okean chuqurligi",
    primary: "#0EA5E9",
    accent: "#22D3EE",
    background: "#082032",
    surface: "#0D2E47",
    emoji: "🌊",
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
