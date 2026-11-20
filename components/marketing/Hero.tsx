import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:pt-24">
      {/* Fon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(0,87,255,0.28),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-40 h-72 w-72 rounded-full bg-[#00D287]/15 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-[#A855F7]/15 blur-[100px]"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C451]/30 bg-[#F5C451]/10 px-4 py-1.5 text-xs font-medium text-[#F5C451]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F5C451]" />
          1+1 qoidasi: birinchi loyiha bepul
        </span>

        <h1 className="mt-7 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
          Ilovangizni{" "}
          <span className="bg-gradient-to-r from-[#F5C451] via-[#FFD97A] to-[#00D287] bg-clip-text text-transparent">
            kod bilmasdan
          </span>{" "}
          yarating
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Tavsifingizni yozing вЂ” AI siz uchun sahifalarni, bloklarni va funksiyalarni tayyorlaydi.
          Keyin surib tahrirlang va yuklab oling. Dasturlashni bilish shart emas.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-brand to-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110"
          >
            Bepul loyiha yaratish в†’
          </Link>
          <a
            href="#samples"
            className="rounded-xl border border-white/15 bg-white/[0.05] px-6 py-3.5 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.1]"
          >
            Namunalarni ko&apos;rish
          </a>
        </div>

        <p className="mt-5 text-xs text-slate-500">
          Kredit kartasi kerak emas В· Kiritish 30 sekund В· O&apos;chirish mumkin
        </p>

        {/* Ishonch qatorlari */}
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["24/7", "AI bilan ishlash"],
            ["18", "Tayyor komponent"],
            ["1+1", "Bepul loyiha"],
            ["0", "Kod yozish kerak"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <p className="font-mono text-2xl font-bold text-white">{value}</p>
              <p className="mt-1 text-[11px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
