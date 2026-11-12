"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "appnest-theme";
const CHANGE_EVENT = "appnest-theme-change";

/**
 * Mavzuni tashqi "do'kon" sifatida o'qish.
 * React 19'ning `useSyncExternalStore` — bu holat serverda ham, brauzerda ham
 * bir xil ishlaydi va `setState` effekt ichida chaqirilmaydi.
 */
const themeStore = {
  subscribe(callback: () => void) {
    window.addEventListener(CHANGE_EVENT, callback);
    // Tizim afzalligi o'zgarganda ham xabar beramiz
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", callback);
    return () => {
      window.removeEventListener(CHANGE_EVENT, callback);
      media.removeEventListener("change", callback);
    };
  },
  getSnapshot(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },
  getServerSnapshot(): Theme {
    return "light";
  },
};

/**
 * Tungi rejimni boshqaradi. Holat localStorage'da saqlanadi va
 * `<html>` elementiga `dark` klassi qo'yiladi.
 */
export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  );

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
      title={theme === "dark" ? "Yorug' rejim" : "Tungi rejim"}
      className={`rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 ${className}`}
    >
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
};
