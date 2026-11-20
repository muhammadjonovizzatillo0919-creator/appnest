"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "#how", label: "Qanday ishlaydi" },
  { href: "#features", label: "Imkoniyatlar" },
  { href: "#samples", label: "Namunalar" },
  { href: "#pricing", label: "Narx" },
  { href: "#faq", label: "Savollar" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070f]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-[#00D287] text-xs font-bold text-white">
            A
          </span>
          <span className="text-sm font-bold tracking-tight text-white">
            AppNest<span className="text-[#F5C451]">.uz</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 sm:block"
          >
            Kirish
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-brand to-brand px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Boshlash
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menyu"
            className="rounded-lg border border-white/15 p-2 text-white md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 px-6 py-3 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-slate-300"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
