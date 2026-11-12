"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AppLogo, Button, Card, Input } from "@/components/core";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Ro'yxatdan o'tishda xatolik yuz berdi");
        setLoading(false);
        return;
      }

      // Ro'yxatdan o'tgach — avtomatik kirish
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
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
          Ro&apos;yxatdan o&apos;tish
        </h2>

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          <Input
            label="Ism"
            placeholder="Ismingiz"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Parol"
            type="password"
            placeholder="Kamida 6 ta belgi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Parol serverda scrypt hash bilan saqlanadi"
          />
          <Button onClick={handleRegister} loading={loading} fullWidth>
            Ro&apos;yxatdan o&apos;tish
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Hisobingiz bormi?{" "}
          <Link href="/login" className="font-semibold text-[#0057FF] hover:underline dark:text-blue-400">
            Kirish
          </Link>
        </p>
      </Card>
    </main>
  );
}
