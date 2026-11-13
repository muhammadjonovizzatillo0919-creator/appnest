"use client";

import { useState } from "react";
import { BlockRenderer } from "./BlockRenderer";
import {
  GRID_COLUMNS,
  GRID_GAP,
  ROW_HEIGHT,
  type GridCell,
  type MobileBlock,
  canPlace,
  cellStyle,
  findMobileRule,
  occupiedCells,
  placeBlock,
  totalRows,
} from "@/lib/grid";

/**
 * Mobil Smart Grid canvas.
 *
 * Blokni sudrab joylashtirganda:
 * - mumkin joy → **yashil** chegara
 * - mumkin bo'lmagan joy → **qizil** chegara va blok joylashmaydi
 */
export function MobileCanvas({
  blocks,
  onChange,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
}: {
  blocks: MobileBlock[];
  onChange: (next: MobileBlock[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (component: string) => void;
  onRemove: (id: string) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoverCell, setHoverCell] = useState<GridCell | null>(null);
  const [hoverValid, setHoverValid] = useState(true);
  const [hoverReason, setHoverReason] = useState("");

  const rows = totalRows(blocks);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(null);

    const component = e.dataTransfer.getData("application/x-appnest-block");
    const existingId = e.dataTransfer.getData("application/x-appnest-existing");
    const cell = hoverCell;

    setHoverCell(null);

    if (!cell) return;

    if (component) {
      // Yangi blok — joylashuvi addMobile() da qo'yiladi
      onAdd(component);
      return;
    }

    if (existingId) {
      const block = blocks.find((b) => b.id === existingId);
      if (!block) return;

      const size = { w: block.grid.w, h: block.grid.h };
      const target: GridCell = { ...cell, w: size.w, h: size.h };

      const result = canPlace(
        block.component,
        target,
        {
          occupied: occupiedCells(blocks, existingId),
          totalRows: rows,
        }
      );

      // Noto'g'ri joy — joylashmaydi
      if (!result.valid) return;

      onChange(placeBlock(blocks, existingId, target));
      onSelect(existingId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const colWidth = rect.width / GRID_COLUMNS;
    const rowHeight = ROW_HEIGHT;

    const x = Math.floor((e.clientX - rect.left) / colWidth);
    const y = Math.floor((e.clientY - rect.top) / rowHeight);

    if (x < 0 || x >= GRID_COLUMNS) return;

    const component =
      e.dataTransfer.types.includes("application/x-appnest-block")
        ? "Card"
        : blocks.find((b) => b.id === e.dataTransfer.getData("application/x-appnest-existing"))
            ?.component ?? "Card";

    const existingId = e.dataTransfer.getData("application/x-appnest-existing");
    const block = blocks.find((b) => b.id === existingId);
    const size = block
      ? { w: block.grid.w, h: block.grid.h }
      : findMobileRule(component)?.defaultSize ?? { w: 12, h: 1 };

    const candidate: GridCell = {
      x: Math.min(x, GRID_COLUMNS - size.w),
      y,
      w: size.w,
      h: size.h,
    };

    const result = canPlace(
      component,
      candidate,
      {
        occupied: occupiedCells(blocks, existingId || undefined),
        totalRows: rows,
      }
    );

    setHoverCell(candidate);
    setHoverValid(result.valid);
    setHoverReason(result.reason ?? "");
  };

  return (
    <div className="p-4">
      {/* Telefon ramkasi */}
      <div className="mx-auto max-w-[420px]">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span>Smart Grid · {GRID_COLUMNS} ustun</span>
          <span>{rows} qator</span>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={() => {
            setHoverCell(null);
            setDragging(null);
          }}
          onDrop={handleDrop}
          onClick={() => onSelect(null)}
          className="relative rounded-[28px] border-[8px] border-slate-800 bg-white shadow-2xl dark:bg-slate-950"
          style={{ minHeight: Math.max(320, (rows + 2) * ROW_HEIGHT) }}
        >
          {/* Grid chiziqlari */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
              gridTemplateRows: `repeat(${Math.max(rows + 2, 6)}, ${ROW_HEIGHT}px)`,
              gap: GRID_GAP,
              padding: GRID_GAP,
            }}
          >
            {Array.from({ length: GRID_COLUMNS }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>

          {/* Bloklar */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
              gridTemplateRows: `repeat(${Math.max(rows + 2, 6)}, ${ROW_HEIGHT}px)`,
              gap: GRID_GAP,
              padding: GRID_GAP,
            }}
          >
            {blocks.map((block) => (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.setData("application/x-appnest-existing", block.id);
                  e.dataTransfer.effectAllowed = "move";
                  setDragging(block.id);
                }}
                onDragEnd={() => {
                  setDragging(null);
                  setHoverCell(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(block.id);
                }}
                style={cellStyle(block.grid)}
                className={`relative z-10 cursor-grab rounded-xl border p-2 transition active:cursor-grabbing ${
                  selectedId === block.id
                    ? "border-[#0057FF] bg-blue-50/60 ring-2 ring-[#0057FF]/30 dark:bg-blue-500/10"
                    : dragging === block.id
                      ? "opacity-40"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {findMobileRule(block.component)?.label ?? block.component}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[9px] text-slate-400">
                      {block.grid.x},{block.grid.y}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(block.id);
                      }}
                      aria-label="Blokni o'chirish"
                      className="rounded px-1 text-[10px] text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <BlockRenderer block={block} />
              </div>
            ))}

            {/* Ko'rsatkich (yashil / qizil) */}
            {hoverCell && (
              <div
                className={`pointer-events-none absolute z-20 rounded-xl border-2 ${
                  hoverValid
                    ? "border-[#00D287] bg-[#00D287]/10"
                    : "border-red-500 bg-red-500/10"
                }`}
                style={cellStyle(hoverCell)}
              >
                <span
                  className={`absolute -top-6 left-0 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white ${
                    hoverValid ? "bg-[#00D287]" : "bg-red-500"
                  }`}
                >
                  {hoverValid ? "Joylash mumkin" : hoverReason}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blok qo'shish */}
      <div className="mx-auto mt-4 max-w-[420px]">
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Blok qo&apos;shish
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Navbar", "Hero", "Card", "Button", "Input", "StatCard", "BottomNav", "Footer"].map(
              (name) => {
                const rule = findMobileRule(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onAdd(name)}
                    title={rule?.note}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-600 transition hover:border-[#0057FF] hover:text-[#0057FF] dark:border-slate-700 dark:text-slate-300"
                  >
                    + {name}
                  </button>
                );
              }
            )}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
            Blokni yuqoridagi telefon maydoniga suring. Navbar faqat tepada, BottomNav va Footer
            faqat pastda — qoidaga mos kelmasa joylashmaydi.
          </p>
        </div>
      </div>
    </div>
  );
}
