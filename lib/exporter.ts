import type { BuilderLayout, MobileBlock } from "./builder";
import { resolvePalette } from "./palettes";

/**
 * Eksporter — builder layout'ini haqiqiy Next.js loyiha fayllariga aylantiradi.
 *
 * Natija: foydalanuvchi qurgan ilovani yuklab oladi va o'z kompyuterida
 * `npm install && npm run dev` bilan ishga tushiradi.
 */

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface ExportMeta {
  title: string;
  category: string;
  summary?: string;
  palette?: string | null;
}

/** Blok komponentini JSX atributlariga aylantirish */
function toJsxProps(props: Record<string, unknown>): string {
  const entries = Object.entries(props).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return "";

  return entries
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(" ");
}

export function layoutToFiles(
  layout: BuilderLayout,
  meta: ExportMeta
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  /* ── package.json ── */
  files.push({
    path: "package.json",
    content: JSON.stringify(
      {
        name: slugify(meta.title),
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
        },
        dependencies: {
          next: "16.2.9",
          react: "19.2.4",
          "react-dom": "19.2.4",
          "lucide-react": "^0.400.0",
        },
        devDependencies: {
          "@tailwindcss/postcss": "^4",
          tailwindcss: "^4",
          typescript: "^5",
          "@types/react": "^19",
          "@types/node": "^20",
        },
      },
      null,
      2
    ),
  });

  /* ── next.config.ts ── */
  files.push({
    path: "next.config.ts",
    content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`,
  });

  /* ── tsconfig.json ── */
  files.push({
    path: "tsconfig.json",
    content: JSON.stringify(
      {
        compilerOptions: {
          target: "ES2017",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: { "@/*": ["./*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"],
      },
      null,
      2
    ),
  });

  /* ── postcss.config.mjs ── */
  files.push({
    path: "postcss.config.mjs",
    content: `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`,
  });

  /* ── app/globals.css ── */
  files.push({
    path: "app/globals.css",
    content: `@import "tailwindcss";

:root {
  --background: ${resolvePalette(meta.palette).background};
  --foreground: #e2e8f0;
  --brand: ${resolvePalette(meta.palette).primary};
  --brand-accent: ${resolvePalette(meta.palette).accent};
  --surface: ${resolvePalette(meta.palette).surface};
}

.dark {
  --background: ${resolvePalette(meta.palette).background};
  --foreground: #e2e8f0;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
}
`,
  });

  /* ── app/layout.tsx ── */
  files.push({
    path: "app/layout.tsx",
    content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: ${JSON.stringify(meta.title)},
  description: ${JSON.stringify(meta.summary ?? `${meta.title} — ${meta.category}`)},
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
`,
  });

  /* ── Blok komponentlari (mustaqil, tashqi bog'liqliksiz) ── */
  files.push({
    path: "components/Blocks.tsx",
    content: generateBlocksComponent(layout),
  });

  /* ── Sahifa ── */
  files.push({
    path: "app/page.tsx",
    content: generatePage(layout),
  });

  /* ── README ── */
  files.push({
    path: "README.md",
    content: `# ${meta.title}

${meta.summary ?? "AppNest bilan yaratilgan ilova."}

Kategoriya: **${meta.category}**

## Ishga tushirish

\`\`\`bash
npm install
npm run dev
\`\`\`

Brauzer: http://localhost:3000

## Tuzilma

- \`app/page.tsx\` — sahifa tarkibi
- \`components/Blocks.tsx\` — ishlatilgan bloklar
- \`app/globals.css\` — uslub

> AppNest — AI no-code builder. Bu loyiha eksport qilingan.
`,
  });

  return files;
}

/* ── Blok komponentlari fayli ───────────────────────────── */

