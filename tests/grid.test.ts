// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  GRID_COLUMNS,
  MOBILE_BLOCK_RULES,
  addMobileBlock,
  canPlace,
  cellsOverlap,
  findFreeSlot,
  findMobileRule,
  normalizeMobileLayout,
  occupiedCells,
  placeBlock,
  removeMobileBlock,
  totalRows,
  webToMobile,
  type MobileBlock,
} from "@/lib/grid";

const block = (
  id: string,
  component: string,
  grid: MobileBlock["grid"]
): MobileBlock => ({ id, component, props: {}, grid });

describe("grid qoidalari", () => {
  it("12 ustun va har bir blok turi uchun qoida bor", () => {
    expect(GRID_COLUMNS).toBe(12);
    expect(MOBILE_BLOCK_RULES.length).toBeGreaterThan(10);
    for (const rule of MOBILE_BLOCK_RULES) {
      expect(rule.note.length).toBeGreaterThan(5);
      expect(rule.defaultSize.w).toBeLessThanOrEqual(GRID_COLUMNS);
    }
  });

  it("qoidalar topiladi", () => {
    expect(findMobileRule("Navbar")?.note).toContain("yuqorida");
    expect(findMobileRule("Hero")?.defaultSize.h).toBe(3);
    expect(findMobileRule("Noma'lum")).toBeUndefined();
  });
});

describe("kataklar to'qnashuvi", () => {
  it("qo'shilgan kataklar to'qnashadi", () => {
    expect(
      cellsOverlap({ x: 0, y: 0, w: 6, h: 1 }, { x: 3, y: 0, w: 6, h: 1 })
    ).toBe(true);
  });

  it("qo'shilmagan kataklar to'qnashmaydi", () => {
    expect(
      cellsOverlap({ x: 0, y: 0, w: 6, h: 1 }, { x: 6, y: 0, w: 6, h: 1 })
    ).toBe(false);
    expect(
      cellsOverlap({ x: 0, y: 0, w: 6, h: 1 }, { x: 0, y: 2, w: 6, h: 1 })
    ).toBe(false);
  });
});

describe("joylash qoidalari", () => {
  it("Navbar faqat yuqorida", () => {
    const ok = canPlace(
      "Navbar",
      { x: 0, y: 0, w: 12, h: 1 },
      { occupied: [], totalRows: 3 }
    );
    expect(ok.valid).toBe(true);

    const bad = canPlace(
      "Navbar",
      { x: 0, y: 2, w: 12, h: 1 },
      { occupied: [], totalRows: 3 }
    );
    expect(bad.valid).toBe(false);
    expect(bad.rule).toBe("NAVBAR_TOP");
  });

  it("BottomNav faqat oxirgi qatorda", () => {
    const ok = canPlace(
      "BottomNav",
      { x: 0, y: 4, w: 12, h: 1 },
      { occupied: [], totalRows: 5 }
    );
    expect(ok.valid).toBe(true);

    const bad = canPlace(
      "BottomNav",
      { x: 0, y: 1, w: 12, h: 1 },
      { occupied: [], totalRows: 5 }
    );
    expect(bad.valid).toBe(false);
    expect(bad.rule).toBe("BOTTOMNAV_LAST");
  });

  it("Footer kontentdan keyin bo'lishi kerak", () => {
    const bad = canPlace(
      "Footer",
      { x: 0, y: 1, w: 12, h: 1 },
      { occupied: [], totalRows: 4 }
    );
    expect(bad.valid).toBe(false);
    expect(bad.rule).toBe("FOOTER_BOTTOM");

    const ok = canPlace(
      "Footer",
      { x: 0, y: 4, w: 12, h: 1 },
      { occupied: [], totalRows: 4 }
    );
    expect(ok.valid).toBe(true);
  });

  it("Hero faqat yuqorida", () => {
    const ok = canPlace(
      "Hero",
      { x: 0, y: 1, w: 12, h: 3 },
      { occupied: [], totalRows: 6 }
    );
    expect(ok.valid).toBe(true);

    const bad = canPlace(
      "Hero",
      { x: 0, y: 5, w: 12, h: 3 },
      { occupied: [], totalRows: 8 }
    );
    expect(bad.valid).toBe(false);
    expect(bad.rule).toBe("HERO_TOP");
  });

  it("boshqa blok bilan to'qnashuv rad etiladi", () => {
    const existing = block("b1", "Card", { x: 0, y: 0, w: 12, h: 2 });
    const result = canPlace(
      "Button",
      { x: 0, y: 1, w: 6, h: 1 },
      { occupied: occupiedCells([existing]), totalRows: 2 }
    );
    expect(result.valid).toBe(false);
    expect(result.rule).toBe("OVERLAP");
  });

  it("grid chegarasidan tashqarida rad etiladi", () => {
    const result = canPlace(
      "Button",
      { x: 10, y: 0, w: 6, h: 1 },
      { occupied: [], totalRows: 2 }
    );
    expect(result.valid).toBe(false);
    expect(result.rule).toBe("OUT_OF_BOUNDS");
  });
});

