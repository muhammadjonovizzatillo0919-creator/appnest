import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Yuklanish holati — matn o'rniga spinner ko'rsatiladi */
  loading?: boolean;
  /** Butun kenglikda cho'zilish */
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-blue-700 focus-visible:outline-brand shadow-sm",
  secondary:
    "bg-[#00D287] text-white hover:bg-emerald-600 focus-visible:outline-[#00D287] shadow-sm",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus-visible:outline-red-500 shadow-sm",
  outline:
    "border border-brand text-brand hover:bg-blue-50 dark:hover:bg-blue-500/10 bg-transparent",
  ghost:
    "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-7 py-3 text-base rounded-xl",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 " +
    "focus-visible:outline focus-visible:outline-2 disabled:opacity-50 disabled:pointer-events-none";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
};
