import type { BuilderBlock, GridCell, MobileBlock } from "./builder";

export type { GridCell, MobileBlock };

/**
 * Mobil Smart Grid — blok joylashuvi qoidalari.
 *
 * Foydalanuvchi mobil ilovani quradi. Aks holda tartibsiz tugmalar
 * paydo bo'ladi. Shu sababli har bir blok turi uchun **qoidalar** bor:
 *
 * - mumkin joylar  → **yashil**
 * - mumkin bo'lmagan joylar → **qizil**
 *
 * Tizim foydalanuvchiga xato qilishga yo'l qo'ymaydi.
 */

export const GRID_COLUMNS = 12;
export const ROW_HEIGHT = 72; // px
export const GRID_GAP = 12;

export interface GridContext {
  /** Boshqa bloklarning egallagan kataklari */
  occupied: GridCell[];
  /** Jami qatorlar soni */
  totalRows: number;
}

export interface PlacementResult {
  valid: boolean;
  reason?: string;
  /** Qoidalar nomi (UI da ko'rsatish uchun) */
  rule?: string;
}

/* в”Ђв”Ђ Blok turlari va ularning qoidalari в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */

export interface BlockRule {
  component: string;
  /** Ko'rsatiladigan nom */
  label: string;
  /** Minimal/ maksimal o'lcham */
  size?: { w?: number; h?: number };
  /** Qoidalar tavsifi (UI uchun) */
  note: string;
  /** Default o'lcham */
  defaultSize: { w: number; h: number };
}

/**
 * Blok qoidalari — mobil quruvchi uchun.
 * `h=1` bitta qator (72px).
 */
export const MOBILE_BLOCK_RULES: BlockRule[] = [
  {
    component: "Navbar",
    label: "Navigatsiya",
    size: { h: 1 },
    note: "Faqat ekranning eng yuqorida (1-qator)",
    defaultSize: { w: 12, h: 1 },
  },
  {
    component: "BottomNav",
    label: "Pastki menyu",
    size: { h: 1 },
    note: "Faqat ekranning eng pastida (oxirgi qator)",
    defaultSize: { w: 12, h: 1 },
  },
  {
    component: "Footer",
    label: "Footer",
    size: { h: 1 },
    note: "Faqat kontent tugagandan keyin (pastda)",
    defaultSize: { w: 12, h: 1 },
  },
  {
    component: "Hero",
    label: "Hero",
    size: { h: 3 },
    note: "Faqat yuqori qatorlarda (1—3-qator)",
    defaultSize: { w: 12, h: 3 },
  },
  {
    component: "Card",
    label: "Karta",
    note: "Erkin joylashadi",
    defaultSize: { w: 12, h: 2 },
  },
  {
    component: "Button",
    label: "Tugma",
    note: "Erkin joylashadi",
    defaultSize: { w: 6, h: 1 },
  },
  {
    component: "Input",
    label: "Maydon",
    note: "Erkin joylashadi",
    defaultSize: { w: 12, h: 1 },
  },
  {
    component: "Badge",
    label: "Nishon",
    note: "Erkin joylashadi",
    defaultSize: { w: 4, h: 1 },
  },
  {
    component: "Alert",
    label: "Ogohlantirish",
    note: "Erkin joylashadi",
    defaultSize: { w: 12, h: 1 },
  },
  {
    component: "Toast",
    label: "Toast",
    note: "Erkin joylashadi",
    defaultSize: { w: 12, h: 1 },
  },
  {
    component: "Loading",
    label: "Yuklanmoqda",
    note: "Erkin joylashadi",
    defaultSize: { w: 12, h: 1 },
  },
  {
    component: "StatCard",
    label: "Statistika",
    note: "Erkin joylashadi",
    defaultSize: { w: 6, h: 1 },
  },
  {
    component: "Table",
    label: "Jadval",
    note: "Erkin joylashadi",
    defaultSize: { w: 12, h: 2 },
  },
  {
    component: "Dropdown",
    label: "Ro'yxat",
    note: "Erkin joylashadi",
    defaultSize: { w: 12, h: 1 },
  },
];

export function findMobileRule(component: string): BlockRule | undefined {
  return MOBILE_BLOCK_RULES.find((r) => r.component === component);
}

/* в”Ђв”Ђ Kataklar bilan bog'liqlik yordamchilari в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */

export function cellsOverlap(a: GridCell, b: GridCell): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function withinGrid(cell: GridCell): boolean {
  return (
    cell.x >= 0 &&
    cell.y >= 0 &&
    cell.w > 0 &&
    cell.h > 0 &&
    cell.x + cell.w <= GRID_COLUMNS
  );
}

/* в”Ђв”Ђ Asosiy qoida tekshiruvi в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */

/**
 * Blokni berilgan katakka joylash mumkinmi?
 * @param component Blok nomi
 * @param position   Maqsad katak
 * @param context    Boshqa bloklar va jami qatorlar
 */