describe("blok joylash va ko'chirish", () => {
  it("blok qo'shiladi va o'chiriladi", () => {
    const blocks: MobileBlock[] = [];
    const added = addMobileBlock(blocks, block("b1", "Card", { x: 0, y: 0, w: 12, h: 2 }));
    expect(added).toHaveLength(1);

    const removed = removeMobileBlock(added, "b1");
    expect(removed).toHaveLength(0);
  });

  it("blok ko'chiriladi", () => {
    const blocks = [block("b1", "Card", { x: 0, y: 0, w: 6, h: 2 })];
    const moved = placeBlock(blocks, "b1", { x: 6, y: 3, w: 6, h: 2 });
    expect(moved[0].grid).toEqual({ x: 6, y: 3, w: 6, h: 2 });
  });

  it("jami qatorlar hisoblanadi", () => {
    const blocks = [
      block("b1", "Card", { x: 0, y: 0, w: 12, h: 2 }),
      block("b2", "Card", { x: 0, y: 2, w: 12, h: 3 }),
    ];
    expect(totalRows(blocks)).toBe(5);
  });

  it("bo'sh joy topib beradi", () => {
    const blocks = [block("b1", "Card", { x: 0, y: 0, w: 12, h: 2 })];
    const slot = findFreeSlot("Button", blocks);
    expect(slot).not.toBeNull();
    expect(slot!.y).toBeGreaterThanOrEqual(0);
  });

  it("Navbar uchun slot har doim tepada", () => {
    const slot = findFreeSlot("Navbar", []);
    expect(slot).toEqual({ x: 0, y: 0, w: 12, h: 1 });
  });

  it("Footer va BottomNav pastga joylashadi", () => {
    const blocks = [block("b1", "Card", { x: 0, y: 0, w: 12, h: 2 })];
    const footerSlot = findFreeSlot("Footer", blocks);
    expect(footerSlot!.y).toBe(2);
  });
});

describe("layout normalizatsiyasi", () => {
  it("Navbar tepaga, Footer pastga suriladi", () => {
    const blocks = [
      block("nav", "Navbar", { x: 0, y: 5, w: 12, h: 1 }),
      block("card", "Card", { x: 0, y: 0, w: 12, h: 2 }),
      block("foot", "Footer", { x: 0, y: 1, w: 12, h: 1 }),
    ];

    const result = normalizeMobileLayout(blocks);
    const nav = result.find((b) => b.id === "nav")!;
    const foot = result.find((b) => b.id === "foot")!;

    expect(nav.grid.y).toBe(0);
    expect(foot.grid.y).toBeGreaterThanOrEqual(2);
  });
});

describe("web → mobil konversiya", () => {
  it("qatorlar flat bloklarga aylanadi", () => {
    const web = [
      { blocks: [{ id: "b1", component: "Navbar", props: {} }] },
      { blocks: [{ id: "b2", component: "Hero", props: {} }] },
    ];

    const mobile = webToMobile(web);
    expect(mobile).toHaveLength(2);
    expect(mobile[0].grid.y).toBe(0);
    expect(mobile[1].grid.y).toBe(1);
  });
});
