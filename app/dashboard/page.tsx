"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Grid, StatCard, Table, type TableColumn } from "@/components/core";
import { DashboardShell } from "@/components/layout";
import { useUser } from "@/context/UserContext";

interface Row {
  id: string;
  name: string;
  email: string;
  status: "Faol" | "Arxiv";
}

const SEED: Row[] = [
  { id: "1", name: "Alisher Karimov", email: "alisher@company.uz", status: "Faol" },
  { id: "2", name: "Dilnoza Rustamova", email: "dilnoza@company.uz", status: "Faol" },
  { id: "3", name: "Sardor Tursunov", email: "sardor@company.uz", status: "Arxiv" },
  { id: "4", name: "Nilufar Aliyeva", email: "nilufar@company.uz", status: "Faol" },
  { id: "5", name: "Javlon Ergashev", email: "javlon@company.uz", status: "Faol" },
];

export default function DashboardPage() {
  const { user, totalClients, setTotalClients } = useUser();
  const [rows, setRows] = useState<Row[]>(SEED);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTotalClients(rows.length);
  }, [rows, setTotalClients]);

  const toggle = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === "Faol" ? "Arxiv" : "Faol" } : r
      )
    );
  };

  const columns: TableColumn<Row>[] = [
    { key: "id", label: "ID", accessor: (r) => r.id },
    { key: "name", label: "Ism", accessor: (r) => r.name },
    { key: "email", label: "Email", accessor: (r) => r.email },
    {
      key: "status",
      label: "Holat",
      render: (r) => (
        <Badge color={r.status === "Faol" ? "green" : "gray"}>{r.status}</Badge>
      ),
    },
    {
      key: "actions",
      label: "Amallar",
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => toggle(r.id)}>
          {r.status === "Faol" ? "Arxivlash" : "Faollashtirish"}
        </Button>
      ),
    },
  ];

  return (
    <DashboardShell title="Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Xush kelibsiz{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Bugungi holat ko&apos;rsatkichlari quyida.
        </p>
      </div>

      <Grid cols={4} gap="md">
        <StatCard
          title="Jami mijozlar"
          value={totalClients}
          trend={{ value: "+2 bu hafta" }}
        />
        <StatCard
          title="Faol sessiyalar"
          value={12}
          trend={{ value: "+18% o'tgan haftaga" }}
        />
        <StatCard title="Yaratilgan hisobotlar" value={48} trend={{ value: "+7" }} />
        <StatCard title="Xatolar" value={0} trend={{ value: "Toza holat" }} />
      </Grid>

      <Card className="mt-8 overflow-hidden p-0" hover={false}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            So&apos;nggi mijozlar
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setRows(SEED);
                setLoading(false);
              }, 500);
            }}
            loading={loading}
          >
            Yangilash
          </Button>
        </div>
        <Table<Row>
          columns={columns}
          data={rows}
          loading={loading}
          onDelete={(row) => setRows((prev) => prev.filter((r) => r.id !== row.id))}
        />
      </Card>
    </DashboardShell>
  );
}
