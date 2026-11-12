// components/core/Loading.tsx
import React from "react";

interface LoadingProps {
  /** Yuklanish matni */
  label?: string;
  /** Kichik o'lcham (inline holatlar uchun) */
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
};

export const Loading = ({ label = "Ma'lumotlar yuklanmoqda...", size = "md" }: LoadingProps) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 py-10">
      <div
        aria-hidden="true"
        className={`animate-spin rounded-full border-t-transparent border-[#0057FF] ${SIZES[size]}`}
      />
      <span className="animate-pulse text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
};
