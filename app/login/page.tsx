"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AppLogo, Button, Card, Input } from "@/components/core";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email va parolni kiriting");
      return;
    }

    setLoading(true);
    const saved = sessionStorage.getItem("appnest_user");

    if (!saved) {
      setLoading(false);
      setError("Foydalanuvchi topilmadi. Avval ro'yxatdan o'ting");
      return;
    }

    try {
      const user = JSON.parse(saved) as { email: string; password: string };
      if (user.email === email && user.password === password) {
        sessionStorage.setItem("appnest_session", "active");
        router.push("/");
      } else {
        setError("Email yoki parol noto'g'ri");
      }
    } catch {
      setError("Ma'lumotni o'qib bo'lmadi. Qayta ro'yxatdan o'ting");
    } finally {
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
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <Button onClick={handleLogin} loading={loading} fullWidth>
            Kirish
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/register" className="font-semibold text-[#0057FF] hover:underline dark:text-blue-400">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </p>
      </Card>
    </main>
  );
}