export function canPlace(
  component: string,
  position: GridCell,
  context: GridContext
): PlacementResult {
  // 1. Grid chegarasi
  if (!withinGrid(position)) {
    return {
      valid: false,
      rule: "OUT_OF_BOUNDS",
      reason: "Grid chegarasidan tashqarida",
    };
  }

  // 2. Boshqa bloklar bilan to'qnashuv
  //    (ko'chirilayotgan blok `occupied` dan allaqachon chiqarib tashlangan bo'lishi kerak)
  const collides = context.occupied.some((cell) => cellsOverlap(cell, position));

  if (collides) {
    return {
      valid: false,
      rule: "OVERLAP",
      reason: "Bu yerda boshqa blok turibdi",
    };
  }

  // 3. Turga xos qoidalar
  switch (component) {
    case "Navbar":
      if (position.y !== 0) {
        return {
          valid: false,
          rule: "NAVBAR_TOP",
          reason: "Navbar faqat ekranning eng yuqorida bo'lishi mumkin",
        };
      }
      break;

    case "BottomNav":
      if (position.y !== Math.max(0, context.totalRows - 1)) {
        return {
          valid: false,
          rule: "BOTTOMNAV_LAST",
          reason: "BottomNav faqat kontent tugagandan keyin bo'lishi mumkin",
        };
      }
      break;

    case "Footer":
      if (position.y < context.totalRows) {
        return {
          valid: false,
          rule: "FOOTER_BOTTOM",
          reason: "Footer kontentdan keyin, eng pastda bo'lishi kerak",
        };
      }
      break;

    case "Hero":
      if (position.y > 2) {
        return {
          valid: false,
          rule: "HERO_TOP",
          reason: "Hero faqat yuqori qatorlarda bo'lishi mumkin (1—3)",
        };
      }
      break;
  }

  return { valid: true };
}

/** Boshqa bloklarning egallagan kataklari */
export function occupiedCells(
  blocks: MobileBlock[],
  ignoreId?: string
): GridCell[] {
  return blocks.filter((b) => b.id !== ignoreId).map((b) => b.grid);
}

/** Bloklar ro'yxatidan jami qatorlar soni */
export function totalRows(blocks: MobileBlock[]): number {
  if (blocks.length === 0) return 1;
  return Math.max(...blocks.map((b) => b.grid.y + b.grid.h));
}

/** Bo'sh joy topish (blokni qo'yish uchun) */
export function findFreeSlot(
  component: string,
  blocks: MobileBlock[],
  preferred?: { x: number; y: number }
): GridCell | null {
  const rule = findMobileRule(component);
  const size = rule?.defaultSize ?? { w: 12, h: 1 };
  const rows = totalRows(blocks);

  // Maxsus qoidalar uchun aniq pozitsiyalar
  if (component === "Navbar") return { x: 0, y: 0, w: GRID_COLUMNS, h: 1 };
  if (component === "BottomNav") {
    return { x: 0, y: rows, w: GRID_COLUMNS, h: 1 };
  }
  if (component === "Footer") {
    return { x: 0, y: rows, w: GRID_COLUMNS, h: 1 };
  }
  if (component === "Hero") {
    const candidate = { x: 0, y: 1, w: GRID_COLUMNS, h: 3 };
    if (
      canPlace(component, candidate, { occupied: occupiedCells(blocks), totalRows: rows })
        .valid
    ) {
      return candidate;
    }
  }

  const startY = preferred?.y ?? 0;
  const startX = preferred?.x ?? 0;

  for (let y = startY; y < startY + 20; y++) {
    for (let x = startX; x <= GRID_COLUMNS - size.w; x++) {
      const candidate = { x, y, w: size.w, h: size.h };
      const result = canPlace(component, candidate, {
        occupied: occupiedCells(blocks),
        totalRows: rows,
      });
      if (result.valid) return candidate;
    }
  }

  // Oxirgi chora — eng pastga qo'yish
  const fallback = { x: 0, y: rows, w: size.w, h: size.h };
  return fallback;
}

/* в”Ђв”Ђ Ko'chirish va o'chirish в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */

export function placeBlock(
  blocks: MobileBlock[],
  blockId: string,
  position: GridCell
): MobileBlock[] {
  return blocks.map((b) => (b.id === blockId ? { ...b, grid: position } : b));
}

export function addMobileBlock(
  blocks: MobileBlock[],
  block: MobileBlock
): MobileBlock[] {
  return [...blocks, block];
}

export function removeMobileBlock(
  blocks: MobileBlock[],
  blockId: string
): MobileBlock[] {
  return blocks.filter((b) => b.id !== blockId);
}

/** Boshqa bloklarni qayta joylashtirish (Navbar tepaga, Footer pastga) */
export function normalizeMobileLayout(blocks: MobileBlock[]): MobileBlock[] {
  if (blocks.length === 0) return blocks;

  let result = [...blocks];

  // Navbar — tepaga
  const navbar = result.find((b) => b.component === "Navbar");
  if (navbar && navbar.grid.y !== 0) {
    result = result.map((b) =>
      b.id === navbar.id ? { ...b, grid: { ...b.grid, y: 0 } } : b
    );
  }

  // BottomNav va Footer — pastga
  const rows = totalRows(result);
  for (const name of ["BottomNav", "Footer"]) {
    const block = result.find((b) => b.component === name);
    if (block && block.grid.y < rows) {
      result = result.map((b) =>
        b.id === block.id ? { ...b, grid: { ...b.grid, y: rows } } : b
      );
    }
  }

  return result;
}

/** Web layout'dan mobil layout'ga o'tkazish */
export function webToMobile(rows: { blocks: BuilderBlock[] }[]): MobileBlock[] {
  const flat = rows.flatMap((row) => row.blocks);
  let y = 0;

  return flat.map((block) => {
    const rule = findMobileRule(block.component);
    const size = rule?.defaultSize ?? { w: 12, h: 1 };
    const mobileBlock: MobileBlock = {
      ...block,
      grid: { x: 0, y, w: size.w, h: size.h },
    };
    y += size.h;
    return mobileBlock;
  });
}

/** Grid koordinatini CSS uslulga aylantirish */
export function cellStyle(cell: GridCell): React.CSSProperties {
  return {
    gridColumn: `${cell.x + 1} / span ${cell.w}`,
    gridRow: `${cell.y + 1} / span ${cell.h}`,
    minHeight: cell.h * ROW_HEIGHT + (cell.h - 1) * GRID_GAP,
  };
}

