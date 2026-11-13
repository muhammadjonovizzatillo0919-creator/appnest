import type { AppSpec } from "./ai-generator";

/**
 * Vizual quruvchi uchun blok registri va layout logikasi.
 *
 * `layout` — foydalanuvchi tahrirlagan tuzilma:
 * {
 *   "platform": "web",
 *   "rows": [
 *     { "id": "r1", "type": "window", "blocks": [
 *        { "id": "b1", "component": "Hero", "props": {...}, "style": {...} }
 *     ]}
 *   ]
 * }
 */

export interface BuilderBlock {
  id: string;
  component: string;
  props: Record<string, unknown>;
  style?: Record<string, string>;
}

export interface BuilderRow {
  id: string;
  type: "window";
  blocks: BuilderBlock[];
}

/** Grid katagi (mobil quruvchi uchun) */
export interface GridCell {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Mobil blok — grid pozisiyasi bilan */
export interface MobileBlock extends BuilderBlock {
  grid: GridCell;
}

export interface BuilderLayout {
  platform: "web" | "mobile";
  /** Web quruvchi uchun — qatorlar */
  rows: BuilderRow[];
  /** Mobil quruvchi uchun — grid'dagi bloklar */
  blocks?: MobileBlock[];
}

export interface BlockMeta {
  name: string;
  label: string;
  group: "Navigatsiya" | "Kontent" | "Ma'lumot" | "Harakat" | "Bildirishnoma" | "Maket";
  description: string;
  icon: string;
  /** Property panelda tahrirlanadigan maydonlar */
  fields: {
    key: string;
    label: string;
    type: "text" | "textarea" | "select" | "number" | "boolean";
    options?: string[];
  }[];
}

export const BLOCK_REGISTRY: BlockMeta[] = [
  {
    name: "Navbar",
    label: "Navigatsiya",
    group: "Navigatsiya",
    description: "Yuqori panel — logo va menyu havolalari",
    icon: "M3 6h18M3 12h18M3 18h18",
    fields: [
      { key: "title", label: "Sarlavha", type: "text" },
      { key: "links", label: "Havolalar (vergul bilan)", type: "text" },
    ],
  },
  {
    name: "Hero",
    label: "Hero",
    group: "Kontent",
    description: "Katta sarlavha, izoh va tugma",
    icon: "M12 3l2 6 4 12 4-12z",
    fields: [
      { key: "title", label: "Sarlavha", type: "text" },
      { key: "subtitle", label: "Izoh", type: "textarea" },
      { key: "cta", label: "Tugma matni", type: "text" },
    ],
  },
  {
    name: "Card",
    label: "Karta",
    group: "Kontent",
    description: "Sarlavha va matn bilan karta",
    icon: "M3 5h18v14H3z",
    fields: [
      { key: "title", label: "Sarlavha", type: "text" },
      { key: "body", label: "Matn", type: "textarea" },
    ],
  },
  {
    name: "Grid",
    label: "Grid",
    group: "Maket",
    description: "Bloklarni ustma-ust joylashtiruvchi konteyner",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    fields: [{ key: "cols", label: "Ustunlar soni", type: "number" }],
  },
  {
    name: "Container",
    label: "Container",
    group: "Maket",
    description: "Maksimal kenglikdagi konteyner",
    icon: "M4 7h16v10H4z",
    fields: [],
  },
  {
    name: "StatCard",
    label: "Statistika",
    group: "Ma'lumot",
    description: "Qiymat va yorliq",
    icon: "M4 20V10M10 20V4M16 20v-6M22 20H2",
    fields: [
      { key: "title", label: "Yorliq", type: "text" },
      { key: "value", label: "Qiymat", type: "text" },
    ],
  },
  {
    name: "Table",
    label: "Jadval",
    group: "Ma'lumot",
    description: "Ma'lumotlar jadvali",
    icon: "M3 5h18v14H3zM3 10h18M9 10v9",
    fields: [{ key: "headers", label: "Ustunlar (vergul bilan)", type: "text" }],
  },
  {
    name: "Button",
    label: "Tugma",
    group: "Harakat",
    description: "Harakat tugmasi",
    icon: "M3 9h18v6H3z",
    fields: [
      { key: "label", label: "Matn", type: "text" },
      {
        key: "variant",
        label: "Variant",
        type: "select",
        options: ["primary", "secondary", "danger", "outline", "ghost"],
      },
    ],
  },
  {
    name: "Input",
    label: "Maydon",
    group: "Maket",
    description: "Matn kiritish maydoni",
    icon: "M3 8h18v8H3z",
    fields: [
      { key: "label", label: "Yorliq", type: "text" },
      { key: "placeholder", label: "Placeholder", type: "text" },
    ],
  },
  {
    name: "Badge",
    label: "Nishon",
    group: "Ma'lumot",
    description: "Holat yorlig'i",
    icon: "M12 3l3 5 5 6-1 4-6-5 6 1-3-5z",
    fields: [
      { key: "label", label: "Matn", type: "text" },
      {
        key: "color",
        label: "Rang",
        type: "select",
        options: ["blue", "green", "gray", "red", "yellow", "purple"],
      },
    ],
  },
  {
    name: "Dropdown",
    label: "Ro'yxat",
    group: "Maket",
    description: "Yopiladigan menyu",
    icon: "M6 9l6 6 6-6",
    fields: [
      { key: "label", label: "Yorliq", type: "text" },
      { key: "items", label: "Elementlar (vergul bilan)", type: "text" },
    ],
  },
  {
    name: "Alert",
    label: "Ogohlantirish",
    group: "Bildirishnoma",
    description: "Axborot/xato bloklari",
    icon: "M12 8v5M12 17h.01M12 3l9 16H3z",
    fields: [
      { key: "title", label: "Sarlavha", type: "text" },
      {
        key: "type",
        label: "Turi",
        type: "select",
        options: ["info", "success", "error", "warning"],
      },
    ],
  },
  {
    name: "Toast",
    label: "Toast",
    group: "Bildirishnoma",
    description: "Pastdagi bildirishnoma",
    icon: "M4 17h16M4 17V7h16v10",
    fields: [
      { key: "message", label: "Matn", type: "text" },
      {
        key: "type",
        label: "Turi",
        type: "select",
        options: ["success", "error", "info"],
      },
    ],
  },
  {
    name: "Loading",
    label: "Yuklanmoqda",
    group: "Bildirishnoma",
    description: "Spinner",
    icon: "M12 3v4M12 17v4M3 12h4M17 12h4",
    fields: [{ key: "label", label: "Matn", type: "text" }],
  },
  {
    name: "Footer",
    label: "Footer",
    group: "Navigatsiya",
    description: "Pastki panel",
    icon: "M3 16h18M3 20h18",
    fields: [{ key: "text", label: "Matn", type: "text" }],
  },
];

export const BLOCK_GROUPS = [
  "Navigatsiya",
  "Kontent",
  "Ma'lumot",
  "Harakat",
  "Maket",
  "Bildirishnoma",
] as const;

export function findBlockMeta(name: string): BlockMeta | undefined {
  return BLOCK_REGISTRY.find((b) => b.name === name);
}

/** AI spec'ini builder layout'iga aylantiradi */
export function specToLayout(spec: AppSpec): BuilderLayout {
  const rows: BuilderRow[] = [];

  for (const page of spec.pages) {
    for (const row of page.rows) {
      rows.push({
        id: row.id,
        type: "window",
        blocks: row.blocks.map((block) => ({
          id: block.id,
          component: block.component,
          props: block.props ?? {},
        })),
      });
    }
  }

  return { platform: spec.platform, rows };
}

/** Layoutni AI spec formatiga aylantiradi (saqlashda) */
export function layoutToSpec(layout: BuilderLayout): AppSpec {
  const pages = new Map<string, { id: string; name: string; route: string; purpose: string; rows: BuilderRow[] }>();

  for (const row of layout.rows) {
    const pageId = `p1`;
    if (!pages.has(pageId)) {
      pages.set(pageId, {
        id: pageId,
        name: "Bosh sahifa",
        route: "/",
        purpose: "Foydalanuvchi tahrirlagan sahifa",
        rows: [],
      });
    }
    pages.get(pageId)!.rows.push(row);
  }

  return {
    title: "Loyiha",
    category: "",
    platform: layout.platform,
    summary: "",
    pages: [...pages.values()],
    dataModels: [],
    features: [],
    generatedBy: "template",
  };
}

/* ── Blok amallari (immer usuli) ────────────────────────── */

export function addBlock(
  layout: BuilderLayout,
  rowId: string,
  block: BuilderBlock
): BuilderLayout {
  return {
    ...layout,
    rows: layout.rows.map((row) =>
      row.id === rowId ? { ...row, blocks: [...row.blocks, block] } : row
    ),
  };
}

export function removeBlock(
  layout: BuilderLayout,
  rowId: string,
  blockId: string
): BuilderLayout {
  return {
    ...layout,
    rows: layout.rows
      .map((row) =>
        row.id === rowId
          ? { ...row, blocks: row.blocks.filter((b) => b.id !== blockId) }
          : row
      )
      .filter((row) => row.blocks.length > 0),
  };
}

export function moveBlock(
  layout: BuilderLayout,
  fromRowId: string,
  blockId: string,
  toRowId: string,
  toIndex: number
): BuilderLayout {
  const block = layout.rows
    .flatMap((r) => r.blocks)
    .find((b) => b.id === blockId);
  if (!block) return layout;

  const withoutBlock = {
    ...layout,
    rows: layout.rows
      .map((row) =>
        row.id === fromRowId
          ? { ...row, blocks: row.blocks.filter((b) => b.id !== blockId) }
          : row
      )
      .filter((row) => row.blocks.length > 0),
  };

  return {
    ...withoutBlock,
    rows: withoutBlock.rows.map((row) => {
      if (row.id !== toRowId) return row;
      const blocks = [...row.blocks];
      blocks.splice(Math.max(0, Math.min(toIndex, blocks.length)), 0, block);
      return { ...row, blocks };
    }),
  };
}

export function updateBlockProps(
  layout: BuilderLayout,
  blockId: string,
  props: Record<string, unknown>
): BuilderLayout {
  return {
    ...layout,
    rows: layout.rows.map((row) => ({
      ...row,
      blocks: row.blocks.map((b) =>
        b.id === blockId ? { ...b, props: { ...b.props, ...props } } : b
      ),
    })),
  };
}

export function addRow(layout: BuilderLayout): BuilderLayout {
  const id = `r${Date.now().toString(36)}`;
  return {
    ...layout,
    rows: [
      ...layout.rows,
      { id, type: "window", blocks: [] },
    ],
  };
}

export function removeRow(layout: BuilderLayout, rowId: string): BuilderLayout {
  return {
    ...layout,
    rows: layout.rows.filter((row) => row.id !== rowId),
  };
}

/** Yangi blok uchun unikal id */
let idCounter = 0;

export const newBlockId = () => {
  idCounter = (idCounter + 1) % 1_000_000;
  return `b${Date.now().toString(36)}${idCounter.toString(36)}`;
};
