import Link from "next/link";
import type { Metadata } from "next";
import {
  Alert,
  AppLogo,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  StatCard,
} from "@/components/core";

export const metadata: Metadata = {
  title: "AppNest — React Admin Panel va UI Kit",
  description:
    "Next.js va React uchun tayyor admin panel shabloni: 18 ta komponent, tungi rejim, responsive dizayn.",
};

const COMPONENTS = [
  { name: "Button", desc: "5 ta variant, 3 ta o'lcham, loading holati" },
  { name: "Input", desc: "Label, hint, error, `useId` bilan bog'langan" },
  { name: "Table", desc: "Generik ustunlar, loading, bo'sh holat" },
  { name: "Modal", desc: "Esc bilan yopish, fokus, scroll bloklash" },
  { name: "Dropdown", desc: "Tashqariga bosilganda yopiladi, klaviatura" },
  { name: "Toast", desc: "Avtomatik yopilish, 3 xil tur" },
  { name: "Sidebar", desc: "Faol holat, mobil drawer" },
  { name: "Navbar", desc: "Tema tugmasi, foydalanuvchi menyusi" },
  { name: "Badge", desc: "6 rang, soft va solid variantlar" },
  { name: "Alert", desc: "4 tur: success, error, info, warning" },
  { name: "StatCard", desc: "Qiymat, trend va ikonka" },
  { name: "Card / Grid / Container", desc: "Layout asoslari" },
  { name: "Loading", desc: "3 o'lchamdagi spinner" },
  { name: "AppLogo", desc: "CSS bilan chizilgan, fayl kerak emas" },
  { name: "ThemeToggle", desc: "localStorage + tizim afzalligi" },
  { name: "Footer", desc: "Yil avtomatik hisoblanadi" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="text-slate-900 dark:text-white">
            <AppLogo />
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Demo
            </Link>
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Kirish
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Boshlash
            </Link>
          </nav>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(0,87,255,0.18),transparent)]"
        />
        <Container className="relative py-20 text-center sm:py-28">
          <Badge color="blue" className="mb-6">
            Next.js 16 · React 19 · Tailwind v4
          </Badge>

          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Admin panel uchun{" "}
            <span className="bg-gradient-to-r from-brand to-[#00D287] bg-clip-text text-transparent">
              tayyor komponentlar
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            AppNest — admin panel, dashboard va autentifikatsiya sahifalari uchun
            to&apos;liq tayyor shablon. Hech qanday konfiguratsiya yo&apos;q — nusxalang va
            ishlating.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg">Demo panelni ko&apos;rish →</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Hisob yaratish
              </Button>
            </Link>
          </div>

          {/* O'rnatish */}
          <div className="mx-auto mt-12 max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-left dark:border-slate-700">
            <div className="flex items-center gap-2 border-b border-slate-700/60 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-slate-400">terminal</span>
            </div>
            <pre className="overflow-x-auto px-5 py-4 text-sm text-slate-200">
              <code>
                <span className="text-slate-500"># 1. Repo&apos;ni klonlash</span>{"\n"}
                <span className="text-slate-500">$ </span>git clone https://github.com/muhammadjonovizzatillo0919-creator/appnest.git{"\n\n"}
                <span className="text-slate-500"># 2. O&apos;rnatish</span>{"\n"}
                <span className="text-slate-500">$ </span>npm install{"\n\n"}
                <span className="text-slate-500"># 3. Ishga tushirish</span>{"\n"}
                <span className="text-slate-500">$ </span>npm run dev
              </code>
            </pre>
          </div>
        </Container>
      </section>

      {/* Statistika */}
      <section className="border-y border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
        <Container>
          <Grid cols={4} gap="md">
            <StatCard
              title="Komponentlar"
              value="18"
              trend={{ value: "Hammasi tayyor" }}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              }
            />
            <StatCard title="Sahifalar" value="5" trend={{ value: "Dashboard, clients, settings, login, register" }} />
            <StatCard title="Dark mode" value="вњ…" trend={{ value: "localStorage + tizim afzalligi" }} />
            <StatCard title="TypeScript" value="100%" trend={{ value: "any yo'q, to'liq tip" }} />
          </Grid>
        </Container>
      </section>

      {/* Komponentlar */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Komponentlar ro&apos;yxati
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Barchasi TypeScript bilan yozilgan, tungi rejimga mos va ekran o&apos;lchamiga moslashuvchi.
            </p>
          </div>

          <Grid cols={3} gap="md" className="mt-12">
            {COMPONENTS.map((c) => (
              <Card key={c.name}>
                <h3 className="font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{c.desc}</p>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Alert namunasi */}
      <section className="pb-20">
        <Container className="max-w-2xl">
          <Alert type="info" title="Namuna: Alert komponenti">
            Alert komponenti turga qarab avtomatik rang oladi — success, error, info yoki warning.
          </Alert>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-slate-900 dark:text-white">
            <AppLogo />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} AppNest — MIT litsenziyasi.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="text-brand hover:underline dark:text-blue-400">
              Kirish
            </Link>
            <a
              href="https://github.com/muhammadjonovizzatillo0919-creator/appnest"
              className="text-brand hover:underline dark:text-blue-400"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </Container>
      </footer>
    </div>
  );
}
