import { PROJECT_TEMPLATES } from "@/data/templates";

const STEPS = [
  {
    n: "01",
    title: "Yo'nalishni tanlang",
    text: "Restoran, do'kon, maktab, universitet — yoki 'Boshqa' orqali o'z sohangizni yozing.",
  },
  {
    n: "02",
    title: "AI tahlil qiladi",
    text: "Matningiz asosida kerakli sahifalar, bloklar va ma'lumot modellari tayyorlanadi.",
  },
  {
    n: "03",
    title: "Surib tahrirlang",
    text: "Bloklarni joylashtiring, matnlarni o'zgartiring, mobil uchun grid qoidalarini hisobga oling.",
  },
  {
    n: "04",
    title: "Yuklab oling",
    text: "Tayyor Next.js loyihasi ZIP sifatida — o'z kompyuteringizda bir zumda ishga tushadi.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-white/[0.07] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5C451]">
            Qanday ishlaydi
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            To&apos;rtta qadam — bir necha daqiqa
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/25 hover:bg-white/[0.06]"
            >
              <span className="font-mono text-sm font-bold text-brand">
                {step.n}
              </span>
              <h3 className="mt-3 text-base font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {step.text}
              </p>

              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-slate-700 lg:block"
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    title: "AI ilova arxitekturasi",
    text: "Sahifalar, bloklar va ma'lumot modellari — hammasi sizning tavsifingizdan.",
    icon: "M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-3-5z",
  },
  {
    title: "Vizual quruvchi",
    text: "Bloklarni sudrab joylashtiring, ustidan bosib xossalarini tahrirlang.",
    icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  },
  {
    title: "Mobil Smart Grid",
    text: "Yashil zona — mumkin, qizil zona — xato. Noto'g'ri joylashishga yo'l qo'yilmaydi.",
    icon: "M4 4h16v16H4zM4 12h16M12 4v16",
  },
  {
    title: "Tayyor komponentlar",
    text: "18 ta komponent — Navbar, Hero, Card, Table, Form, Toast va boshqalar.",
    icon: "M20 7l-8-4-8 4m16 17l-8 4-8-4",
  },
  {
    title: "1+1 qoidasi",
    text: "Birinchi loyiha butunlay bepul. Keyingi loyihalar uchun PRO.",
    icon: "M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-3-5z",
  },
  {
    title: "Real Next.js eksporti",
    text: "ZIP ichida tayyor loyiha — package.json, tsconfig, komponentlar va sahifa.",
    icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-white/[0.07] px-6 py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5C451]">
            Imkoniyatlar
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Nima uchun AppNest
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/25"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={f.icon} />
                </svg>
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Samples() {
  return (
    <section
      id="samples"
      className="scroll-mt-20 border-t border-white/[0.07] px-6 py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F5C451]">
            Namunalar
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Bir bosishda tayyor loyihalar
          </h2>
          <p className="mt-4 text-slate-400">
            Ro&apos;yxatdan o&apos;ting, namuna tanlang — AI bilan ishlashni ko&apos;rasiz ham
            tugallangan ilova oladi.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROJECT_TEMPLATES.map((tpl) => (
            <div
              key={tpl.key}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-white/25"
              style={{ borderTop: `3px solid ${tpl.accent}` }}
            >
              <span className="text-2xl">{tpl.emoji}</span>
              <h3 className="mt-3 font-semibold text-white">{tpl.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                {tpl.brief}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-400">
                  {tpl.layout.rows.length} qator
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-400">
                  {tpl.layout.rows.reduce((s, r) => s + r.blocks.length, 0)} blok
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
