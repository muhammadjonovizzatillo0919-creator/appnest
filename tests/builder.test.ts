// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  BLOCK_REGISTRY,
  addBlock,
  addRow,
  findBlockMeta,
  layoutToSpec,
  moveBlock,
  newBlockId,
  removeBlock,
  removeRow,
  specToLayout,
  updateBlockProps,
  type BuilderLayout,
} from "@/lib/builder";
import { buildTemplateSpec } from "@/lib/ai-generator";

const block = (id: string, component = "Card") => ({
  id,
  component,
  props: { title: component },
});

const layout = (): BuilderLayout => ({
  platform: "web",
  rows: [
    { id: "r1", type: "window", blocks: [block("b1", "Hero")] },
    { id: "r2", type: "window", blocks: [block("b2", "Card"), block("b3", "Button")] },
  ],
});

describe("blok registri", () => {
  it("15 ta blok mavjud (AppLogo va ThemeToggle — foydalanuvchi sozlamalari, blok emas)", () => {
    expect(BLOCK_REGISTRY.length).toBe(15);
  });

  it("har bir blokda nom, yorliq, ikonka va maydonlar bor", () => {
    for (const meta of BLOCK_REGISTRY) {
      expect(meta.name.length).toBeGreaterThan(0);
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.icon.length).toBeGreaterThan(0);
      expect(meta.group.length).toBeGreaterThan(0);
      expect(Array.isArray(meta.fields)).toBe(true);
    }
  });

  it("blok nomi bo'yicha topiladi", () => {
    expect(findBlockMeta("Hero")?.label).toBe("Hero");
    expect(findBlockMeta("Noma'lum")).toBeUndefined();
  });
});

describe("AI spec → layout konversiyasi", () => {
  it("barcha sahifalarni qatorlarga aylantiradi", () => {
    const spec = buildTemplateSpec({ title: "Test", category: "restoran" });
    const result = specToLayout(spec);

    expect(result.platform).toBe("web");
    expect(result.rows.length).toBeGreaterThan(0);

    const totalBlocks = result.rows.reduce((sum, r) => sum + r.blocks.length, 0);
    expect(totalBlocks).toBeGreaterThan(0);
  });

  it("har bir blokda komponent nomi bor", () => {
    const spec = buildTemplateSpec({ title: "Test", category: "do-kon" });
    const result = specToLayout(spec);

    for (const row of result.rows) {
      for (const b of row.blocks) {
        expect(b.component.length).toBeGreaterThan(0);
        expect(b.id.length).toBeGreaterThan(0);
      }
    }
  });

  it("layout → spec qaytarishda ma'lumut yo'qolmaydi", () => {
    const spec = buildTemplateSpec({ title: "Test", category: "maktab" });
    const result = specToLayout(spec);
    const back = layoutToSpec(result);

    expect(back.pages.length).toBeGreaterThan(0);
    const blocksIn = result.rows.reduce((s, r) => s + r.blocks.length, 0);
    const blocksOut = back.pages.reduce(
      (s, p) => s + p.rows.reduce((n, r) => n + r.blocks.length, 0),
      0
    );
    expect(blocksOut).toBe(blocksIn);
  });
});

describe("blok amallari", () => {
  it("blok qo'shiladi", () => {
    const next = addBlock(layout(), "r1", block("b9", "Table"));
    expect(next.rows[0].blocks).toHaveLength(2);
    expect(next.rows[0].blocks[1].component).toBe("Table");
  });

  it("blok o'chiriladi va bo'sh qator ham o'chadi", () => {
    const next = removeBlock(layout(), "r1", "b1");
    expect(next.rows.find((r) => r.id === "r1")).toBeUndefined();
  });

  it("blok boshqa qatorga ko'chiriladi (bo'shab qator olib tashlanadi)", () => {
    const next = moveBlock(layout(), "r1", "b1", "r2", 0);
    const r1 = next.rows.find((r) => r.id === "r1");
    const r2 = next.rows.find((r) => r.id === "r2");

    // r1 da bitta blok bor edi — ko'chirilgandan keyin bo'sh qator olib tashlanadi
    expect(r1).toBeUndefined();
    expect(r2?.blocks[0].id).toBe("b1");
    expect(r2?.blocks).toHaveLength(3);
  });

  it("blok xossalari yangilanadi", () => {
    const next = updateBlockProps(layout(), "b2", { title: "Yangi" });
    const updated = next.rows
      .flatMap((r) => r.blocks)
      .find((b) => b.id === "b2");

    expect(updated?.props.title).toBe("Yangi");
  });

  it("yangi qator qo'shiladi va o'chiriladi", () => {
    const added = addRow(layout());
    expect(added.rows).toHaveLength(3);

    const removed = removeRow(added, added.rows[2].id);
    expect(removed.rows).toHaveLength(2);
  });

  it("yangi id unikal bo'ladi", () => {
    const ids = new Set([newBlockId(), newBlockId(), newBlockId()]);
    expect(ids.size).toBe(3);
  });
});
