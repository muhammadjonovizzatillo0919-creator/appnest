// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  buildTemplateSpec,
  findCategory,
  validateAppSpec,
} from "@/lib/ai-generator";

describe("kategoriyalar", () => {
  it("barcha asosiy kategoriyalar mavjud", () => {
    const keys = CATEGORIES.map((c) => c.key);
    expect(keys).toContain("restoran");
    expect(keys).toContain("do-kon");
    expect(keys).toContain("maktab");
    expect(keys).toContain("universitet");
  });

  it("har bir kategoriyada kamida 2 ta sahifa va 1 ta model bor", () => {
    for (const category of CATEGORIES) {
      expect(category.pages.length).toBeGreaterThanOrEqual(2);
      expect(category.dataModels.length).toBeGreaterThanOrEqual(1);
      expect(category.summary.length).toBeGreaterThan(10);
    }
  });

  it("kategoriya kaliti bo'yicha topiladi", () => {
    expect(findCategory("restoran")?.label).toBe("Restoran");
    expect(findCategory("  DO-KON ")?.label).toBe("Do'kon");
    expect(findCategory("noma'lum")).toBeUndefined();
  });
});

describe("shablon asosidagi spec", () => {
  it("to'liq spec yaratadi", () => {
    const spec = buildTemplateSpec({
      title: "Restoran menyusi",
      category: "restoran",
    });

    expect(spec.generatedBy).toBe("template");
    expect(spec.pages.length).toBeGreaterThanOrEqual(2);
    expect(spec.pages[0].route).toBe("/");
    expect(spec.dataModels.length).toBeGreaterThan(0);
  });

  it("har bir sahifada kamida bitta blok bor", () => {
    const spec = buildTemplateSpec({ title: "Do'kon", category: "do-kon" });

    for (const page of spec.pages) {
      expect(page.rows.length).toBeGreaterThan(0);
      for (const row of page.rows) {
        expect(row.blocks.length).toBeGreaterThan(0);
        expect(row.blocks[0].component.length).toBeGreaterThan(0);
      }
    }
  });

  it("noma'lum kategoriya uchun umumiy spec yaratadi", () => {
    const spec = buildTemplateSpec({
      title: "Mening ilovam",
      category: "boshqa",
      brief: "Kitob do'koni uchun ilova",
    });

    expect(spec.pages.length).toBeGreaterThanOrEqual(2);
    expect(spec.summary).toContain("Kitob do'koni");
  });

  it("bloklarga boshlang'ich props beriladi", () => {
    const spec = buildTemplateSpec({ title: "Test", category: "restoran" });

    const navbar = spec.pages
      .flatMap((p) => p.rows)
      .flatMap((r) => r.blocks)
      .find((b) => b.component === "Navbar");

    expect(navbar?.props).toHaveProperty("title", "Test");
  });

  it("platform saqlanadi", () => {
    const spec = buildTemplateSpec({
      title: "Mobil",
      category: "maktab",
      platform: "mobile",
    });
    expect(spec.platform).toBe("mobile");
  });
});

describe("spec validatsiyasi", () => {
  it("to'g'ri spec qabul qilinadi", () => {
    const spec = buildTemplateSpec({ title: "Test", category: "do-kon" });
    const result = validateAppSpec(spec);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("bo'sh natija rad etiladi", () => {
    expect(validateAppSpec(null).valid).toBe(false);
    expect(validateAppSpec({}).valid).toBe(false);
  });

  it("sahifasiz natija rad etiladi", () => {
    const result = validateAppSpec({ title: "X", pages: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("pages");
  });

  it("rows'siz sahifa rad etiladi", () => {
    const result = validateAppSpec({
      title: "X",
      pages: [{ id: "p1", name: "A", route: "/", purpose: "p", rows: [] }],
    });
    expect(result.valid).toBe(false);
  });
});
