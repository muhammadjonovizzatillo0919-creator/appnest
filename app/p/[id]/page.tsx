import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projectStore } from "@/lib/project-store";
import { getCurrentUser } from "@/lib/session";
import { PublicApp } from "@/components/builder/PublicApp";
import type { BuilderLayout } from "@/lib/builder";

export const dynamic = "force-dynamic";

/**
 * Ommaviy loyiha sahifasi — `/p/[id]`.
 *
 * Bu "publish"ning haqiqiy ko'rinishi: foydalanuvchi qurgan ilova
 * tashqi hosting'siz, o'z havolasi bilan ochiladi.
 *
 * Faqat `status = 'active'` (PRO'da faollashtirilgan) loyihalar ommaga ochiq.
 * Qoralama (draft) loyihalar faqat egasi uchun ko'rinadi.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await projectStore.get(id);

  if (!project) return { title: "Loyiha topilmadi" };

  return {
    title: `${project.title} — AppNest`,
    description:
      project.brief ?? `${project.title} ilovasi AppNest orqali yaratilgan.`,
    openGraph: {
      title: project.title,
      description: project.brief ?? undefined,
      type: "website",
    },
  };
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await projectStore.get(id);

  if (!project) notFound();

  // Draft loyihalar faqat egasi (yoki superadmin) uchun
  if (project.status !== "active") {
    const user = await getCurrentUser();
    const isOwner = user?.id === project.userId || user?.role === "superadmin";
    if (!isOwner) notFound();
  }

  let layout: BuilderLayout = { platform: "web", rows: [] };

  if (project.layout) {
    try {
      layout = JSON.parse(project.layout) as BuilderLayout;
    } catch {
      /* bo'sh */
    }
  } else if (project.aiSpec) {
    try {
      const spec = JSON.parse(project.aiSpec);
      layout = {
        platform: spec.platform ?? "web",
        rows: (spec.pages ?? []).flatMap(
          (p: { rows: { id: string; type: string; blocks: unknown[] }[] }) =>
            p.rows.map((r) => ({
              id: r.id,
              type: "window" as const,
              blocks: r.blocks as never,
            }))
        ),
      };
    } catch {
      /* bo'sh */
    }
  }

  return (
    <PublicApp
      title={project.title}
      category={project.category}
      layout={layout}
      isDraft={project.status !== "active"}
    />
  );
}
