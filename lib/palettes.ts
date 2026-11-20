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
    name: "AppNest Premium",
    primary: "#F5C451",
    accent: "#8B7CF6",
    background: "#1B1035",
    surface: "#0E1A3C",
    emoji: "✨",
  },
  {
    id: "gold",
    name: "Oltin tong",
    primary: "#E8B84B",
    accent: "#F19C6B",
    background: "#1A1226",
    surface: "#251A3D",
    emoji: "🌅",
  },
  {
    id: "violet",
    name: "Lavender Mist",
    primary: "#A78BFA",
    accent: "#D8B4FE",
    background: "#140E28",
    surface: "#1F173C",
    emoji: "🟣",
  },
  {
    id: "emerald",
    name: "Zumrad",
    primary: "#4ADE80",
    accent: "#A3E635",
    background: "#062A22",
    surface: "#0B3B30",
    emoji: "🟢",
  },
  {
    id: "coral",
    name: "Marjon",
    primary: "#FB7185",
    accent: "#FCD34D",
    background: "#2A1020",
    surface: "#3B1830",
    emoji: "🔴",
  },
  {
    id: "ocean",
    name: "Okean",
    primary: "#38BDF8",
    accent: "#7DD3FC",
    background: "#071E30",
    surface: "#0C2C44",
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
