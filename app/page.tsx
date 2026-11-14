import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/marketing/LandingNav";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks, Features, Samples } from "@/components/marketing/Sections";
import { Pricing, Faq, CtaBand } from "@/components/marketing/Pricing";

export const metadata: Metadata = {
  title: "AppNest — ilovangizni kod bilmasdan yarating",
  description:
    "AI no-code builder: tavsifingizni yozing, AI sahifalarni qursin, vizual builderda tahrirlang va tayyor Next.js loyihasini yuklab oling. Birinchi loyiha bepul.",
  keywords: [
    "no-code",
    "AI ilova yaratish",
    "veb sayt generatori",
    "AppNest",
    "dasturlashsiz sayt",
  ],
  openGraph: {
    title: "AppNest — ilovangizni kod bilmasdan yarating",
    description:
      "Tavsifingizni yozing — AI sahifalarni, bloklarni va funksiyalarni tayyorlaydi. Birinchi loyiha bepul.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#05070f] text-[#e8ecf6]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, #000 30%, transparent 100%)",
        }}
      />

      <div className="relative">
        <LandingNav />
        <main>
          <Hero />
          <HowItWorks />
          <Features />
          <Samples />
          <Pricing />
          <Faq />
          <CtaBand />
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.07] px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-sm font-bold text-white">
              AppNest<span className="text-[#F5C451]">.uz</span>
            </span>
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
              <Link href="/showcase" className="transition hover:text-white">
                UI Kit
              </Link>
              <Link href="/register" className="transition hover:text-white">
                Ro&apos;yxatdan o&apos;tish
              </Link>
              <Link href="/login" className="transition hover:text-white">
                Kirish
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} AppNest
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
