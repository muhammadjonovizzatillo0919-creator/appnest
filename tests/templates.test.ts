// @vitest-environment node
import { describe, expect, it } from "vitest";
import { PROJECT_TEMPLATES, findTemplate } from "@/data/templates";

describe("namuna loyihalar", () => {
  it("4 ta namuna mavjud", () => {
    expect(PROJECT_TEMPLATES.length).toBe(4);
  });

  it("har biri to'liq ma'lumotga ega", () => {
    for (const tpl of PROJECT_TEMPLATES) {
      expect(tpl.title.length).toBeGreaterThan(3);
      expect(tpl.category.length).toBeGreaterThan(0);
      expect(tpl.brief.length).toBeGreaterThan(10);
      expect(tpl.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(tpl.emoji.length).toBeGreaterThan(0);
    }
  });

  it("har birida bloklar bor", () => {
    for (const tpl of PROJECT_TEMPLATES) {
      expect(tpl.layout.rows.length).toBeGreaterThanOrEqual(3);

      const total = tpl.layout.rows.reduce(
        (sum, row) => sum + row.blocks.length,
        0
      );
      expect(total).toBeGreaterThan(3);
    }
  });

  it("blok id'lari unikal (har bir loyiha ichida)", () => {
    for (const tpl of PROJECT_TEMPLATES) {
      const ids = tpl.layout.rows.flatMap((r) => r.blocks.map((b) => b.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("qator id'lari unikal", () => {
    for (const tpl of PROJECT_TEMPLATES) {
      const ids = tpl.layout.rows.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("kalit bo'yicha topiladi", () => {
    expect(findTemplate("restoran")?.title).toBe("Restoran menyusi");
    expect(findTemplate("noma'lum")).toBeUndefined();
  });

  it("Navbar va Footer har bir namanada bor", () => {
    for (const tpl of PROJECT_TEMPLATES) {
      const components = tpl.layout.rows.flatMap((r) =>
        r.blocks.map((b) => b.component)
      );
      expect(components).toContain("Navbar");
      expect(components).toContain("Footer");
    }
  });
});
