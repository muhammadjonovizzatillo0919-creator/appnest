"use client";

import { useState } from "react";
import { Sidebar, Navbar, Footer } from "@/components/core";

interface DashboardShellProps {
  title: string;
  children: React.ReactNode;
  /** Footer ko'rsatilsinmi */
  withFooter?: boolean;
}

/**
 * Admin panel sahifalari uchun umumiy qobiq:
 * Sidebar + Navbar + kontent + Footer.
 * Mobil menyu holati shu yerda boshqariladi.
 */
export const DashboardShell = ({
  title,
  children,
  withFooter = true,
}: DashboardShellProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b1120]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={title} onMenuClick={() => setMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-10">{children}</main>

        {withFooter && <Footer />}
      </div>
    </div>
  );
};
