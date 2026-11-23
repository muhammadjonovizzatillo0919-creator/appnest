"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Grid,
  StatCard,
  Table,
  Toast,
  type TableColumn,
} from "@/components/core";
import { DashboardShell } from "@/components/layout";
import { useUser } from "@/context/UserContext";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string | null;
}

interface AdminProject {
  id: string;
  title: string;
  category: string;
  platform: string;
  status: string;
  owner: { id: string; name: string; email: string; plan: string } | null;
  attempts: number;
  failedAttempts: number;
  totalDurationMs: number;
  createdAt: string;
}

interface Stats {
  users: { total: number; free: number; pro: number; superadmins: number };
  projects: { total: number; draft: number; active: number };
  categories: { category: string; count: number }[];
  attempts: { total: number; failed: number; avgDurationMs: number };
  storage?: "github" | "file" | "memory";
}

export default function AdminPage() {
  const { user: currentUser } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<"loyihalar" | "foydalanuvchilar">("loyihalar");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Statistikani yuklab bo'lmadi");
        setStats(data.stats);
        setProjects(data.projects ?? []);
        setUsers(data.users ?? []);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Xatolik"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/stats")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Statistikani yuklab bo'lmadi");
        if (cancelled) return;
        setStats(data.stats);
        setProjects(data.projects ?? []);
        setUsers(data.users ?? []);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Xatolik");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateUser = async (id: string, patch: { plan?: string; role?: string }) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "O'zgartirib bo'lmadi");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, plan: data.user.plan, role: data.user.role }
            : u
        )
      );
      setToast("Foydalanuvchi yangilandi");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    }
  };

  /* в”Ђв”Ђ Loyihalar jadvali в”Ђв”Ђ */
  const projectColumns: TableColumn<AdminProject>[] = [
    {
      key: "title",
      label: "Loyiha",
      render: (p) => (
        <div className="min-w-0">
          <Link
            href={`/projects/${p.id}`}
            className="block truncate font-medium text-slate-900 hover:text-brand dark:text-white"
          >
            {p.title}
          </Link>
          <p className="truncate text-xs text-slate-400">
            {p.owner?.name ?? "O&apos;chirilgan"} · {p.category}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Holat",
      render: (p) => (
        <Badge color={p.status === "active" ? "green" : p.status === "draft" ? "gray" : "yellow"}>
          {p.status}
        </Badge>
      ),
    },
    {
      key: "attempts",
      label: "Urinishlar",
      render: (p) => (
        <span className="font-mono text-xs">
          {p.attempts}
          {p.failedAttempts > 0 && (
            <span className="ml-1 text-red-500">({p.failedAttempts} xato)</span>
          )}
        </span>
      ),
    },
    {
      key: "duration",
      label: "Vaqt",
      render: (p) => (
        <span className="font-mono text-xs text-slate-500">
          {p.totalDurationMs ? `${(p.totalDurationMs / 1000).toFixed(1)}s` : "—"}
        </span>
      ),
    },
    {
      key: "created",
      label: "Sana",
      render: (p) => (
        <span className="text-xs text-slate-500">
          {new Date(p.createdAt).toLocaleDateString("uz-UZ")}
        </span>
      ),
    },
  ];

  /* в”Ђв”Ђ Foydalanuvchilar jadvali в”Ђв”Ђ */
  const userColumns: TableColumn<AdminUser>[] = [
    {
      key: "name",
      label: "Foydalanuvchi",
      render: (u) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900 dark:text-white">{u.name}</p>
          <p className="truncate text-xs text-slate-400">{u.email}</p>
        </div>
      ),
    },
    {
      key: "plan",
      label: "Tarif",
      render: (u) => (
        <Badge color={u.plan === "pro" ? "green" : "blue"}>
          {u.plan === "pro" ? "PRO" : "FREE"}
        </Badge>
      ),
    },
    {
      key: "role",
      label: "Rol",
      render: (u) => (
        <Badge color={u.role === "superadmin" ? "purple" : "gray"}>{u.role}</Badge>
      ),
    },
    {
      key: "actions",
      label: "Amallar",
      render: (u) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={u.plan === "pro" ? "outline" : "secondary"}
            onClick={() =>
              updateUser(u.id, { plan: u.plan === "pro" ? "free" : "pro" })
            }
          >
            {u.plan === "pro" ? "FREE qilish" : "PRO berish"}
          </Button>
          {u.id !== currentUser?.id && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                updateUser(u.id, {
                  role: u.role === "superadmin" ? "user" : "superadmin",
                })
              }
            >
              {u.role === "superadmin" ? "Rolni olish" : "Admin qilish"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardShell title="Super Admin">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Ogohlantirish: ma'lumotlar saqlanmasligi mumkin */}
      {stats && stats.storage === "memory" && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <span>
            вљ пёЏ Ma&apos;lumotlar saqlanmayapti — serverless muhitida bazasi vaqtinchalik.
            Doimiy saqlash uchun <b>Turso</b> yoki <b>GitHub ombori</b> kerak
            (<code className="font-mono text-xs">GITHUB_TOKEN</code> + <code className="font-mono text-xs">GITHUB_REPO</code>).
          </span>
          <a
            href="https://turso.tech"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-amber-400/50 px-3 py-1.5 text-xs font-semibold transition hover:bg-amber-400/20"
          >
            Turso&apos;ni ulash →
          </a>
        </div>
      )}

      {stats && (stats.storage === "github" || stats.storage === "file") && (
        <div className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          вњ… Ma&apos;lumotlar doimiy saqlanmoqda
          ({stats.storage === "github" ? "GitHub ombori" : "lokal fayl / Turso"}).
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Yuklanmoqda...</p>
      ) : (
        <>
          {/* Statistika */}
          <Grid cols={4} gap="md">
            <StatCard
              title="Foydalanuvchilar"
              value={stats?.users.total ?? 0}
              trend={{
                value: `${stats?.users.free ?? 0} free · ${stats?.users.pro ?? 0} pro`,
              }}
            />
            <StatCard
              title="Loyihalar"
              value={stats?.projects.total ?? 0}
              trend={{
                value: `${stats?.projects.active ?? 0} faol · ${stats?.projects.draft ?? 0} draft`,
              }}
            />
            <StatCard
              title="AI urinishlari"
              value={stats?.attempts.total ?? 0}
              trend={{
                value: `${stats?.attempts.failed ?? 0} xato`,
                positive: (stats?.attempts.failed ?? 0) === 0,
              }}
            />
            <StatCard
              title="O'rtacha vaqt"
              value={`${((stats?.attempts.avgDurationMs ?? 0) / 1000).toFixed(1)}s`}
              trend={{ value: "bitta generatsiya" }}
            />
          </Grid>

          {/* Kategoriyalar */}
          <Card className="mt-6">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
              Kategoriyalar bo&apos;yicha taqsimot
            </h3>
            {stats && stats.categories.length > 0 ? (
              <div className="space-y-3">
                {stats.categories.map((c) => {
                  const max = Math.max(
                    ...stats.categories.map((x) => x.count),
                    1
                  );
                  const percent = Math.round((c.count / max) * 100);
                  return (
                    <div key={c.category}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {c.category}
                        </span>
                        <span className="font-mono text-slate-400">{c.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand to-[#00D287]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Hali loyiha yo&apos;q</p>
            )}
          </Card>

          {/* Jadval */}
          <Card className="mt-6 overflow-hidden p-0" hover={false}>
            <div className="flex items-center gap-1 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              {(
                [
                  ["loyihalar", `Loyihalar (${projects.length})`],
                  ["foydalanuvchilar", `Foydalanuvchilar (${users.length})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    tab === key
                      ? "bg-brand text-white"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {label}
                </button>
              ))}

              <Button size="sm" variant="ghost" className="ml-auto" onClick={load}>
                Yangilash
              </Button>
            </div>

            {tab === "loyihalar" ? (
              <Table<AdminProject>
                columns={projectColumns}
                data={projects}
                emptyMessage="Hali loyiha yaratilmagan"
              />
            ) : (
              <Table<AdminUser>
                columns={userColumns}
                data={users}
                emptyMessage="Hali foydalanuvchi yo'q"
              />
            )}
          </Card>
        </>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </DashboardShell>
  );
}