function generateBlocksComponent(layout: BuilderLayout): string {
  const used = new Set<string>();
  for (const row of layout.rows) {
    for (const b of row.blocks) used.add(b.component);
  }
  for (const b of layout.blocks ?? []) used.add(b.component);

  const parts: string[] = [];
  parts.push(`"use client";`);
  parts.push(`import type { ReactNode } from "react";`);
  parts.push(``);

  /* Navbar */
  if (used.has("Navbar")) {
    parts.push(`export function Navbar({ title, links, action }: { title?: string; links?: string; action?: string }) {
  const items = (links ?? "").split(",").map((l) => l.trim()).filter(Boolean);
  return (
    <nav className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
      <span className="text-lg font-bold">{title ?? "App"}</span>
      <div className="flex items-center gap-4">
        {items.map((l) => (
          <span key={l} className="text-sm text-gray-600">{l}</span>
        ))}
        {action && (
          <button className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--brand)" }}>
            {action}
          </button>
        )}
      </div>
    </nav>
  );
}`);
    parts.push(``);
  }

  /* Hero */
  if (used.has("Hero")) {
    parts.push(`export function Hero({ title, subtitle, cta }: { title?: string; subtitle?: string; cta?: string }) {
  return (
    <section className="px-6 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight">{title ?? "Sarlavha"}</h1>
      {subtitle && <p className="mx-auto mt-4 max-w-xl text-gray-600">{subtitle}</p>}
      {cta && (
        <button className="mt-8 rounded-xl px-6 py-3 font-semibold text-white" style={{ background: "var(--brand)" }}>
          {cta}
        </button>
      )}
    </section>
  );
}`);
    parts.push(``);
  }

  /* Card */
  if (used.has("Card")) {
    parts.push(`export function Card({ title, body }: { title?: string; body?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title ?? "Karta"}</h3>
      {body && <p className="mt-2 text-sm text-gray-600">{body}</p>}
    </div>
  );
}`);
    parts.push(``);
  }

  /* Button */
  if (used.has("Button")) {
    parts.push(`export function Button({ label, variant }: { label?: string; variant?: string }) {
  return (
    <button
      className={\`rounded-lg px-5 py-2.5 text-sm font-medium transition \${
        variant === "outline"
          ? "border border-gray-300 text-gray-700"
          : variant === "ghost"
            ? "text-gray-600"
            : "text-white"
      }\`}
      style={variant === "outline" || variant === "ghost" ? undefined : { background: "var(--brand)" }}
    >
      {label ?? "Tugma"}
    </button>
  );
}`);
    parts.push(``);
  }

  /* Input */
  if (used.has("Input")) {
    parts.push(`export function Input({ label, placeholder }: { label?: string; placeholder?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>}
      <input
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[var(--brand)]"
        placeholder={placeholder ?? "Qiymat kiriting"}
      />
    </label>
  );
}`);
    parts.push(``);
  }

  /* Badge */
  if (used.has("Badge")) {
    parts.push(`export function Badge({ label, color }: { label?: string; color?: string }) {
  const tones: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    gray: "bg-gray-100 text-gray-700",
    red: "bg-red-50 text-red-700",
    yellow: "bg-yellow-50 text-yellow-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <span className={\`inline-flex rounded-full px-3 py-1 text-xs font-semibold \${tones[color ?? "blue"]}\`}>
      {label ?? "Nishon"}
    </span>
  );
}`);
    parts.push(``);
  }

  /* StatCard */
  if (used.has("StatCard")) {
    parts.push(`export function StatCard({ title, value }: { title?: string; value?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title ?? "Ko'rsatkich"}</p>
      <p className="mt-2 text-3xl font-bold">{value ?? "0"}</p>
    </div>
  );
}`);
    parts.push(``);
  }

  /* Table */
  if (used.has("Table")) {
    parts.push(`export function Table({ headers }: { headers?: string }) {
  const cols = (headers ?? "ID,Nomi,Holat").split(",").map((h) => h.trim());
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-600">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-5 py-3">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td colSpan={cols.length} className="px-5 py-8 text-center text-gray-400">
              Ma'lumot kelganda ko'rsatiladi
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}`);
    parts.push(``);
  }

  /* Alert */
  if (used.has("Alert")) {
    parts.push(`export function Alert({ title, body, type }: { title?: string; body?: string; type?: string }) {
  const tones: Record<string, string> = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  };
  return (
    <div className={\`rounded-xl border p-4 text-sm \${tones[type ?? "info"]}\`}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div>{body ?? ""}</div>
    </div>
  );
}`);
    parts.push(``);
  }

  /* Toast */
  if (used.has("Toast")) {
    parts.push(`export function Toast({ message, type }: { message?: string; type?: string }) {
  const tones: Record<string, string> = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };
  return (
    <div className={\`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-xl \${tones[type ?? "success"]}\`}>
      {message ?? "Muvaffaqiyatli"}
    </div>
  );
}`);
    parts.push(``);
  }

  /* Loading */
  if (used.has("Loading")) {
    parts.push(`export function Loading({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--brand)]" />
      <span className="text-sm text-gray-500">{label ?? "Yuklanmoqda..."}</span>
    </div>
  );
}`);
    parts.push(``);
  }

  /* Dropdown */
  if (used.has("Dropdown")) {
    parts.push(`export function Dropdown({ label, items }: { label?: string; items?: string }) {
  const list = (items ?? "").split(",").map((i) => i.trim()).filter(Boolean);
  return (
    <details className="relative inline-block">
      <summary className="cursor-pointer list-none rounded-lg border border-gray-300 px-4 py-2 text-sm">
        {label ?? "Tanlov"}
      </summary>
      <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        {list.map((i) => (
          <span key={i} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            {i}
          </span>
        ))}
      </div>
    </details>
  );
}`);
    parts.push(``);
  }

  /* Grid */
  if (used.has("Grid")) {
    parts.push(`export function Grid({ cols, children }: { cols?: number; children?: ReactNode }) {
  const map: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };
  return <div className={\`grid gap-6 \${map[cols ?? 3]}\`}>{children}</div>;
}`);
    parts.push(``);
  }

  /* Container */
  if (used.has("Container")) {
    parts.push(`export function Container({ children }: { children?: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}`);
    parts.push(``);
  }

  /* Footer */
  if (used.has("Footer")) {
    parts.push(`export function Footer({ text }: { text?: string }) {
  return (
    <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
      {text ?? \`© \${new Date().getFullYear()}\`}
    </footer>
  );
}`);
    parts.push(``);
  }

  return parts.join("\n");
}

/* ── Sahifa fayli ───────────────────────────────────────── */

function generatePage(layout: BuilderLayout): string {
  const imports = new Set<string>();
  const body: string[] = [];

  const pushBlock = (component: string, props: Record<string, unknown>) => {
    imports.add(component);
    const attrs = toJsxProps(props);
    body.push(`      <${component}${attrs ? ` ${attrs}` : ""} />`);
  };

  for (const row of layout.rows) {
    for (const block of row.blocks) {
      pushBlock(block.component, block.props ?? {});
    }
  }

  // Mobil layout — grid bilan
  if ((layout.blocks ?? []).length > 0) {
    for (const block of layout.blocks as MobileBlock[]) {
      pushBlock(block.component, block.props ?? {});
    }
  }

  const importList = [...imports].join(", ");

  return `import {
  ${importList},
} from "@/components/Blocks";

export default function Home() {
  return (
    <main className="min-h-screen">
${body.join("\n")}
    </main>
  );
}
`;
}

/* ── Yordamchi ─────────────────────────────────────────── */

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40) || "my-app"
  );
}
