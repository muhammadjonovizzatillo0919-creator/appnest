"use client";

import { findBlockMeta, type BuilderBlock } from "@/lib/builder";

/**
 * Property panel вЂ” tanlangan blokning xususiyatlarini tahrirlash.
 */
export function PropertyPanel({
  block,
  onChange,
  onClose,
}: {
  block: BuilderBlock | null;
  onChange: (props: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  if (!block) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-slate-300 dark:text-slate-600">
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <p className="text-sm font-medium text-slate-500">Blok tanlanmagan</p>
        <p className="text-xs text-slate-400">
          Canvas&apos;dagi biror blokni bosing вЂ” uning xususiyatlari shu yerda ochiladi
        </p>
      </div>
    );
  }

  const meta = findBlockMeta(block.component);

  const setValue = (key: string, value: unknown) => {
    onChange({ ...block.props, [key]: value });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {meta?.label ?? block.component}
          </p>
          <p className="truncate font-mono text-[10px] text-slate-400">
            {block.component}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {!meta || meta.fields.length === 0 ? (
          <p className="text-xs text-slate-400">
            Bu blokning qo&apos;shimcha xususiyatlari yo&apos;q.
          </p>
        ) : (
          meta.fields.map((field) => {
            const value = block.props?.[field.key];

            if (field.type === "select") {
              return (
                <label key={field.key} className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    {field.label}
                  </span>
                  <select
                    value={String(value ?? "")}
                    onChange={(e) => setValue(field.key, e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand dark:border-slate-700 dark:bg-slate-900"
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            if (field.type === "textarea") {
              return (
                <label key={field.key} className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    {field.label}
                  </span>
                  <textarea
                    rows={3}
                    value={String(value ?? "")}
                    onChange={(e) => setValue(field.key, e.target.value)}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand dark:border-slate-700 dark:bg-slate-900"
                  />
                </label>
              );
            }

            if (field.type === "number") {
              return (
                <label key={field.key} className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    {field.label}
                  </span>
                  <input
                    type="number"
                    value={Number(value ?? 1)}
                    onChange={(e) => setValue(field.key, Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand dark:border-slate-700 dark:bg-slate-900"
                  />
                </label>
              );
            }

            if (field.type === "boolean") {
              return (
                <label key={field.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => setValue(field.key, e.target.checked)}
                    className="h-4 w-4 accent-brand"
                  />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {field.label}
                  </span>
                </label>
              );
            }

            return (
              <label key={field.key} className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  {field.label}
                </span>
                <input
                  type="text"
                  value={String(value ?? "")}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
            );
          })
        )}

        <p className="pt-2 text-[11px] leading-relaxed text-slate-400">
          O&apos;zgarishlar avtomatik saqlanadi. Blokni canvas&apos;da sudrab
          joyini o&apos;zgartirishingiz mumkin.
        </p>
      </div>
    </div>
  );
}
