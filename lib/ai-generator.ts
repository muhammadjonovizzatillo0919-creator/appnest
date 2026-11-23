/**
 * AI ilova spetsifikatsiyasi (App Spec) — generator.
 *
 * Ikki rejim:
 * 1. **Gemini** (asosiy) — kategoriya + erkin matnni tahlil qilib to'liq
 *    sahifalar va bloklar ro'yxatini chiqaradi.
 * 2. **Fallback** (shablon) — API kaliti yo'q bo'lsa yoki AI xato bersa.
 *    Kategoriya shablonidan barqaror spec yasaydi.
 *
 * Chiqish formati — vizual quruvchiga to'g'ridan-to'g'ri beriladigan JSON.
 */

/* в”Ђв”Ђ Turlar в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */

export type Platform = "web" | "mobile";

export interface SpecBlock {
  id: string;
  component: string;
  props: Record<string, unknown>;
}

export interface SpecRow {
  id: string;
  type: "window";
  blocks: SpecBlock[];
}

export interface SpecPage {
  id: string;
  name: string;
  route: string;
  purpose: string;
  rows: SpecRow[];
}

export interface AppSpec {
  title: string;
  category: string;
  platform: Platform;
  summary: string;
  pages: SpecPage[];
  dataModels: { name: string; fields: { name: string; type: string }[] }[];
  features: string[];
  generatedBy: "gemini" | "template";
  /** Foydalanuvchi tanlagan rang palitrasi (preset id yoki #hex) */
  palette?: string;
}

/* в”Ђв”Ђ Kategoriyalar в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */

export interface CategoryTemplate {
  key: string;
  label: string;
  summary: string;
  pages: { name: string; route: string; purpose: string; blocks: string[] }[];
  dataModels: { name: string; fields: { name: string; type: string }[] }[];
  features: string[];
}

