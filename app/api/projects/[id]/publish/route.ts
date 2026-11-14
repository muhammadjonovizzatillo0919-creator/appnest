import { NextResponse } from "next/server";
import { projectStore } from "@/lib/project-store";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/projects/[id]/publish — loyihani faollashtirish (production).
 *
 * ⚠️ 1+1 qoidasi: faqat PRO tarif. Bepul loyiha faqat preview'da ko'rinadi.
 */
export async function POST(_req: Request, { params }: Params) {
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

  if (!project.layout) {
    return NextResponse.json(
      { error: "Loyiha hali saqlanmagan — avval builder'da ishing" },
      { status: 400 }
    );
  }

  // ── 1+1 qoidasi: faollashtirish faqat PRO'da ──
  if (user.plan !== "pro" && user.role !== "superadmin") {
    return NextResponse.json(
      {
        error:
          "Bepul tarifda loyihani faollashtirish (production) mumkin emas. " +
          "PRO tarifga o'ting — faqat shunda loyihangiz ishlaydi.",
        code: "PLAN_LIMIT",
      },
      { status: 403 }
    );
  }

  const updated = await projectStore.update(id, { status: "active" });

  return NextResponse.json({
    project: updated,
    message: "Loyiha faollashtirildi. Endi yuklab olib ishga tushirsangiz bo'ladi.",
  });
}
