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
    // Noyob: chang pushti + chuqur olxo'ri
    id: "appnest",
    name: "Dusty Plum",
    primary: "#D8A7B8",
    accent: "#6B2D5C",
    background: "#1A0F1C",
    surface: "#2A1A2E",
    emoji: "🌫️",
  },
  {
    // Noyob: mox yashil + olov apelsin
    id: "gold",
    name: "Moss & Ember",
    primary: "#7C9A6D",
    accent: "#D9713F",
    background: "#141A12",
    surface: "#1E271B",
    emoji: "🍂",
  },
  {
    // Noyob: sienna + kulrang ko'k
    id: "violet",
    name: "Sienna Blue",
    primary: "#C96F4A",
    accent: "#6E8BA8",
    background: "#12161F",
    surface: "#1D2432",
    emoji: "🏜️",
  },
  {
    // Noyob: shaftoli + chuqur teal
    id: "emerald",
    name: "Peach Teal",
    primary: "#F5A98C",
    accent: "#1F7A75",
    background: "#0E1A1A",
    surface: "#152626",
    emoji: "🍑",
  },
  {
    // Noyob: lavanda kulrang + xantal
    id: "coral",
    name: "Lavender Mustard",
    primary: "#9C8FB5",
    accent: "#D8A928",
    background: "#16141F",
    surface: "#221F30",
    emoji: "🌾",
  },
  {
    // Noyob: bordo + shampan
    id: "ocean",
    name: "Burgundy Champagne",
    primary: "#8C2F4B",
    accent: "#E8D3A0",
    background: "#1A0F12",
    surface: "#2A181E",
    emoji: "🥂",
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
