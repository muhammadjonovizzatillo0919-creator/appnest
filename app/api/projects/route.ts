import { NextResponse } from "next/server";
import { projectStore } from "@/lib/project-store";
import { canCreateProject, describeEntitlements } from "@/lib/entitlements";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/projects — foydalanuvchining loyihalari + tarif holati
 * POST /api/projects — yangi loyiha (1+1 qoidasi bo'yicha tekshiriladi)
 */

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const projects = await projectStore.listByUser(user.id);
  const entitlements = describeEntitlements(user, projects.length);

  return NextResponse.json({ projects, entitlements });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: {
    title?: string;
    category?: string;
    brief?: string;
    platform?: "web" | "mobile";
  };

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const title = String(body.title ?? "").trim();
  const category = String(body.category ?? "").trim();
  const brief = body.brief ? String(body.brief).trim() : undefined;
  const platform = body.platform === "mobile" ? "mobile" : "web";

  if (title.length < 2) {
    return badRequest("Loyiha nomi kamida 2 ta belgidan iborat bo'lishi kerak");
  }
  if (!category) {
    return badRequest("Kategoriya tanlanish shart (yoki 'Boshqa' + erkin matn)");
  }

  // ── 1+1 qoidasi: server tomonda tekshiriladi ──
  const currentCount = await projectStore.countByUser(user.id);
  const permission = canCreateProject(user, currentCount);

  if (!permission.allowed) {
    return NextResponse.json(
      {
        error: permission.reason,
        code: "PLAN_LIMIT",
        entitlements: describeEntitlements(user, currentCount),
      },
      { status: 403 }
    );
  }

  const project = await projectStore.create({
    userId: user.id,
    title,
    category,
    brief,
    platform,
  });

  const entitlements = describeEntitlements(user, currentCount + 1);

  return NextResponse.json({ project, entitlements }, { status: 201 });
}
