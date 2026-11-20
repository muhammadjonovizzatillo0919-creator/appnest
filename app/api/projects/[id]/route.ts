import { NextResponse } from "next/server";
import { projectStore } from "@/lib/project-store";
import {
  canActivateProject,
  canGenerate,
  describeEntitlements,
} from "@/lib/entitlements";
import { getCurrentUser, unauthorized, forbidden, badRequest } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * JSON maydonini normalizatsiya qiladi:
 * - obyekt kelgan bo'lsa → JSON.stringify
 * - allaqachon JSON satr bo'lsa → o'zgarishsiz
 * (ikki marta kodlashdan saqlaydi)
 */
function toJsonColumn(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * GET    /api/projects/[id] — loyiha + AI urinishlari
 * PATCH  /api/projects/[id] — yangilash (status: active = faollashtirish)
 * DELETE /api/projects/[id] — o'chirish
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

  const attempts = await projectStore.attempts(id);

  return NextResponse.json({
    project,
    attempts,
    entitlements: describeEntitlements(
      user,
      await projectStore.countByUser(project.userId)
    ),
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const project = await projectStore.get(id);

  if (!project) {
    return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
  }

  let body: {
    title?: string;
    category?: string;
    brief?: string;
    platform?: "web" | "mobile";
    status?: "draft" | "active" | "archived";
    aiSpec?: unknown;
    layout?: unknown;
    palette?: string;
  };

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  // ── Faollashtirish (production) — faqat PRO ──
  if (body.status === "active") {
    const permission = canActivateProject(user, {
      status: project.status,
      user_id: project.userId,
    });

    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.reason, code: "PLAN_LIMIT" },
        { status: 403 }
      );
    }
  }

  // ── AI generatsiya ──
  const isGenerating = body.aiSpec !== undefined;
  if (isGenerating) {
    const count = await projectStore.countByUser(project.userId);
    const permission = canGenerate(
      user,
      { user_id: project.userId },
      count
    );

    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.reason, code: "PLAN_LIMIT" },
        { status: 403 }
      );
    }
  }

  const updated = await projectStore.update(id, {
    title: body.title,
    category: body.category,
    brief: body.brief,
    platform: body.platform,
    status: body.status,
    aiSpec: toJsonColumn(body.aiSpec),
    layout: toJsonColumn(body.layout),
    palette: body.palette,
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
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

  await projectStore.remove(id);
  return NextResponse.json({ ok: true });
}
