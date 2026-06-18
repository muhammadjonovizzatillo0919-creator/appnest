// components/core/Sidebar.tsx
'use client';
import { usePathname } from 'next/navigation';
import { AppLogo } from "./AppLogo"; // Biz yaratgan logoni ulaymiz

export const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800";

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6 flex flex-col">
      {/* Logotipni chaqirish */}
      <div className="mb-10 px-2">
        <AppLogo />
      </div>
      
      <nav className="flex flex-col gap-2">
        <a href="/" className={`block p-3 rounded transition-all ${isActive('/')}`}>Dashboard</a>
        <a href="/clients" className={`block p-3 rounded transition-all ${isActive('/clients')}`}>Mijozlar</a>
        <a href="/settings" className={`block p-3 rounded transition-all ${isActive('/settings')}`}>Sozlamalar</a>
      </nav>

      <div className="mt-auto text-center">
        <p className="text-xs text-gray-500">© 2026 AppNest Admin</p>
      </div>
    </aside>
  );
};