export const CATEGORIES: CategoryTemplate[] = [
  {
    key: "restoran",
    label: "Restoran",
    summary:
      "Taomlar menyusi, onlayn buyurtma va yetkazib berish xizmati uchun ilova.",
    pages: [
      {
        name: "Bosh sahifa",
        route: "/",
        purpose: "Restoran tanishtirish, manzil, ish vaqti, telefon",
        blocks: ["Navbar", "Hero", "Card", "Button", "Footer"],
      },
      {
        name: "Menyu",
        route: "/menu",
        purpose: "Taomlar ro'yxati, narxi va tavsifi",
        blocks: ["Navbar", "Input", "Card", "Badge", "Footer"],
      },
      {
        name: "Buyurtma",
        route: "/order",
        purpose: "Taom tanlash, manzil kiritish va tasdiqlash",
        blocks: ["Navbar", "Card", "Input", "Button", "Toast"],
      },
      {
        name: "Biz haqimizda",
        route: "/about",
        purpose: "Restoran tarixi, jamoa va yetkazib berish shartlari",
        blocks: ["Navbar", "Card", "StatCard", "Footer"],
      },
    ],
    dataModels: [
      {
        name: "Dish",
        fields: [
          { name: "id", type: "number" },
          { name: "name", type: "string" },
          { name: "price", type: "number" },
          { name: "category", type: "string" },
          { name: "image", type: "url" },
          { name: "isAvailable", type: "boolean" },
        ],
      },
      {
        name: "Order",
        fields: [
          { name: "id", type: "number" },
          { name: "items", type: "array" },
          { name: "total", type: "number" },
          { name: "address", type: "string" },
          { name: "status", type: "string" },
        ],
      },
    ],
    features: [
      "Taomlar menyusi va qidirish",
      "Savatga qo'shish va buyurtma berish",
      "Yetkazib berish manzilini kiritish",
      "Buyurtma holatini kuzatish",
    ],
  },
  {
    key: "do-kon",
    label: "Do'kon",
    summary: "Mahsulotlar katalogi, savat va to'lov uchun onlayn do'kon ilovasi.",
    pages: [
      {
        name: "Bosh sahifa",
        route: "/",
        purpose: "Do'kon tanishtirish, kategoriyalar, mashhur mahsulotlar",
        blocks: ["Navbar", "Hero", "Grid", "Card", "Footer"],
      },
      {
        name: "Katalog",
        route: "/catalog",
        purpose: "Barcha mahsulotlar, kategoriya filtri",
        blocks: ["Navbar", "Dropdown", "Input", "Card", "Button"],
      },
      {
        name: "Mahsulot",
        route: "/product/[id]",
        purpose: "Mahsulot tafsilotlari, narxi, savatga qo'shish",
        blocks: ["Navbar", "Card", "Badge", "Button", "Footer"],
      },
      {
        name: "Savat",
        route: "/cart",
        purpose: "Tanlangan mahsulotlar va jami narx",
        blocks: ["Navbar", "Table", "StatCard", "Button", "Toast"],
      },
    ],
    dataModels: [
      {
        name: "Product",
        fields: [
          { name: "id", type: "number" },
          { name: "name", type: "string" },
          { name: "price", type: "number" },
          { name: "category", type: "string" },
          { name: "stock", type: "number" },
        ],
      },
      {
        name: "CartItem",
        fields: [
          { name: "productId", type: "number" },
          { name: "quantity", type: "number" },
        ],
      },
    ],
    features: [
      "Kategoriya bo'yicha filtr",
      "Mahsulot qidirish",
      "Savat va miqdor boshqarish",
      "Jami narx hisobi",
    ],
  },
  {
    key: "maktab",
    label: "Maktab",
    summary: "Dars jadvali, o'quvchilar va ota-onalar uchun axborot portali.",
    pages: [
      {
        name: "Bosh sahifa",
        route: "/",
        purpose: "Maktab tanishtirish, yangiliklar, e'lonlar",
        blocks: ["Navbar", "Hero", "Card", "Badge", "Footer"],
      },
      {
        name: "Dars jadvali",
        route: "/schedule",
        purpose: "Haftalik dars jadvali, sinf va o'quvchi bo'yicha",
        blocks: ["Navbar", "Dropdown", "Table", "Card", "Footer"],
      },
      {
        name: "O'quvchilar",
        route: "/students",
        purpose: "O'quvchilar ro'yxati, sinf, holat",
        blocks: ["Navbar", "Input", "Table", "Badge", "Button"],
      },
      {
        name: "E'lonlar",
        route: "/news",
        purpose: "Maktab e'lonlari va hodisalar",
        blocks: ["Navbar", "Card", "Loading", "Footer"],
      },
    ],
    dataModels: [
      {
        name: "Student",
        fields: [
          { name: "id", type: "number" },
          { name: "name", type: "string" },
          { name: "className", type: "string" },
          { name: "isActive", type: "boolean" },
        ],
      },
      {
        name: "Lesson",
        fields: [
          { name: "id", type: "number" },
          { name: "className", type: "string" },
          { name: "subject", type: "string" },
          { name: "dayOfWeek", type: "number" },
          { name: "startTime", type: "string" },
          { name: "room", type: "string" },
        ],
      },
    ],
    features: [
      "Dars jadvalini ko'rish",
      "E'lonlarni o'qish",
      "O'quvchilar ro'yxati va sinflar",
    ],
  },
  {
    key: "universitet",
    label: "Universitet",
    summary: "Fakultetlar, dars jadvali, o'qituvchilar va talaba portaliga kirish.",
    pages: [
      {
        name: "Bosh sahifa",
        route: "/",
        purpose: "Universitet tanishtirish, fakultetlar, e'lonlar",
        blocks: ["Navbar", "Hero", "StatCard", "Card", "Footer"],
      },
      {
        name: "Fakultetlar",
        route: "/faculties",
        purpose: "Fakultetlar va kafedralar ro'yxati",
        blocks: ["Navbar", "Grid", "Card", "Input", "Footer"],
      },
      {
        name: "Dars jadvali",
        route: "/schedule",
        purpose: "Kurs va guruh bo'yicha dars jadvali",
        blocks: ["Navbar", "Dropdown", "Table", "Badge", "Footer"],
      },
      {
        name: "Kirish",
        route: "/login",
        purpose: "Talaba va o'qituvchi kirishi",
        blocks: ["Navbar", "Input", "Button", "Alert", "Footer"],
      },
    ],
    dataModels: [
      {
        name: "Faculty",
        fields: [
          { name: "id", type: "number" },
          { name: "name", type: "string" },
          { name: "code", type: "string" },
        ],
      },
      {
        name: "Teacher",
        fields: [
          { name: "id", type: "number" },
          { name: "name", type: "string" },
          { name: "subject", type: "string" },
        ],
      },
    ],
    features: [
      "Fakultetlar va kafedralar",
      "Dars jadvali",
      "O'qituvchilar ma'lumotlari",
      "Talaba portaliga kirish",
    ],
  },
];

export const OTHER_CATEGORY_KEY = "boshqa";

export function findCategory(key: string): CategoryTemplate | undefined {
  return CATEGORIES.find((c) => c.key === key.trim().toLowerCase());
}

