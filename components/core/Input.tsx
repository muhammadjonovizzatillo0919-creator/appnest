import React, { useId } from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Xato matni — ko'rsatilganda maydon qizil chegaraga olib o'tadi */
  error?: string;
  /** Yordamchi matn (label ostida) */
  hint?: string;
  className?: string;
}

export const Input = ({
  label,
  placeholder,
  onChange,
  value,
  type = "text",
  error,
  hint,
  className = "",
  disabled,
  required,
  ...rest
}: InputProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`w-full rounded-lg border bg-white px-4 py-2 text-sm text-slate-900 transition
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100
          dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800
          ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
              : "border-slate-200 focus:border-brand focus:ring-brand/30 dark:border-slate-700"
          }`}
        {...rest}
      />

      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
