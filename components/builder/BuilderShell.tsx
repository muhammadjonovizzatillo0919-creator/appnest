"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BlockPalette } from "./BlockPalette";
import { BuilderCanvas } from "./BuilderCanvas";
import { PropertyPanel } from "./PropertyPanel";
import { Button } from "@/components/core";
import {
  type BuilderBlock,
  type BuilderLayout,
  specToLayout,
  updateBlockProps,
} from "@/lib/builder";

/**
 * Builder qobig'i — palitra | canvas | property panel.
 *
 * Vazifalar:
 * - Loyihani yuklash (AI spetsifikatsiyasi yoki saqlangan layout)
 * - "AI bilan generatsiya qilish"
 * - Layout'ni tahrirlash va saqlash
 */
export function BuilderShell({ projectId }: { projectId: string }) {
  const router = useRouter();

  const [layout, setLayout] = useState<BuilderLayout>({
    platform: "web",
    rows: [],
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");

  // ── Loyihani yuklash ──
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const project = data.project;
        if (!project) {
          setError("Loyiha topilmadi");
          setLoading(false);
          return;
        }

        setProjectTitle(project.title);

        // Saqlangan layout bo'lsa — uni ishlatamiz, yo'q bo'lsa AI spetsifikatsiyasidan
        if (project.layout) {
          try {
            setLayout(JSON.parse(project.layout) as BuilderLayout);
          } catch {
            setLayout({ platform: "web", rows: [] });
          }
        } else if (project.aiSpec) {
          try {
            setLayout(specToLayout(JSON.parse(project.aiSpec)));
          } catch {
            setLayout({ platform: "web", rows: [] });
          }
        }

        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Loyihani yuklab bo'lmadi");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const selectedBlock = useMemo<BuilderBlock | null>(() => {
    if (!selectedId) return null;
    for (const row of layout.rows) {
      const found = row.blocks.find((b) => b.id === selectedId);
      if (found) return found;
    }
    return null;
  }, [layout, selectedId]);

  // ── Saqlash ──
  const save = async () => {
    setSaving(true);
    setStatus("Saqlanmoqda...");
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: layout }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Saqlab bo'lmadi");
      }

      setStatus("Saqlandi");
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlab bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  // ── AI generatsiya ──
  const generate = async () => {
    setGenerating(true);
    setStatus("AI generatsiya qilmoqda...");
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.spec) {
        setLayout(specToLayout(data.spec));
      }

      setStatus(
        data.generatedBy === "gemini"
          ? `AI tayyor (${data.durationMs}ms)`
          : "Shablon asosida tayyor"
      );

      if (data.warning) setError(data.warning);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generatsiya muvaffaqiyatsiz");
      setStatus("");
    } finally {
      setGenerating(false);
    }
  };

  const handlePropsChange = (props: Record<string, unknown>) => {
    if (!selectedId) return;
    setLayout((prev) => updateBlockProps(prev, selectedId, props));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500 dark:bg-[#0b1120]">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-[#0b1120]">
      {/* Yuqori panel */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Orqaga"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {projectTitle || "Vizual quruvchi"}
            </p>
            <p className="text-[11px] text-slate-400">
              {layout.rows.length} qator ·{" "}
              {layout.rows.reduce((sum, r) => sum + r.blocks.length, 0)} blok
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status && (
            <span className="hidden text-xs text-slate-500 sm:inline">{status}</span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={generate}
            loading={generating}
          >
            ✦ AI bilan generatsiya
          </Button>
          <Button size="sm" onClick={save} loading={saving}>
            Saqlash
          </Button>
        </div>
      </header>

      {error && (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {error}
        </div>
      )}

      {/* Asosiy qator */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[240px_1fr_300px]">
        {/* Palitra */}
        <aside className="hidden min-h-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
          <BlockPalette />
        </aside>

        {/* Canvas */}
        <main className="min-h-0 overflow-y-auto">
          <BuilderCanvas
            layout={layout}
            onChange={setLayout}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </main>

        {/* Property panel */}
        <aside className="hidden min-h-0 border-l border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
          <PropertyPanel
            block={selectedBlock}
            onChange={handlePropsChange}
            onClose={() => setSelectedId(null)}
          />
        </aside>
      </div>
    </div>
  );
}
