import type { BuilderLayout } from "@/lib/builder";

/**
 * Namuna loyihalar — foydalanuvchi bir bosishda tayyor loyiha yarata oladi.
 *
 * Har biri to'liq layout (bloklar bilan) — foydalanuvchi darhol ko'radi
 * va tahrirlashni davom ettiradi.
 */

export interface ProjectTemplate {
  key: string;
  title: string;
  category: string;
  brief: string;
  accent: string;
  emoji: string;
  layout: BuilderLayout;
}

const block = (id: string, component: string, props: Record<string, unknown>) => ({
  id,
  component,
  props,
});

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    key: "restoran",
    title: "Restoran menyusi",
    category: "restoran",
    brief: "Kafe uchun menyu, narxlar va onlayn buyurtma berish ilovasi",
    accent: "#e11d48",
    emoji: "🍽️",
    layout: {
      platform: "web",
      rows: [
        {
          id: "t1-r1",
          type: "window",
          blocks: [
            block("t1-b1", "Navbar", {
              title: "Restoran",
              links: "Menyu,Yetkazib berish,Bog'lanish",
              action: "Buyurtma berish",
            }),
          ],
        },
        {
          id: "t1-r2",
          type: "window",
          blocks: [
            block("t1-b2", "Hero", {
              title: "Sho'rt va mazali taomlar",
              subtitle:
                "Har kuni yangi taomlar. Ishga ketayotganingizda ham biz tayyor.",
              cta: "Menyuni ko'rish",
            }),
          ],
        },
        {
          id: "t1-r3",
          type: "window",
          blocks: [
            block("t1-b3", "Card", {
              title: "Bugungi taomlar",
              body: "Oshpaz — 12 000 so'm · Non — 6 000 so'm · Sho'rva — 18 000 so'm",
            }),
            block("t1-b4", "Badge", { label: "Yetkazib berish", color: "green" }),
          ],
        },
        {
          id: "t1-r4",
          type: "window",
          blocks: [
            block("t1-b5", "Card", {
              title: "Ish vaqti",
              body: "Har kuni 09:00 — 23:00. Yakshanba yopilamiz.",
            }),
            block("t1-b6", "Button", { label: "Manzilni ko'rish" }),
          ],
        },
        {
          id: "t1-r5",
          type: "window",
          blocks: [block("t1-b7", "Footer", { text: "© 2026 Restoran" })],
        },
      ],
    },
  },

  {
    key: "do-kon",
    title: "Onlayn do'kon",
    category: "do-kon",
    brief: "Mahsulotlar katalogi, savat va narxlar ilovasi",
    accent: "#0057FF",
    emoji: "🛍️",
    layout: {
      platform: "web",
      rows: [
        {
          id: "t2-r1",
          type: "window",
          blocks: [
            block("t2-b1", "Navbar", {
              title: "Do'kon",
              links: "Katalog,Savat,Kontakt",
              action: "Savat",
            }),
          ],
        },
        {
          id: "t2-r2",
          type: "window",
          blocks: [
            block("t2-b2", "Hero", {
              title: "Siz uchun tanlangan mahsulotlar",
              subtitle: "48 soat ichida yetkazib beramiz. 1000+ xush bilan mijoz.",
              cta: "Katalogni ochish",
            }),
          ],
        },
        {
          id: "t2-r3",
          type: "window",
          blocks: [
            block("t2-b3", "Card", {
              title: "Mahsulotlar",
              body: "Elektronika · Kiyim · Uy-ro'g'ol · Kitoblar",
            }),
            block("t2-b4", "StatCard", { title: "Mahsulotlar", value: "1 240" }),
          ],
        },
        {
          id: "t2-r4",
          type: "window",
          blocks: [block("t2-b5", "Table", { headers: "Nomi,Narxi,Holati" })],
        },
        {
          id: "t2-r5",
          type: "window",
          blocks: [block("t2-b6", "Footer", { text: "© 2026 Do'kon" })],
        },
      ],
    },
  },

  {
    key: "maktab",
    title: "Maktab portali",
    category: "maktab",
    brief: "Dars jadvali, e'lonlar va o'quvchilar axborot portali",
    accent: "#0d9488",
    emoji: "🏫",
    layout: {
      platform: "web",
      rows: [
        {
          id: "t3-r1",
          type: "window",
          blocks: [
            block("t3-b1", "Navbar", {
              title: "Maktab portali",
              links: "Jadval,E'lonlar,O'quvchilar",
              action: "Kirish",
            }),
          ],
        },
        {
          id: "t3-r2",
          type: "window",
          blocks: [
            block("t3-b2", "Hero", {
              title: "Maktabimiz yangiliklari",
              subtitle: "Dars jadvali, imtigonlar va ota-onalar uchun axborot.",
              cta: "Jadvalni ko'rish",
            }),
          ],
        },
        {
          id: "t3-r3",
          type: "window",
          blocks: [
            block("t3-b4", "Alert", {
              type: "info",
              title: "Eslatma",
              body: "1-iyul dan dars jadvali o'zgaradi.",
            }),
            block("t3-b5", "Badge", { label: "E'lon", color: "blue" }),
          ],
        },
        {
          id: "t3-r4",
          type: "window",
          blocks: [block("t3-b6", "Table", { headers: "Fan,Dars,Vaqt,Xona" })],
        },
        {
          id: "t3-r5",
          type: "window",
          blocks: [block("t3-b7", "Footer", { text: "© 2026 Maktab" })],
        },
      ],
    },
  },

  {
    key: "universitet",
    title: "Universitet portali",
    category: "universitet",
    brief: "Fakultetlar, dars jadvali va talaba portali",
    accent: "#7c3aed",
    emoji: "🎓",
    layout: {
      platform: "web",
      rows: [
        {
          id: "t4-r1",
          type: "window",
          blocks: [
            block("t4-b1", "Navbar", {
              title: "Universitet",
              links: "Fakultetlar,Jadval,O'qituvchilar",
              action: "Tizimga kirish",
            }),
          ],
        },
        {
          id: "t4-r2",
          type: "window",
          blocks: [
            block("t4-b2", "Hero", {
              title: "Bilim — kelajak kaliti",
              subtitle: "Fakultetlar, o'qituvchilar va to'liq dars jadvali bir joyda.",
              cta: "Fakultetlarni ko'rish",
            }),
          ],
        },
        {
          id: "t4-r3",
          type: "window",
          blocks: [
            block("t4-b3", "StatCard", { title: "Fakultetlar", value: "12" }),
            block("t4-b4", "StatCard", { title: "O'qituvchilar", value: "480" }),
            block("t4-b5", "StatCard", { title: "Talabalar", value: "18 500" }),
          ],
        },
        {
          id: "t4-r4",
          type: "window",
          blocks: [
            block("t4-b6", "Input", {
              label: "Fakultetni izlash",
              placeholder: "Masalan: Axborot texnologiyalari",
            }),
            block("t4-b7", "Button", { label: "Qidirish" }),
          ],
        },
        {
          id: "t4-r5",
          type: "window",
          blocks: [block("t4-b8", "Footer", { text: "© 2026 Universitet" })],
        },
      ],
    },
  },
];

export function findTemplate(key: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.key === key);
}
