import React from "react";

export type BadgeColor = "blue" | "green" | "gray" | "red" | "yellow" | "purple";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  /** Yumshoq (past fonda) yoki to'q (rangli fonda) ko'rinish */
  variant?: "soft" | "solid";
  className?: string;
}

const SOFT: Record<BadgeColor, string> = {
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  green: "bg-green-50 text-green-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  gray: "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300",
  red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  yellow: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
};

const SOLID: Record<BadgeColor, string> = {
  blue: "bg-brand text-white",
  green: "bg-[#00D287] text-white",
  gray: "bg-slate-600 text-white",
  red: "bg-red-500 text-white",
  yellow: "bg-amber-500 text-white",
  purple: "bg-purple-600 text-white",
};

export const Badge = ({
  children,
  color = "blue",
  variant = "soft",
  className = "",
}: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        variant === "solid" ? SOLID[color] : SOFT[color]
      } ${className}`}
    >
      {children}
    </span>
  );
};