/* в”Ђв”Ђ Shablon asosidagi generator (fallback) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */

/** Kategoriya shablonidan barqaror spec yasaydi (AI ishlamaganda) */
export function buildTemplateSpec(input: {
  title: string;
  category: string;
  brief?: string;
  platform?: Platform;
  palette?: string | null;
}): AppSpec {
  const template = findCategory(input.category);

  const pages = (template?.pages ?? [
    {
      name: "Bosh sahifa",
      route: "/",
      purpose: input.brief?.slice(0, 120) || "Asosiy ma'lumot",
      blocks: ["Navbar", "Hero", "Card", "Button", "Footer"],
    },
    {
      name: "Asosiy bo'lim",
      route: "/main",
      purpose: "Kontent va ma'lumotlar ro'yxati",
      blocks: ["Navbar", "Input", "Card", "Footer"],
    },
    {
      name: "Bog'lanish",
      route: "/contacts",
      purpose: "Aloqa ma'lumotlari va forma",
      blocks: ["Navbar", "Input", "Button", "Footer"],
    },
  ]).map((page, pageIndex) => ({
    id: `p${pageIndex + 1}`,
    name: page.name,
    route: page.route,
    purpose: page.purpose,
    rows: page.blocks.map((component, blockIndex) => ({
      id: `r${pageIndex + 1}-${blockIndex + 1}`,
      type: "window" as const,
      blocks: [
        {
          id: `b${pageIndex + 1}-${blockIndex + 1}`,
          component,
          props: buildProps(component, input.title),
        },
      ],
    })),
  }));

  return {
    title: input.title.trim() || "Yangi loyiha",
    category: template?.label ?? (input.category.trim() || "Boshqa"),
    platform: input.platform ?? "web",
    summary:
      template?.summary ??
      (input.brief?.trim() ||
        "Foydalanuvchi tavsifiga asoslangan ilova. Sahifalar va bloklar AI tomonidan to'ldiriladi."),
    pages,
    dataModels: template?.dataModels ?? [
      {
        name: "Item",
        fields: [
          { name: "id", type: "number" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
        ],
      },
    ],
    features: template?.features ?? [
      "Asosiy sahifa va kontent bloklari",
      "Ma'lumot kiritish va ko'rsatish",
    ],
    generatedBy: "template",
    palette: input.palette ?? undefined,
  };
}

/** Blok komponenti uchun boshlang'ich props */
function buildProps(component: string, title: string): Record<string, unknown> {
  switch (component) {
    case "Navbar":
      return { title, links: ["Bosh sahifa"] };
    case "Hero":
      return {
        title,
        subtitle: "Zamonaviy va oson interfeys",
        cta: "Boshish",
      };
    case "Card":
      return { title: "Karta sarlavhasi", body: "Karta matni" };
    case "Button":
      return { label: "Tugma", variant: "primary" };
    case "Input":
      return { label: "Maydon nomi", placeholder: "Qiymat kiriting" };
    case "Badge":
      return { label: "Yangi", color: "green" };
    case "Table":
      return { headers: ["ID", "Nomi", "Holat"] };
    case "StatCard":
      return { title: "Ko'rsatkich", value: "0" };
    case "Grid":
      return { cols: 3 };
    case "Dropdown":
      return { label: "Tanlov", items: ["Birinchi", "Ikkinchi"] };
    case "Alert":
      return { type: "info", title: "Eslatma" };
    case "Toast":
      return { message: "Muvaffaqiyatli", type: "success" };
    case "Loading":
      return { label: "Yuklanmoqda..." };
    case "Footer":
      return { text: "В© 2026" };
    default:
      return {};
  }
}

/* в”Ђв”Ђ Validatsiya в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */

export interface SpecValidation {
  valid: boolean;
  errors: string[];
}

/** AI natijasi to'g'ri tuzilganini tekshiradi */
export function validateAppSpec(input: unknown): SpecValidation {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Natija obyekt emas"] };
  }

  const spec = input as Partial<AppSpec>;

  if (!spec.title || typeof spec.title !== "string") {
    errors.push("title topilmadi");
  }
  if (!spec.pages || !Array.isArray(spec.pages) || spec.pages.length === 0) {
    errors.push("pages bo'sh");
  } else {
    spec.pages.forEach((page, i) => {
      if (!page?.name) errors.push(`pages[${i}].name topilmadi`);
      if (!page?.route) errors.push(`pages[${i}].route topilmadi`);
      if (!Array.isArray(page?.rows) || page.rows.length === 0) {
        errors.push(`pages[${i}].rows bo'sh`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
