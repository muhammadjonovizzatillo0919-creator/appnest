"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

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
