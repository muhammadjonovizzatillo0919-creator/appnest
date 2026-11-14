// @vitest-environment node
import { describe, expect, it } from "vitest";
import { layoutToFiles } from "@/lib/exporter";
import { createZip } from "@/lib/zip";
import type { BuilderLayout } from "@/lib/builder";

const layout: BuilderLayout = {
  platform: "web",
  rows: [
    {
      id: "r1",
      type: "window",
      blocks: [
        {
          id: "b1",
          component: "Navbar",
          props: { title: "Restoran", links: "Menu,Contact", action: "Buyurtma" },
        },
        {
          id: "b2",
          component: "Hero",
          props: { title: "Sho'rt va mazali", subtitle: "Kafe", cta: "Menu" },
        },
      ],
    },
    {
      id: "r2",
      type: "window",
      blocks: [
        { id: "b3", component: "Card", props: { title: "Taomlar", body: "20 taom" } },
        { id: "b4", component: "Button", props: { label: "Buyurtma berish" } },
      ],
    },
  ],
};

describe("eksporter", () => {
  const files = layoutToFiles(layout, {
    title: "Restoran menyusi",
    category: "restoran",
  });

  it("barcha kerakli fayllar yaratiladi", () => {
    const paths = files.map((f) => f.path);

    expect(paths).toContain("package.json");
    expect(paths).toContain("next.config.ts");
    expect(paths).toContain("tsconfig.json");
    expect(paths).toContain("app/layout.tsx");
    expect(paths).toContain("app/globals.css");
    expect(paths).toContain("app/page.tsx");
    expect(paths).toContain("components/Blocks.tsx");
    expect(paths).toContain("README.md");
  });

  it("package.json to'g'ri tuzilgan", () => {
    const pkg = JSON.parse(
      files.find((f) => f.path === "package.json")!.content
    ) as { name: string; scripts: Record<string, string>; dependencies: Record<string, string> };

    expect(pkg.name).toBe("restoran-menyusi");
    expect(pkg.scripts.dev).toContain("next dev");
    expect(pkg.dependencies.next).toBeDefined();
    expect(pkg.dependencies.react).toBeDefined();
  });

  it("sahifa faylida bloklar import qilinadi", () => {
    const page = files.find((f) => f.path === "app/page.tsx")!.content;

    expect(page).toContain("Navbar");
    expect(page).toContain("Hero");
    expect(page).toContain("Card");
    expect(page).toContain("Button");
    expect(page).toContain("@/components/Blocks");
  });

  it("blok komponentlari fayli faqat ishlatilganlarni ichiradi", () => {
    const blocks = files.find((f) => f.path === "components/Blocks.tsx")!.content;

    expect(blocks).toContain("export function Navbar");
    expect(blocks).toContain("export function Hero");
    expect(blocks).toContain("export function Card");
    expect(blocks).toContain("export function Button");
    // ishlatilmagan blok kirmaydi
    expect(blocks).not.toContain("export function StatCard");
  });

  it("props to'g'ri ko'chiriladi", () => {
    const page = files.find((f) => f.path === "app/page.tsx")!.content;
    expect(page).toContain('title="Sho\'rt va mazali"');
    expect(page).not.toContain("{...{");
  });

  it("metadata sarlavha bilan to'ldiriladi", () => {
    const layoutFile = files.find((f) => f.path === "app/layout.tsx")!.content;
    expect(layoutFile).toContain("Restoran menyusi");
  });
});

describe("ZIP yozuvchi", () => {
  it("ZIP sarlavhasi to'g'ri", () => {
    const files = layoutToFiles(layout, {
      title: "Test",
      category: "restoran",
    });
    const zip = createZip(files);

    // "PK\x03\x04" — local file header
    expect(zip.readUInt32LE(0)).toBe(0x04034b50);
    // oxirida EOCD
    expect(zip.readUInt32LE(zip.length - 22)).toBe(0x06054b50);
  });

  it("barcha fayllar markaziy katalogda", () => {
    const files = layoutToFiles(layout, {
      title: "Test",
      category: "restoran",
    });
    const zip = createZip(files);

    const eocdOffset = zip.length - 22;
    const entryCount = zip.readUInt16LE(eocdOffset + 10);
    expect(entryCount).toBe(files.length);
  });

  it("ZIP bo'sh bo'lmagan", () => {
    const files = layoutToFiles(layout, {
      title: "Test",
      category: "restoran",
    });
    expect(createZip(files).length).toBeGreaterThan(1000);
  });
});
