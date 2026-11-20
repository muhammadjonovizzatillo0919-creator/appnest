/**
 * AppNest ranglar palitrasi.
 *
 * Dunyodagi eng ommabop ranglar — Pantone "Yil rangi" (2018–2025)
 * va klassik mashhur ranglar asosida tuzilgan.
 * Foydalanuvchi shular ichidan o'zi xohlaganini tanlaydi.
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

/** Eng ommabop ranglar — Pantone yil ranglari va klassiklar */
export const PRESET_PALETTES: Palette[] = [
  {
    // Foydalanuvchi tanlagan asosiy palitra
    id: "peach-fuzz",
    name: "Peach Fuzz · Pantone 2024",
    primary: "#FFBE98",
    accent: "#FFD9C0",
    background: "#2A1913",
    surface: "#3D261D",
    emoji: "🍑",
  },
  {
    id: "classic-blue",
    name: "Classic Blue · Pantone 2020",
    primary: "#0F4C81",
    accent: "#6FA8DC",
    background: "#0A1A2F",
    surface: "#102940",
    emoji: "🔵",
  },
  {
    id: "viva-magenta",
    name: "Viva Magenta · Pantone 2023",
    primary: "#BB2649",
    accent: "#F4A6B7",
    background: "#1F0A14",
    surface: "#321020",
    emoji: "🌺",
  },
  {
    id: "mocha-mousse",
    name: "Mocha Mousse · Pantone 2025",
    primary: "#A47864",
    accent: "#D9BBA8",
    background: "#1A1310",
    surface: "#2A1E18",
    emoji: "☕",
  },
  {
    id: "very-peri",
    name: "Very Peri · Pantone 2022",
    primary: "#6667AB",
    accent: "#A5A5D6",
    background: "#12122A",
    surface: "#1E1E3D",
    emoji: "💜",
  },
  {
    id: "illuminating",
    name: "Illuminating · Pantone 2021",
    primary: "#F5DF4D",
    accent: "#FFF3A6",
    background: "#1F1C0A",
    surface: "#302B10",
    emoji: "💡",
  },
  {
    id: "living-coral",
    name: "Living Coral · Pantone 2019",
    primary: "#FF6F61",
    accent: "#FFB3AA",
    background: "#2A1210",
    surface: "#3D1C18",
    emoji: "🪸",
  },
  {
    id: "ultra-violet",
    name: "Ultra Violet · Pantone 2018",
    primary: "#5F4B8B",
    accent: "#9B86C4",
    background: "#150F26",
    surface: "#221A38",
    emoji: "💫",
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
