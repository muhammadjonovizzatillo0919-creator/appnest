"use client";

import { useEffect, useState } from "react";
import { Button, Card, Grid, StatCard, Table, type TableColumn } from "@/components/core";
import { DashboardShell } from "@/components/layout";
import { useUser } from "@/context/UserContext";

interface Client {
  id: number;
  name: string;
  email: string;
  status: "Faol" | "Arxiv";
  note: string | null;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  archived: number;
  recentActivity: number;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [rows, setRows] = useState<Client[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    archived: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ])
      .then(([clientsData, statsData]) => {
        if (cancelled) return;
        setRows(clientsData.clients ?? []);
        setStats(statsData);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Ma'lumotni yuklab bo'lmadi");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const columns: TableColumn<Client>[] = [
    { key: "id", label: "ID", accessor: (c) => c.id },
    {
      key: "name",
      label: "Ism",
      render: (c) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{c.email}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Holat",
      render: (c) => (
        <span
          className={`inline-flex items-center gap-1.5 text-sm ${
            c.status === "Faol"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              c.status === "Faol" ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {c.status}
        </span>
      ),
    },
    {
      key: "updated",
      label: "Yangilangan",
      accessor: (c) => new Date(c.updatedAt).toLocaleDateString("uz-UZ"),
    },
  ];

  return (
    <DashboardShell title="Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Bugun nima yaratamiz{user?.name ? `, ${user.name.split(" ")[0]}` : ""}?
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Yaratgan ilovalaringiz va ularning holati — bir joyda.
        </p>
      </div>

      <Grid cols={4} gap="md">
        <StatCard
          title="Jami mijozlar"
          value={stats.total}
          trend={{ value: `${stats.active} ta faol` }}
        />
        <StatCard
          title="Faol mijozlar"
          value={stats.active}
          trend={{ value: `${stats.archived} ta arxivda` }}
        />
        <StatCard
          title="Arxivlangan"
          value={stats.archived}
          trend={{ value: "O'chirilmagan" }}
        />
        <StatCard
          title="Bu hafta amal"
          value={stats.recentActivity}
          trend={{ value: "Oxirgi 7 kun" }}
        />
      </Grid>

      <Card className="mt-8 overflow-hidden p-0" hover={false}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            So&apos;nggi mijozlar
          </h3>
          <Button size="sm" variant="ghost" onClick={() => location.reload()}>
            Yangilash
          </Button>
        </div>

        {error ? (
          <p className="px-6 py-8 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : (
          <Table<Client>
            columns={columns}
            data={rows.slice(0, 8)}
            loading={loading}
            emptyMessage="Hali mijoz yo'q"
          />
        )}
      </Card>
    </DashboardShell>
  );
}
