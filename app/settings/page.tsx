"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Input, Toast } from "@/components/core";
import { DashboardShell } from "@/components/layout";
import { useUser } from "@/context/UserContext";

export default function SettingsPage() {
  const { user, setUser, loading } = useUser();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [toast, setToast] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  // Sessiya yuklanganidan keyin qiymatlarni to'ldiramiz
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Email manzili noto'g'ri");
      return;
    }
    setEmailError(undefined);
    setUser({ id: user?.id ?? "", name, email });
    setSaved(true);
    setToast("Ma'lumotlar muvaffaqiyatli saqlandi");
  };

  return (
    <DashboardShell title="Sozlamalar">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
        Profil ma&apos;lumotlari
      </h2>

      {loading ? (
        <Card className="max-w-xl">
          <p className="text-sm text-slate-500">Yuklanmoqda...</p>
        </Card>
      ) : !user ? (
        <Alert type="info" title="Sessiya topilmadi">
          Profil ma&apos;lumotlarini ko&apos;rish uchun tizimga kiring.
        </Alert>
      ) : (
        <Card className="max-w-xl">
          <div className="space-y-4">
            <Input
              label="Ism"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              hint="Foydalanuvchi nomi panelning yuqori qismida ko'rsatiladi"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
              error={emailError}
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleSave}>Saqlash</Button>
              {saved && (
                <span className="text-sm text-emerald-600 dark:text-emerald-400">
                  O&apos;zgarishlar saqlandi
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </DashboardShell>
  );
}
