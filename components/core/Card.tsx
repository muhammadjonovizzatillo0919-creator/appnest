import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Hoverda soya kuchayadimi */
  hover?: boolean;
}

export const Card = ({ children, className = "", hover = true }: CardProps) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow dark:border-slate-800 dark:bg-slate-900 ${
        hover ? "hover:shadow-md dark:hover:shadow-lg" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};
