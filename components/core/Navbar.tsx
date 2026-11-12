"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Dropdown } from "./Dropdown";
import { useUser } from "@/context/UserContext";

interface NavbarProps {
  title: string;
  /** Mobil menyuni ochish tugmasi */
  onMenuClick?: () => void;
}

export const Navbar = ({ title, onMenuClick }: NavbarProps) => {
  const router = useRouter();
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  const initial = (user?.name ?? "A").trim().charAt(0).toUpperCase();

  return (
    <nav className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Menyuni ochish"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white sm:text-xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Dropdown
          label={
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0057FF] text-xs font-bold text-white">
                {initial}
              </span>
              <span className="hidden sm:inline">{user?.name ?? "Admin"}</span>
            </span>
          }
          items={[
            { label: "Profil", onClick: () => router.push("/settings") },
            { label: "Sozlamalar", onClick: () => router.push("/settings") },
            { label: "Chiqish", onClick: handleLogout, danger: true },
          ]}
        />
      </div>
    </nav>
  );
};
