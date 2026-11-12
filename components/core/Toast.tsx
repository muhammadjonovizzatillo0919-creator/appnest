"use client";

import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: React.ReactNode;
  type?: ToastType;
  /** Avtomatik yopilish (ms). 0 — o'zi yopilmaydi */
  duration?: number;
  onClose?: () => void;
  className?: string;
}

const STYLES: Record<ToastType, { box: string; icon: React.ReactNode }> = {
  success: {
    box: "bg-emerald-600 text-white",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
  error: {
    box: "bg-red-600 text-white",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    ),
  },
  info: {
    box: "bg-[#0057FF] text-white",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
};

export const Toast = ({
  message,
  type = "success",
  duration = 4000,
  onClose,
  className = "",
}: ToastProps) => {
  // Avtomatik yopilish
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-fade-in fixed bottom-5 right-5 z-[9999] flex max-w-sm items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl ${STYLES[type].box} ${className}`}
    >
      <span className="shrink-0">{STYLES[type].icon}</span>
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="ml-auto shrink-0 rounded-md p-1 opacity-70 transition hover:bg-white/20 hover:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
