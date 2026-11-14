"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "./AppLogo";
import { useUser } from "@/context/UserContext";

interface SidebarProps {
  /** Mobil menyuda ochiq/closed holati */
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/projects", label: "Mening ilovamim", icon: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 9h18" },
  { href: "/clients", label: "Mijozlar", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87" },
  { href: "/settings", label: "Sozlamalar", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" },
];

const ADMIN_ITEM = {
  href: "/admin",
  label: "Super Admin",
  icon: "M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-6 6 1z",
};

export const Sidebar = ({ open = false, onClose, className = "" }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  // Admin bo'limi faqat super admin uchun
  const items =
    user?.role === "superadmin"
      ? [...NAV_ITEMS, ADMIN_ITEM]
      : NAV_ITEMS;

  return (
    <>
      {/* Mobil menyu orqasi (overlay) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 lg:hidden"
          onClick={onClose}
          role="presentation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col bg-slate-900 p-6 text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : ""
        } ${className}`}
      >
        <div className="mb-10 flex items-center justify-between">
          <AppLogo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Menyuni yopish"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-[#0057FF] text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-slate-800 bg-slate-800/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            AppNest v0.1
          </p>
          <p className="mt-1 text-xs text-slate-400">
            18 ta komponent, tayyor foydalanishga tayyor.
          </p>
        </div>
      </aside>
    </>
  );
};
