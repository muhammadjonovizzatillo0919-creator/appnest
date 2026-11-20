"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { resolvePalette, paletteToCss } from "@/lib/palettes";

/**
 * Foydalanuvchi konteksti.
 *
 * Manba: `/api/auth/session` — sessiya cookie'si asosida.
 * (Avvalgi versiya localStorage'ga to'g'ridan-to'g'ri yozardi — bu xavfsiz emas edi.)
 */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  /** "user" | "superadmin" */
  role: "user" | "superadmin";
  /** "free" | "pro" */
  plan: "free" | "pro";
  /** Tanlangan ish muhiti palitrasi (preset id yoki #hex) */
  accentColor: string;
}

interface UserContextType {
  user: SessionUser | null;
  loading: boolean;
  setUser: (user: SessionUser) => void;
  logout: () => Promise<void>;
  totalClients: number;
  setTotalClients: (count: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalClients, setTotalClients] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Foydalanuvchi tanlagan rangni butun UI ga qo'llaymiz.
   * Tailwind @theme inline orqali --brand → bg-brand/text-brand klasslari ishlaydi.
   */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const palette = resolvePalette(user?.accentColor);
    const css = paletteToCss(palette);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(css)) {
      root.style.setProperty(key, value);
    }
  }, [user?.accentColor, user?.id]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <UserContext.Provider
      value={{ user, loading, setUser, logout, totalClients, setTotalClients }}
    >
      {children}
    </UserContext.Provider>
  );
};

/** Custom hook — xatolarni oldini olish uchun */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
