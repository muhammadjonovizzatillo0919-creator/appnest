"use client";

import { useState } from "react";
import { BlockRenderer } from "./BlockRenderer";
import {
  type BuilderBlock,
  type BuilderLayout,
  type BuilderRow,
  findBlockMeta,
  newBlockId,
} from "@/lib/builder";

/**
 * Canvas — qatorlar (rows) ustma-ust, har bir qator ichida bloklar.
 *
 * Drag & drop:
 * - Palitradan → canvas'ga (blok qo'shish)
 * - Blokni → boshqa qatorga (ko'chirish)
 */
export function BuilderCanvas({
  layout,
  onChange,
  selectedId,
  onSelect,
}: {
  layout: BuilderLayout;
  onChange: (next: BuilderLayout) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [dragOverRow, setDragOverRow] = useState<string | null>(null);
  const [dragOverBlock, setDragOverBlock] = useState<string | null>(null);

  const handleDropOnRow = (rowId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverRow(null);
    setDragOverBlock(null);

    // Palitradan yangi blok
    const newComponent = e.dataTransfer.getData("application/x-appnest-block");
    if (newComponent) {
      const meta = findBlockMeta(newComponent);
      const block: BuilderBlock = {
        id: newBlockId(),
        component: newComponent,
        props: defaultProps(meta?.fields ?? []),
      };
      onChange({
        ...layout,
        rows: layout.rows.map((row) =>
          row.id === rowId
            ? { ...row, blocks: [...row.blocks, block] }
            : row
        ),
      });
      onSelect(block.id);
      return;
    }

    // Mavjud blokni ko'chirish
    const movedId = e.dataTransfer.getData("application/x-appnest-existing");
    if (!movedId) return;

    const fromRow = layout.rows.find((r) => r.blocks.some((b) => b.id === movedId));
    const toIndex =
      layout.rows.find((r) => r.id === rowId)?.blocks.length ?? 0;

    if (!fromRow || fromRow.id === rowId) return;

    const block = fromRow.blocks.find((b) => b.id === movedId);
    if (!block) return;

    onChange({
      ...layout,
      rows: layout.rows
        .map((row) =>
          row.id === fromRow.id
            ? { ...row, blocks: row.blocks.filter((b) => b.id !== movedId) }
            : row
        )
        .filter((row) => row.blocks.length > 0)
        .map((row) => {
          if (row.id !== rowId) return row;
          const blocks = [...row.blocks];
          blocks.splice(toIndex, 0, block);
          return { ...row, blocks };
        }),
    });
  };

  return (
    <div
      className="min-h-full space-y-3 p-4"
      onClick={() => onSelect(null)}
      onDragOver={(e) => e.preventDefault()}
    >
      {layout.rows.length === 0 && (
        <div
          className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 text-center dark:border-slate-700"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDropOnRow("", e)}
        >
          <p className="text-sm font-medium text-slate-500">
            Bu yerga bloklarni surib tashlang
          </p>
          <p className="text-xs text-slate-400">
            yoki &quot;AI bilan generatsiya qilish&quot; tugmasini bosing
          </p>
        </div>
      )}

      {layout.rows.map((row) => (
        <RowView
          key={row.id}
          row={row}
          layout={layout}
          onChange={onChange}
          selectedId={selectedId}
          onSelect={onSelect}
          dragOverRow={dragOverRow}
          setDragOverRow={setDragOverRow}
          dragOverBlock={dragOverBlock}
          setDragOverBlock={setDragOverBlock}
          onDropOnRow={handleDropOnRow}
        />
      ))}

      {/* Yangi qator */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange({
            ...layout,
            rows: [
              ...layout.rows,
              { id: `r${Date.now().toString(36)}`, type: "window", blocks: [] },
            ],
          });
        }}
        className="w-full rounded-xl border-2 border-dashed border-slate-200 py-4 text-xs text-slate-400 transition hover:border-[#0057FF] hover:text-[#0057FF] dark:border-slate-700"
      >
        + Yangi qator qo&apos;shish
      </button>
    </div>
  );
}

