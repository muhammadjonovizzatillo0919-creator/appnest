"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Modal, Toast } from "@/components/core";
import { PROJECT_TEMPLATES } from "@/data/templates";
import { useUser } from "@/context/UserContext";

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

const STEPS = [
  {
    n: "01",
    title: "Yo'nalishni tanlang",
    text: "Restoran, do'kon, maktab yoki universitet — yoki o'zingizning sohasini yozing.",
  },
  {
    n: "02",
    title: "AI siz uchun quradi",
    text: "Sizning tavsifingiz asosida sahifalar, bloklar va funksiyalar tayyorlanadi.",
  },
  {
    n: "03",
    title: "Surib tahrirlang",
    text: "Bloklarni joylashtiring, matnlarni o'zgartiring, keyin yuklab oling.",
  },
];

export default function ProjectsPage() {
  const { user } = useUser();
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

  const create = async (payload: {
    title?: string;
    category?: string;
    brief?: string;
    template?: string;
  }) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      setToast(
        payload.template
          ? "Namuna loyiha yaratildi — endi tahrirlang"
          : "Loyiha yaratildi — endi AI bilan generatsiya qiling"
      );
    } catch {
      setError("Serverga ulanib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const publish = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/publish`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Yayqlab bo'lmadi");
        return;
      }

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: data.project.status } : p))
      );
      setToast(`Yayqlandi! Havola: /p/${id}`);
    } catch {
      setError("Yayqlab bo'lmadi");
    }
  };

  const isPro = entitlements?.plan === "pro";
  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,rgba(0,87,255,0.16),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Mening ilovamim
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {firstName ? `Salom, ${firstName}!` : "Salom!"} Nimadan boshlaymiz?
              </h1>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Ilovangizni bir necha daqiqada yarating — dasturlashni bilish shart emas.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <Badge color={isPro ? "green" : "blue"}>
                {entitlements?.label ?? "FREE"} tarif
              </Badge>
              <p className="text-xs text-slate-500">
                {isPro
                  ? "Cheksiz loyiha yarating"
                  : `Limit: ${entitlements?.usedProjects ?? 0}/${entitlements?.maxProjects ?? 1}`}
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                disabled={!entitlements?.canCreateProject}
              >
                + Yangi loyiha
              </Button>
            </div>
          </div>

          {entitlements && !entitlements.canCreateProject && (
            <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              {entitlements.createBlockedReason}
            </div>
          )}

          {/* Qadamlar */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <span className="font-mono text-xs font-bold text-[#0057FF]">
                  {step.n}
                </span>
                <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">Yuklanmoqda...</p>
        ) : projects.length === 0 ? (
          /* ── Bo'sh holat: namuna loyihalar ── */
          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Namuna loyihalardan boshlang
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Bir bosishda tayyor loyiha yaratiladi — keyin o&apos;zgartirasiz.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROJECT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => create({ template: tpl.key })}
                  disabled={saving}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900"
                  style={{ borderTop: `3px solid ${tpl.accent}` }}
                >
                  <span className="text-2xl">{tpl.emoji}</span>
                  <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                    {tpl.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {tpl.brief}
                  </p>
                  <span className="mt-4 inline-block text-xs font-semibold text-[#0057FF]">
                    Boshlang →
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Yuqoridagilar sizga mos emasmi?
              </p>
              <p className="mt-1 text-xs text-slate-500">
                O&apos;z sohangizni yozing — AI qolganini qiladi.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setModalOpen(true)}
              >
                O&apos;z loyihamni yaratish
              </Button>
            </div>
          </section>
        ) : (
          /* ── Loyihalar ro'yxati ── */
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Loyihalarim ({projects.length})
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalOpen(true)}
                disabled={!entitlements?.canCreateProject}
              >
                + Yangi
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${project.id}`}
                        className="block truncate font-semibold text-slate-900 hover:text-[#0057FF] dark:text-white"
                      >
                        {project.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {project.category} · {project.platform === "mobile" ? "Mobil" : "Web"}
                      </p>
                    </div>
                    <Badge
                      color={
                        project.status === "active"
                          ? "green"
                          : project.status === "draft"
                            ? "gray"
                            : "yellow"
                      }
                    >
                      {project.status === "active"
                        ? "Faollashtirilgan"
                        : project.status === "draft"
                          ? "Qoralama"
                          : "Arxiv"}
                    </Badge>
                  </div>

                  {project.brief && (
                    <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-500">
                      {project.brief}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button size="sm" fullWidth>
                        Quruvchi
                      </Button>
                    </Link>

                    <a
                      href={`/p/${project.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      title="Ommaviy havola"
                    >
                      Ko&apos;rish
                    </a>

                    <a
                      href={`/api/projects/${project.id}/export`}
                      className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        isPro
                          ? "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          : "cursor-not-allowed border-dashed border-slate-300 text-slate-300 dark:border-slate-700 dark:text-slate-600"
                      }`}
                      title={isPro ? "ZIP yuklab olish" : "PRO tarif kerak"}
                    >
                      {isPro ? "ZIP" : "ZIP 🔒"}
                    </a>

                    {project.status !== "active" && (
                      <button
                        type="button"
                        onClick={() => publish(project.id)}
                        disabled={!isPro}
                        title={isPro ? "Yayqlash" : "PRO tarif kerak"}
                        className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          isPro
                            ? "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            : "cursor-not-allowed border-dashed border-slate-300 text-slate-300 dark:border-slate-700 dark:text-slate-600"
                        }`}
                      >
                        {isPro ? "Yayqlash" : "Yayqlash 🔒"}
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Yangi loyiha modali */}
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
            <Button onClick={() => create({ title, category, brief })} loading={saving}>
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
    </div>
  );
}
