import Link from "next/link";
import type { BuilderBlock, BuilderLayout } from "@/lib/builder";
import { BlockRenderer } from "@/components/builder/BlockRenderer";

/**
 * Ommaviy sahifa — foydalanuvchi qurgan ilova.
 *
 * Bloklar haqiqiy AppNest komponentlarida render qilinadi, shuning uchun
 * ko'rinishi xuddi shunday bo'ladi, keyinchalik eksport qilingan saytda.
 */
export function PublicApp({
  category,
  layout,
  isDraft,
}: {
  title: string;
  category: string;
  layout: BuilderLayout;
  isDraft: boolean;
}) {
  const blocks: BuilderBlock[] = [
    ...layout.rows.flatMap((row) => row.blocks),
    ...(layout.blocks ?? []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120]">
      {isDraft && (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Qoralama — faqat siz ko&apos;rasiz. Ommaga chiqarish uchun PRO tarifda
          &quot;Yayqlash&quot; tugmasini bosing.
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="space-y-3">
          {blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>

        {blocks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center text-sm text-slate-400 dark:border-slate-700">
            Bu loyiha hali bo&apos;sh.
          </div>
        )}

        {/* Brend nishoni */}
        <footer className="mt-16 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
          <p className="text-xs text-slate-400">
            <Link
              href="/"
              className="font-semibold text-slate-600 transition hover:text-[#0057FF] dark:text-slate-300"
            >
              AppNest
            </Link>{" "}
            bilan yaratilgan · {category}
          </p>
        </footer>
      </div>
    </div>
  );
}