function RowView({
  row,
  layout,
  onChange,
  selectedId,
  onSelect,
  dragOverRow,
  setDragOverRow,
  dragOverBlock,
  setDragOverBlock,
  onDropOnRow,
}: {
  row: BuilderRow;
  layout: BuilderLayout;
  onChange: (next: BuilderLayout) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  dragOverRow: string | null;
  setDragOverRow: (id: string | null) => void;
  dragOverBlock: string | null;
  setDragOverBlock: (id: string | null) => void;
  onDropOnRow: (rowId: string, e: React.DragEvent) => void;
}) {
  const removeBlock = (blockId: string) => {
    onChange({
      ...layout,
      rows: layout.rows
        .map((r) =>
          r.id === row.id
            ? { ...r, blocks: r.blocks.filter((b) => b.id !== blockId) }
            : r
        )
        .filter((r) => r.blocks.length > 0),
    });
    if (selectedId === blockId) onSelect(null);
  };

  return (
    <div
      className={`group rounded-2xl border bg-white p-3 transition dark:bg-slate-900 ${
        dragOverRow === row.id
          ? "border-[#0057FF] ring-2 ring-[#0057FF]/30"
          : "border-slate-200 dark:border-slate-800"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOverRow(row.id);
      }}
      onDragLeave={() => setDragOverRow(null)}
      onDrop={(e) => onDropOnRow(row.id, e)}
    >
      <div className="mb-2 flex items-center justify-between opacity-0 transition group-hover:opacity-100">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Qator
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange({
              ...layout,
              rows: layout.rows.filter((r) => r.id !== row.id),
            });
          }}
          className="rounded px-1.5 py-0.5 text-[11px] text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          Qatorni o&apos;chirish
        </button>
      </div>

      <div className="space-y-2">
        {row.blocks.map((block) => (
          <div
            key={block.id}
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData("application/x-appnest-existing", block.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOverBlock(block.id);
            }}
            onDragLeave={() => setDragOverBlock(null)}
            onDrop={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setDragOverBlock(null);
              const movedId = e.dataTransfer.getData("application/x-appnest-existing");
              if (!movedId || movedId === block.id) return;

              const fromRow = layout.rows.find((r) =>
                r.blocks.some((b) => b.id === movedId)
              );
              const moved = fromRow?.blocks.find((b) => b.id === movedId);
              if (!fromRow || !moved) return;

              const targetIndex = row.blocks.findIndex((b) => b.id === block.id);

              onChange({
                ...layout,
                rows: layout.rows
                  .map((r) =>
                    r.id === fromRow.id
                      ? { ...r, blocks: r.blocks.filter((b) => b.id !== movedId) }
                      : r
                  )
                  .filter((r) => r.blocks.length > 0)
                  .map((r) => {
                    if (r.id !== row.id) return r;
                    const blocks = [...r.blocks].filter((b) => b.id !== movedId);
                    blocks.splice(Math.max(0, targetIndex), 0, moved);
                    return { ...r, blocks };
                  }),
              });
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(block.id);
            }}
            className={`relative cursor-grab rounded-xl border p-2 transition active:cursor-grabbing ${
              selectedId === block.id
                ? "border-[#0057FF] ring-2 ring-[#0057FF]/25"
                : dragOverBlock === block.id
                  ? "border-[#00D287]"
                  : "border-slate-150 hover:border-slate-300 dark:border-slate-800"
            }`}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {findBlockMeta(block.component)?.label ?? block.component}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBlock(block.id);
                }}
                className="rounded px-1.5 py-0.5 text-[11px] text-red-500 opacity-0 transition hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-500/10"
              >
                ✕
              </button>
            </div>
            <BlockRenderer block={block} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Komponent maydonlaridan boshlang'ich props */
function defaultProps(
  fields: { key: string; type: string; options?: string[] }[]
): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  for (const field of fields) {
    if (field.type === "select") props[field.key] = field.options?.[0] ?? "";
    else if (field.type === "number") props[field.key] = 3;
    else if (field.type === "boolean") props[field.key] = true;
    else props[field.key] = "";
  }

  return props;
}
