import { NextResponse } from "next/server";
import { projectStore } from "@/lib/project-store";
import { layoutToFiles } from "@/lib/exporter";
import { createZip } from "@/lib/zip";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]/export — loyihani ZIP fayl sifatida yuklab olish.
 *
 * ⚠️ Faqat PRO tarif (1+1 qoidasi): bepul foydalanuvchi loyihani ko'rishi mumkin,
 * lekin production'ga chiqarish (eksport) — faqat PRO'da.
 */
export async function GET(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const project = await projectStore.get(id);

  if (!project) {
    return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
  }

  if (project.userId !== user.id && user.role !== "superadmin") {
    return forbidden("Bu loyiha sizniki emas");
  }

  // ── 1+1 qoidasi: eksport faqat PRO'da ──
  if (user.plan !== "pro" && user.role !== "superadmin") {
    return NextResponse.json(
      {
        error:
          "Eksport (production'ga chiqarish) faqat PRO tarifda mavjud. " +
          "Bepul tarifda loyihani faqat preview'da ko'rish mumkin.",
        code: "PLAN_LIMIT",
      },
      { status: 403 }
    );
  }

  if (!project.layout) {
    return NextResponse.json(
      { error: "Loyiha hali saqlanmagan — avval builder'da ishing" },
      { status: 400 }
    );
  }

  let layout;
  try {
    layout = JSON.parse(project.layout);
  } catch {
    return NextResponse.json(
      { error: "Loyiha tarkili buzilgan" },
      { status: 400 }
    );
  }

  const files = layoutToFiles(layout, {
    title: project.title,
    category: project.category,
    summary: project.brief ?? undefined,
    palette: project.palette,
  });

  const zip = createZip(files);
  const filename = `${project.title.replace(/[^\w\- ]/g, "").trim().replace(/\s+/g, "-") || "app"}.zip`;

  return new NextResponse(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zip.length),
    },
  });
}
