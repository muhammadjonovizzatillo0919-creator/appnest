"use client";

import { useState } from "react";
import { Button, Card, Input, Toast } from "@/components/core";
import { DashboardShell } from "@/components/layout";
import { useUser } from "@/context/UserContext";

export default function SettingsPage() {
  const { user, setUser } = useUser();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [toast, setToast] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();

  const handleSave = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Email manzili noto'g'ri");
      return;
    }
    setEmailError(undefined);
    setUser({ name, email });
    setToast("Ma'lumotlar muvaffaqiyatli saqlandi");
  };

  return (
    <DashboardShell title="Sozlamalar">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
        Profil ma&apos;lumotlari
      </h2>

      <Card className="max-w-xl">
        <div className="space-y-4">
          <Input
            label="Ism"
            value={name}
            onChange={(e) => setName(e.target.value)}
            hint="Foydalanuvchi nomi panelning yuqori qismida ko'rsatiladi"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
          />
          <Button onClick={handleSave}>Saqlash</Button>
        </div>
      </Card>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </DashboardShell>
  );
}
