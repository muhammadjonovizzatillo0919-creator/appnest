import React from "react";

export interface TableColumn<T> {
  /** Sarlavhadagi kalit */
  key: string;
  /** Sarlavha matni */
  label: string;
  /** Qator qiymatini ko'rsatish (ixtiyoriy) */
  render?: (row: T, index: number) => React.ReactNode;
  /** Qator qiymatini matn sifatida olish (ixtiyoriy) */
  accessor?: (row: T) => string | number;
  /** ustun kengligi */
  className?: string;
}

interface TableProps<T> {
  /** Ustunlar ro'yxati (yoki oddiy header satrlari — eski API bilan moslik uchun) */
  columns?: TableColumn<T>[];
  headers?: string[];
  /** Qatorlar */
  data?: T[];
  /** Yuklanish holati */
  loading?: boolean;
  /** Bo'sh holat matni */
  emptyMessage?: string;
  /** O'chirish tugmasi (har qator uchun) */
  onDelete?: (row: T, index: number) => void;
  /** Bir qatorga bosilganda */
  onRowClick?: (row: T, index: number) => void;
  className?: string;
}

export function Table<T>({
  columns,
  headers,
  data = [],
  loading = false,
  emptyMessage = "Ma'lumot topilmadi",
  onDelete,
  onRowClick,
  className = "",
}: TableProps<T>) {
  // Eski API: headers + data (massivlar) bilan ishlash uchun moslashuv
  const resolvedColumns: TableColumn<T>[] =
    columns ??
    (headers
      ? headers.map((label, i) => ({
          key: String(i),
          label,
          accessor: (row: T) => {
            const value = (row as unknown as Record<string, unknown>)[i];
            return typeof value === "string" || typeof value === "number" ? value : "";
          },
        }))
      : []);

  const colCount = resolvedColumns.length + (onDelete ? 1 : 0);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 uppercase text-xs font-semibold text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          <tr>
            {resolvedColumns.map((col) => (
              <th key={col.key} className={`px-6 py-3 ${col.className ?? ""}`}>
                {col.label}
              </th>
            ))}
            {onDelete && <th className="px-6 py-3 text-right">Amallar</th>}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <tr>
              <td colSpan={colCount} className="px-6 py-10 text-center text-slate-500">
                <span className="inline-flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#0057FF]" />
                  Yuklanmoqda...
                </span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-6 py-10 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                className={`text-slate-700 dark:text-slate-200 ${
                  onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" : ""
                }`}
              >
                {resolvedColumns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 ${col.className ?? ""}`}>
                    {col.render
                      ? col.render(row, rowIndex)
                      : col.accessor
                        ? col.accessor(row)
                        : null}
                  </td>
                ))}

                {onDelete && (
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row, rowIndex);
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      O&apos;chirish
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
