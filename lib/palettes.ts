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
    // Tavsiya #1 — eng zamonaviy: chuqur qora + indigo
    id: "appnest",
    name: "Noir Indigo",
    primary: "#6366F1",
    accent: "#A5B4FC",
    background: "#0B0B14",
    surface: "#151527",
    emoji: "🌌",
  },
  {
    // Tavsiya #2 — iliq premium: rose gold
    id: "gold",
    name: "Rose Gold",
    primary: "#F43F5E",
    accent: "#FDA4AF",
    background: "#1A0F14",
    surface: "#2A1620",
    emoji: "🌸",
  },
  {
    id: "violet",
    name: "Sage Mist",
    primary: "#2DD4BF",
    accent: "#5EEAD4",
    background: "#0F1F1C",
    surface: "#16302B",
    emoji: "🌿",
  },
  {
    id: "emerald",
    name: "Cream Cocoa",
    primary: "#D97706",
    accent: "#FCD34D",
    background: "#1C1917",
    surface: "#292524",
    emoji: "☕",
  },
  {
    id: "coral",
    name: "Cyber Lime",
    primary: "#A3E635",
    accent: "#FDE047",
    background: "#0C0F0A",
    surface: "#171C12",
    emoji: "⚡",
  },
  {
    id: "ocean",
    name: "Ocean Deep",
    primary: "#0EA5E9",
    accent: "#38BDF8",
    background: "#071620",
    surface: "#0D2C40",
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
