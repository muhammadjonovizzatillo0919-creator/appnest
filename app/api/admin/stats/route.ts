import { NextResponse } from "next/server";
import { projectStore } from "@/lib/project-store";
import { userStore } from "@/lib/user-store";
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

  // Har bir loyiha uchun urinishlar soni
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
        owner: owner ? { name: owner.name, email: owner.email, plan: owner.plan } : null,
        attempts: attempts.length,
        failedAttempts: attempts.filter((a) => a.status === "error").length,
        totalDurationMs: attempts.reduce((sum, a) => sum + (a.durationMs ?? 0), 0),
        createdAt: project.createdAt,
      };
    })
  );

  return NextResponse.json({ stats, projects: projectsWithAttempts });
}
