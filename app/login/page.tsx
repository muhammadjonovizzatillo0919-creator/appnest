"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AppLogo, Button, Card, Input } from "@/components/core";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError("Email va parolni kiriting");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Kirishda xatolik yuz berdi");
        setLoading(false);
        return;
      }

      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch {
      setError("Serverga ulanib bo'lmadi. Qayta urinib ko'ring.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-[#0b1120]">
      <Link href="/" className="mb-8 text-slate-900 dark:text-white">
        <AppLogo />
      </Link>

      <Card className="w-full max-w-sm">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
          Admin panelga kirish
        </h2>

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="admin@appnest.uz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Parol"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleLogin()}
          />
          <Button onClick={handleLogin} loading={loading} fullWidth>
            Kirish
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/register" className="font-semibold text-brand hover:underline dark:text-blue-400">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </p>
      </Card>
    </main>
  );
}
