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
  /** Admin tanlagan butun platforma palitrasi */
  globalPalette: string;
  setGlobalPalette: (value: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalClients, setTotalClients] = useState(0);
  const [globalPalette, setGlobalPalette] = useState("appnest");

  useEffect(() => {
    let cancelled = false;

    // Platforma dizayni (admin boshqaradi) — hamma uchun ochiq
    fetch("/api/appearance")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.appearance?.palette) {
          setGlobalPalette(data.appearance.palette);
        }
      })
      .catch(() => {});

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
   * Rangni butun UI ga qo'llaymiz.
   * Foydalanuvchi shaxsiy rangi (standart "appnest" bo'lmasa) ustun turadi,
   * aks holda admin tanlagan global palitra ishlatiladi.
   * Tailwind @theme inline orqali --brand → bg-brand/text-brand klasslari ishlaydi.
   */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const personal =
      user?.accentColor && user.accentColor !== "appnest"
        ? user.accentColor
        : globalPalette;
    const palette = resolvePalette(personal);
    const css = paletteToCss(palette);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(css)) {
      root.style.setProperty(key, value);
    }
  }, [user?.accentColor, user?.id, globalPalette]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
        totalClients,
        setTotalClients,
        globalPalette,
        setGlobalPalette,
      }}
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
