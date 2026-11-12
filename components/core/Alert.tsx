import React from "react";

export type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
  children: React.ReactNode;
  type?: AlertType;
  title?: string;
  className?: string;
}

const STYLES: Record<AlertType, string> = {
  success:
    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  error:
    "bg-red-50 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",
  info:
    "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
  warning:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
};

export const Alert = ({ children, type = "info", title, className = "" }: AlertProps) => {
  return (
    <div role="alert" className={`rounded-xl border p-4 text-sm ${STYLES[type]} ${className}`}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  );
};
