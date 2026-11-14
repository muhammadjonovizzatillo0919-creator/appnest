import { NextResponse } from "next/server";
import { projectStore } from "@/lib/project-store";
import { generateAppSpec } from "@/lib/ai-service";
import { canGenerate } from "@/lib/entitlements";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * AI generatsiya sekin bo'lishi mumkin (model chaqiruvi + JSON tahlil).
 * Vercel'da standart limit 10 soniya — timeout bo'lishi uchun oshiriladi.
 */
export const maxDuration = 60;

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/projects/[id]/generate — AI ilova spetsifikatsiyasini yaratadi.
 *
 * - 1+1 qoidasi bilan tekshiriladi
 * - Har bir urinish jurnalda yoziladi (urinishlar soni, davomiylik, model)
 * - Natija `projects.ai_spec` ga saqlanadi
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

  // 1+1 qoidasi
  const count = await projectStore.countByUser(project.userId);
  const permission = canGenerate(user, { user_id: project.userId }, count);

  if (!permission.allowed) {
    return NextResponse.json(
      { error: permission.reason, code: "PLAN_LIMIT" },
      { status: 403 }
    );
  }

  // Urinish raqami
  const previousAttempts = await projectStore.attempts(id);
  const attemptNo = previousAttempts.length + 1;

  const result = await generateAppSpec({
    title: project.title,
    category: project.category,
    brief: project.brief ?? undefined,
    platform: project.platform,
  });

  // Urishni jurnalga yozish
  await projectStore.logAttempt({
    projectId: id,
    attemptNo,
    model: result.model ?? undefined,
    durationMs: result.durationMs,
    status: result.generatedBy === "gemini" ? "ok" : "error",
    error: result.error,
  });

  // Natija faqat to'g'ri generatsiya qilinganda saqlanadi
  if (result.generatedBy === "gemini") {
    await projectStore.update(id, { aiSpec: JSON.stringify(result.spec) });
  }

  return NextResponse.json({
    spec: result.spec,
    generatedBy: result.generatedBy,
    model: result.model,
    durationMs: result.durationMs,
    attemptNo,
    warning: result.error,
  });
}
