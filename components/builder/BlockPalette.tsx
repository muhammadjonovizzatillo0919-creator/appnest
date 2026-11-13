"use client";

import { useState } from "react";
import { BLOCK_GROUPS, BLOCK_REGISTRY, type BlockMeta } from "@/lib/builder";

/**
 * Blok palitrasi — foydalanuvchi shu yerda blokni topadi va
 * canvas'ga surib (drag) tashlaydi.
 */
export function BlockPalette() {
  const [group, setGroup] = useState<string>("Hammasi");
  const [search, setSearch] = useState("");

  const groups = ["Hammasi", ...BLOCK_GROUPS];

  const filtered = BLOCK_REGISTRY.filter((meta) => {
    const inGroup = group === "Hammasi" || meta.group === group;
    const inSearch =
      !search.trim() ||
      meta.label.toLowerCase().includes(search.toLowerCase()) ||
      meta.name.toLowerCase().includes(search.toLowerCase());
    return inGroup && inSearch;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Bloklar
        </p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Blok qidirish..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0057FF] dark:border-slate-700 dark:bg-slate-900"
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={`rounded-md px-2 py-1 text-[11px] transition ${
                group === g
                  ? "bg-[#0057FF] text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-slate-500">
            Blok topilmadi
          </p>
        )}

        {filtered.map((meta) => (
          <PaletteItem key={meta.name} meta={meta} />
        ))}
      </div>
    </div>
  );
}

function PaletteItem({ meta }: { meta: BlockMeta }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-appnest-block", meta.name);
        e.dataTransfer.effectAllowed = "copy";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      title={meta.description}
      className={`flex cursor-grab items-start gap-2.5 rounded-lg border border-transparent px-2.5 py-2 transition active:cursor-grabbing ${
        dragging
          ? "border-[#0057FF] bg-blue-50 dark:bg-blue-500/10"
          : "hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
      }`}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={meta.icon} />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-slate-800 dark:text-slate-100">
          {meta.label}
        </span>
        <span className="block truncate text-[11px] text-slate-400">
          {meta.description}
        </span>
      </span>
    </div>
  );
}
