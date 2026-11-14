import Link from "next/link";

const PLANS = [
  {
    name: "FREE",
    price: "0",
    period: "doimiy",
    accent: "#94a3b8",
    features: [
      "1 ta loyiha",
      "AI bilan generatsiya",
      "Vizual quruvchi (Web + Mobil)",
      "Live preview",
      "Tayyor komponentlar",
    ],
    cta: "Bepul boshlash",
    href: "/register",
    highlight: false,
  },
  {
    name: "PRO",
    price: "9",
    period: "/oy",
    accent: "#F5C451",
    features: [
      "Cheksiz loyiha",
      "ZIP eksport (Next.js)",
      "Loyihani faollashtirish (production)",
      "Barcha komponentlar va shablonlar",
      "Prioritetli qo'llab-quvvatlash",
    ],
    cta: "PRO ga o'tish",
    href: "/register",
    highlight: true,
  },
];

const FAQ = [
  {
    q: "Dasturlashni bilish kerakmi?",
    a: "Yo'q. Siz faqat tavsif yozasiz — AI sahifalarni va bloklarni tayyorlaydi. Keyin vizual quruvchida sudrab joylashtirasiz.",
  },
  {
    q: "Qanday ilovalar qurish mumkin?",
    a: "Restoran menyusi, onlayn do'kon, maktab portali, universitet portali — va boshqa ko'plab sohalar. 'Boshqa' tanlaganda o'z sohangizni yozasiz.",
  },
  {
    q: "1+1 qoidasi nima?",
    a: "Har bir yangi foydalanuvchiga 1 ta bepul loyiha beriladi. Uni ko'rish, tahrirlash va sinab ko'rish mumkin. Eksport qilish (production'ga chiqarish) faqat PRO tarifda ochiladi.",
  },
  {
    q: "Tayyor loyiha qanday olinadi?",
    a: "ZIP fayl — ichida package.json, tsconfig.json, app/ sahifasi va komponentlar bo'ladi. Uning ichiga kirib npm install && npm run dev desangiz — loyiha ishga tushadi.",
  },
  {
    q: "Mobil ilova ham qurish mumkinmi?",
    a: "Ha. Mobil uchun Smart Grid rejimi bor: 12 ustunli to'r, bloklar faqat o'z o'rniga qo'yiladi. Navbar faqat yuqorida, pastki menyu faqat pastda bo'ladi.",
  },
  {
    q: "Ma'lumotlarim xavfsizmi?",
    a: "Parollar scrypt hash bilan saqlanadi, sessiya httpOnly cookie orqali yuritiladi. Ma'lumotlar bazasi SQLite (lokal) yoki Turso (serverless) — ikkalasi ham shifrlangan ulanish bilan ishlaydi.",
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t border-white/[0.07] px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5C451]">
            Narx
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Oddiy va shaffof
          </h2>
          <p className="mt-4 text-slate-400">
            Bepul tarif bilan boshlang. Loyihangiz o&apos;sishiga qarab PRO ga o&apos;ting.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlight
                  ? "border-[#F5C451]/40 bg-gradient-to-b from-[#F5C451]/[0.08] to-transparent"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-[#F5C451] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                  Tavsiya etiladi
                </span>
              )}

              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: plan.accent }}
              >
                {plan.name}
              </p>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-bold tracking-tight text-white">
                  {plan.price}
                </span>
                <span className="pb-1.5 text-sm text-slate-400">{plan.period}</span>
              </div>

              <ul className="mt-7 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={plan.accent}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 block rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-[#F5C451] text-black hover:brightness-110"
                    : "border border-white/15 bg-white/[0.05] text-white hover:bg-white/[0.1]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-white/[0.07] px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5C451]">
            Savollar
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ko&apos;p beriladigan savollar
          </h2>
        </div>

        <div className="mt-10 divide-y divide-white/[0.08] rounded-2xl border border-white/10 bg-white/[0.03]">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-white">
                {item.q}
                <span className="shrink-0 text-slate-500 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="border-t border-white/[0.07] px-6 py-20">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0057FF]/20 via-[#0a0f1e] to-[#A855F7]/20 px-8 py-14 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(0,87,255,0.35),transparent)]"
        />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Birinchi loyihangizni hozir yarating
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Kredit kartasi kerak emas. 30 sekundda ro&apos;yxatdan o&apos;ting va birinchi
            ilovangizni quring.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-[#0057FF] to-[#0070FF] px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Bepul boshlash →
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/20 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Kirish
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
