"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Modal, Toast } from "@/components/core";
import { DashboardShell } from "@/components/layout";

interface Project {
  id: string;
  title: string;
  category: string;
  brief: string | null;
  platform: "web" | "mobile";
  status: "draft" | "active" | "archived";
  createdAt: string;
}

interface Entitlements {
  plan: string;
  maxProjects: number;
  usedProjects: number;
  remainingProjects: number;
  canCreateProject: boolean;
  createBlockedReason?: string;
  canActivate: boolean;
  label: string;
}

const CATEGORIES = [
  { key: "restoran", label: "Restoran" },
  { key: "do-kon", label: "Do'kon" },
  { key: "maktab", label: "Maktab" },
  { key: "universitet", label: "Universitet" },
  { key: "boshqa", label: "Boshqa" },
];

const STATUS_TONE = {
  draft: "gray",
  active: "green",
  archived: "gray",
} as const;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("restoran");
  const [brief, setBrief] = useState("");

  useEffect(() => {
    let cancelled = false;

    // Holat effekt ichida emas, promise callback'ida yangilanadi
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setProjects(data.projects ?? []);
        setEntitlements(data.entitlements ?? null);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Loyihalarni yuklab bo'lmadi");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const create = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, brief }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Loyiha yaratib bo'lmadi");
        setSaving(false);
        return;
      }

      setProjects((prev) => [data.project, ...prev]);
      setEntitlements(data.entitlements ?? null);
      setTitle("");
      setBrief("");
      setModalOpen(false);
      setToast("Loyiha yaratildi вЂ” endi AI bilan generatsiya qiling");
    } catch {
      setError("Serverga ulanib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell title="Loyihalarim">
      {/* Tarif holati */}
      {entitlements && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Badge color={entitlements.plan === "pro" ? "green" : "blue"}>
              {entitlements.label}
            </Badge>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {entitlements.plan === "pro"
                ? "Cheksiz loyiha yaratish mumkin"
                : `1+1 qoidasi: ${entitlements.usedProjects}/${entitlements.maxProjects} loyiha ishlatilgan`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            disabled={!entitlements.canCreateProject}
          >
            + Yangi loyiha
          </Button>
        </div>
      )}

      {entitlements && !entitlements.canCreateProject && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {entitlements.createBlockedReason}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Yuklanmoqda...</p>
      ) : projects.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-slate-500">
            Hali loyiha yo&apos;q. &quot;Yangi loyiha&quot; tugmasini bosing.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/projects/${project.id}`}
                    className="truncate text-base font-semibold text-slate-900 hover:text-[#0057FF] dark:text-white"
                  >
                    {project.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {project.category} В· {project.platform === "mobile" ? "Mobil" : "Web"}
                  </p>
                </div>
                <Badge color={STATUS_TONE[project.status]}>{project.status}</Badge>
              </div>

              {project.brief && (
                <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-500">
                  {project.brief}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <Link href={`/projects/${project.id}`} className="flex-1">
                  <Button size="sm" fullWidth>
                    Quruvchini ochish
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Yangi loyiha"
        description="Nima qurmoqchisiz? AI qolganini o'zi qiladi."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={create} loading={saving}>
              Yaratish
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Loyiha nomi"
            placeholder="Masalan: Restoran menyusi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Kategoriya
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-[#0057FF] dark:border-slate-700 dark:bg-slate-900"
            >
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Erkin matn (ixtiyoriy)
            </span>
            <textarea
              rows={3}
              placeholder="Qanday ilova kerakligini yozing..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-[#0057FF] dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </DashboardShell>
  );
}
