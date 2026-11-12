import React from "react";

interface GridProps {
  children: React.ReactNode;
  /** Ustunlar soni (1–4) */
  cols?: 1 | 2 | 3 | 4;
  /** Masofa (gap) */
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const COLS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const GAPS = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export const Grid = ({ children, cols = 3, gap = "md", className = "" }: GridProps) => {
  return <div className={`grid ${COLS[cols]} ${GAPS[gap]} ${className}`}>{children}</div>;
};
