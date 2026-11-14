import { NextResponse } from "next/server";
import { userStore } from "@/lib/user-store";
import { projectStore } from "@/lib/project-store";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stats — Super Admin dashboard statistikasi.
 * Faqat `role = 'superadmin'` foydalanuvchilar uchun.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  if (user.role !== "superadmin") {
    return forbidden("Bu bo'lim faqat super admin uchun");
  }

  const stats = await projectStore.adminStats();
  const projects = await projectStore.listAll();

  // Loyihalar + egasi + urinishlar
  const projectsWithAttempts = await Promise.all(
    projects.map(async (project) => {
      const attempts = await projectStore.attempts(project.id);
      const owner = await userStore.findById(project.userId);

      return {
        id: project.id,
        title: project.title,
        category: project.category,
        platform: project.platform,
        status: project.status,
        owner: owner
          ? {
              id: owner.id,
              name: owner.name,
              email: owner.email,
              plan: owner.plan,
            }
          : null,
        attempts: attempts.length,
        failedAttempts: attempts.filter((a) => a.status === "error").length,
        totalDurationMs: attempts.reduce((sum, a) => sum + (a.durationMs ?? 0), 0),
        createdAt: project.createdAt,
      };
    })
  );

  // Foydalanuvchilar ro'yxati
  const users = await userStore.listAll();

  return NextResponse.json({ stats, projects: projectsWithAttempts, users });
}
