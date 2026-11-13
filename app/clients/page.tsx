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
  note: string | null;
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
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { setTotalClients } = useUser();

  const loadClients = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/clients${query ? `?search=${encodeURIComponent(query)}` : ""}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Ma'lumotni yuklab bo'lmadi");
      }

      setClients(data.clients ?? []);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Ma'lumotni yuklab bo'lmadi: ${e.message}`
          : "Ma'lumotni yuklab bo'lmadi"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Boshlang'ich yuklash + qidiruv (server tomonda, kechiktirilgan)
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadClients(search);
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search, loadClients]);

  // Jami mijozlar soni kontekstga
  useEffect(() => {
    setTotalClients(clients.length);
  }, [clients.length, setTotalClients]);

  const toggleStatus = async (id: number) => {
    const current = clients.find((c) => c.id === id);
    if (!current) return;

    const next = current.status === "Faol" ? "Arxiv" : "Faol";

    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: next } : c))
    );

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!res.ok) throw new Error("Holatni saqlab bo'lmadi");
    } catch {
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: current.status } : c))
      );
      setError("Holatni saqlab bo'lmadi");
    }
  };

  const deleteClient = async (id: number) => {
    const backup = clients;
    setClients((prev) => prev.filter((c) => c.id !== id));

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("O'chirib bo'lmadi");
      setToast("Mijoz o'chirildi");
    } catch {
      setClients(backup);
      setError("Mijozni o'chirib bo'lmadi");
    }
  };

  const addClient = async () => {
    setFormError(null);

    if (!name.trim()) {
      setFormError("Ismni kiriting");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Email manzili noto'g'ri");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, note }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "Saqlab bo'lmadi");
        setSaving(false);
        return;
      }

      setClients((prev) => [data.client, ...prev]);
      setName("");
      setEmail("");
      setNote("");
      setModalOpen(false);
      setToast("Yangi mijoz qo'shildi");
    } catch {
      setFormError("Serverga ulanib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const archiveAll = async () => {
    const active = clients.filter((c) => c.status === "Faol");
    setClients((prev) => prev.map((c) => ({ ...c, status: "Arxiv" })));

    try {
      await Promise.all(
        active.map((c) =>
          fetch(`/api/clients/${c.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Arxiv" }),
          })
        )
      );
      setToast("Barcha mijozlar arxivlandi");
    } catch {
      setClients((prev) =>
        prev.map((c) => {
          const wasActive = active.find((a) => a.id === c.id);
          return wasActive ? { ...c, status: "Faol" } : c;
        })
      );
      setError("Arxivlashda xatolik yuz berdi");
    }
  };

  const columns: TableColumn<Client>[] = [
    { key: "id", label: "ID", accessor: (c) => c.id },
    {
      key: "name",
      label: "Ism",
      render: (c) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
          {c.note && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.note}</p>
          )}
        </div>
      ),
    },
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
              { label: "Ma'lumotni yangilash", onClick: () => void loadClients(search) },
              { label: "Hammasini arxivlash", danger: true, onClick: archiveAll },
            ]}
          />
          <Button onClick={() => setModalOpen(true)}>+ Yangi mijoz</Button>
        </div>
      </div>

      {error ? (
        <Card className="border-red-200 dark:border-red-500/30">
          <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
          <Button className="mt-4" variant="outline" onClick={() => void loadClients(search)}>
            Qayta urinish
          </Button>
        </Card>
      ) : (
        <Card hover={false} className="overflow-hidden p-0">
          <Table<Client>
            columns={columns}
            data={clients}
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
            <Button onClick={addClient} loading={saving}>
              Saqlash
            </Button>
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
          <Input
            label="Izoh (ixtiyoriy)"
            placeholder="Loyiha turi..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </DashboardShell>
  );
}
