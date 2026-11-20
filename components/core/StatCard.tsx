import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  /** O'zgarish вЂ” masalan "+12%" */
  trend?: { value: string; positive?: boolean };
  icon?: React.ReactNode;
}

export const StatCard = ({ title, value, trend, icon }: StatCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        {icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-brand dark:bg-blue-500/15 dark:text-blue-300">
            {icon}
          </span>
        )}
      </div>

      {trend && (
        <p
          className={`mt-3 text-xs font-semibold ${
            trend.positive === false
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {trend.value}
        </p>
      )}
    </div>
  );
};
