"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Input,
  Modal,
  Table,
  Toast,
  type TableColumn,
} from "@/components/core";
import { DashboardShell } from "@/components/layout";
import { useUser } from "@/context/UserContext";

interface Client {
  id: number;
  name: string;
  email: string;
  status: "Faol" | "Arxiv";
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { setTotalClients } = useUser();

  /** Ma'lumotni oladi — holatni o'zgartirmaydi (faqat Promise qaytaradi) */
  const fetchClients = useCallback(async (): Promise<Client[]> => {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error(`Server javobi: ${res.status}`);

    const data: { id: number; name: string; email: string }[] = await res.json();
    return data.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: "Faol" as const,
    }));
  }, []);

  /**
   * React 19 `set-state-in-effect` qoidasi: effekt ichida setState
   * chaqirilmasligi kerak — shuning uchun holat yangilanishlari
   * promise callback'larida bajariladi.
   */
  useEffect(() => {
    let cancelled = false;

    fetchClients()
      .then((mapped) => {
        if (cancelled) return;
        setClients(mapped);
        setTotalClients(mapped.length);
        setError(null);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(
          e instanceof Error
            ? `Ma'lumotni yuklab bo'lmadi: ${e.message}`
            : "Ma'lumotni yuklab bo'lmadi"
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchClients, setTotalClients]);

  /** "Qayta urinish" tugmasi uchun qayta yuklash */
  const reload = () => {
    setLoading(true);
    fetchClients()
      .then((mapped) => {
        setClients(mapped);
        setTotalClients(mapped.length);
        setError(null);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(
          e instanceof Error
            ? `Ma'lumotni yuklab bo'lmadi: ${e.message}`
            : "Ma'lumotni yuklab bo'lmadi"
        );
        setLoading(false);
      });
  };

  const toggleStatus = (id: number) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "Faol" ? "Arxiv" : "Faol" } : c
      )
    );
  };

  const deleteClient = (id: number) => {
    setClients((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setTotalClients(next.length);
      return next;
    });
    setToast("Mijoz o'chirildi");
  };

  const addClient = () => {
    if (!name.trim() || !email.trim()) {
      setFormError("Ism va email to'ldirilishi shart");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Email manzili noto'g'ri");
      return;
    }

    setFormError(null);
    setClients((prev) => {
      const next = [
        ...prev,
        { id: prev.length + 1, name, email, status: "Faol" as const },
      ];
      setTotalClients(next.length);
      return next;
    });
    setName("");
    setEmail("");
    setModalOpen(false);
    setToast("Yangi mijoz qo'shildi");
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const columns: TableColumn<Client>[] = [
    { key: "id", label: "ID", accessor: (c) => c.id },
    { key: "name", label: "Ism", accessor: (c) => c.name },
    { key: "email", label: "Email", accessor: (c) => c.email },
    {
      key: "status",
      label: "Holat",
      render: (c) => (
        <Badge color={c.status === "Faol" ? "green" : "gray"}>{c.status}</Badge>
      ),
    },
    {
      key: "actions",
      label: "Amallar",
      render: (c) => (
        <Button size="sm" variant="outline" onClick={() => toggleStatus(c.id)}>
          {c.status === "Faol" ? "Arxivlash" : "Faollashtirish"}
        </Button>
      ),
    },
  ];

  return (
    <DashboardShell title="Mijozlar">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Mijozlar ro&apos;yxati
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Jami {clients.length} ta mijoz
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Dropdown
            label="Amallar"
            items={[
              { label: "Ma'lumotni yangilash", onClick: reload },
              { label: "Hammasini arxivlash", danger: true, onClick: () =>
                setClients((prev) => prev.map((c) => ({ ...c, status: "Arxiv" as const })))
              },
            ]}
          />
          <Button onClick={() => setModalOpen(true)}>+ Yangi mijoz</Button>
        </div>
      </div>

      {error ? (
        <Card className="border-red-200 dark:border-red-500/30">
          <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
          <Button className="mt-4" variant="outline" onClick={reload}>
            Qayta urinish
          </Button>
        </Card>
      ) : (
        <Card hover={false} className="overflow-hidden p-0">
          <Table<Client>
            columns={columns}
            data={filtered}
            loading={loading}
            emptyMessage="Mijoz topilmadi"
            onDelete={(row) => deleteClient(row.id)}
          />
        </Card>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Mijoz qo'shish"
        description="Ma'lumotlarni to'ldiring va saqlang"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={addClient}>Saqlash</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Mijoz ismi"
            placeholder="Ism..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formError && !name.trim() ? "Ismni kiriting" : undefined}
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={formError && name.trim() ? formError : undefined}
          />
        </div>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </DashboardShell>
  );
}
