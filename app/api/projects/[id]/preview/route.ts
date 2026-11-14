import { projectStore } from "@/lib/project-store";
import { getCurrentUser, unauthorized } from "@/lib/session";
import type { BuilderLayout, MobileBlock } from "@/lib/builder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" && v ? v : fallback;

/**
 * GET /api/projects/[id]/preview — mustaqil HTML ko'rinish.
 *
 * Bepul tarifda ham ko'rish mumkin (1+1 qoidasi: ko'rish bepul,
 * production'ga chiqarish — PRO).
 */
export async function GET(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const project = await projectStore.get(id);

  if (!project) {
    return new Response("Loyiha topilmadi", { status: 404 });
  }

  if (project.userId !== user.id && user.role !== "superadmin") {
    return new Response("Bu loyiha sizniki emas", { status: 403 });
  }

  let layout: BuilderLayout = { platform: "web", rows: [] };

  if (project.layout) {
    try {
      layout = JSON.parse(project.layout) as BuilderLayout;
    } catch {
      /* bo'sh layout */
    }
  } else if (project.aiSpec) {
    try {
      const spec = JSON.parse(project.aiSpec);
      const rows = (spec.pages ?? []).flatMap((p: { rows: { id: string; type: string; blocks: unknown[] }[] }) =>
        p.rows.map((r) => ({
          id: r.id,
          type: "window" as const,
          blocks: r.blocks as never,
        }))
      );
      layout = { platform: spec.platform ?? "web", rows };
    } catch {
      /* bo'sh */
    }
  }

  const body: string[] = [];

  for (const row of layout.rows) {
    for (const block of row.blocks) {
      body.push(renderBlock(block.component, block.props ?? {}));
    }
  }
  for (const block of (layout.blocks ?? []) as MobileBlock[]) {
    body.push(renderBlock(block.component, block.props ?? {}));
  }

  const html = `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(project.title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-slate-900 antialiased">
${body.join("\n")}
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** Blokni HTML ga aylantirish */
function renderBlock(component: string, props: Record<string, unknown>): string {
  switch (component) {
    case "Navbar": {
      const links = str(props.links)
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
      return `<nav class="flex h-16 items-center justify-between border-b border-slate-200 px-6">
  <span class="text-lg font-bold">${escapeHtml(props.title)}</span>
  <div class="flex items-center gap-4">${links
    .map((l) => `<span class="text-sm text-slate-600">${escapeHtml(l)}</span>`)
    .join("")}${
        props.action
          ? `<button class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">${escapeHtml(props.action)}</button>`
          : ""
      }</div>
</nav>`;
    }

    case "Hero":
      return `<section class="px-6 py-16 text-center">
  <h1 class="text-4xl font-bold tracking-tight">${escapeHtml(props.title)}</h1>
  <p class="mx-auto mt-4 max-w-xl text-slate-600">${escapeHtml(props.subtitle)}</p>
  ${
    props.cta
      ? `<button class="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white">${escapeHtml(props.cta)}</button>`
      : ""
  }
</section>`;

    case "Card":
      return `<div class="mx-4 my-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <h3 class="text-lg font-semibold">${escapeHtml(props.title)}</h3>
  <p class="mt-2 text-sm text-slate-600">${escapeHtml(props.body)}</p>
</div>`;

    case "Button":
      return `<div class="my-3 px-6"><button class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white">${escapeHtml(props.label)}</button></div>`;

    case "Input":
      return `<div class="my-3 px-6"><label class="block text-sm font-medium text-slate-700">${escapeHtml(props.label)}</label><input class="mt-1.5 w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 text-sm" placeholder="${escapeHtml(props.placeholder)}" /></div>`;

    case "Badge":
      return `<div class="my-2 px-6"><span class="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">${escapeHtml(props.label)}</span></div>`;

    case "StatCard":
      return `<div class="mx-4 my-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><p class="text-sm text-slate-500">${escapeHtml(props.title)}</p><p class="mt-2 text-3xl font-bold">${escapeHtml(props.value)}</p></div>`;

    case "Table": {
      const headers = str(props.headers, "ID,Nomi,Holat")
        .split(",")
        .map((h) => h.trim());
      return `<div class="mx-4 my-3 overflow-x-auto rounded-xl border border-slate-200"><table class="w-full text-left text-sm"><thead class="bg-slate-50 text-xs uppercase text-slate-600"><tr>${headers
        .map((h) => `<th class="px-5 py-3">${escapeHtml(h)}</th>`)
        .join("")}</tr></thead><tbody class="divide-y divide-slate-100"><tr><td colspan="${headers.length}" class="px-5 py-8 text-center text-slate-400">Ma'lumot kelganda ko'rsatiladi</td></tr></tbody></table></div>`;
    }

    case "Alert":
      return `<div class="mx-4 my-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"><p class="font-semibold">${escapeHtml(props.title)}</p><div>${escapeHtml(props.body)}</div></div>`;

    case "Toast":
      return `<div class="fixed bottom-5 right-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-xl">${escapeHtml(props.message)}</div>`;

    case "Loading":
      return `<div class="my-6 flex flex-col items-center gap-3"><div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div><span class="text-sm text-slate-500">${escapeHtml(props.label)}</span></div>`;

    case "Dropdown":
      return `<div class="my-3 px-6"><details class="relative inline-block"><summary class="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm">${escapeHtml(props.label)}</summary></details></div>`;

    case "Grid":
      return `<div class="mx-4 my-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${
        [0, 1, 2]
          .map(
            (i) =>
              `<div class="rounded-xl border border-slate-200 p-6"><h4 class="font-medium">Element ${i + 1}</h4></div>`
          )
          .join("")
      }</div>`;

    case "Container":
      return `<div class="mx-auto my-3 max-w-7xl rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">Container — ichiga blok qo'ying</div>`;

    case "Footer":
      return `<footer class="mt-16 border-t border-slate-200 py-8 text-center text-sm text-slate-500">${escapeHtml(props.text)}</footer>`;

    default:
      return `<div class="mx-4 my-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">Noma'lum blok: ${escapeHtml(component)}</div>`;
  }
}
