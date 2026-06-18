// components/core/Sidebar.tsx
'use client';
import { usePathname } from 'next/navigation';
import { AppLogo } from "./AppLogo"; 

export const Sidebar = () => {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <div className="mb-10">
        <AppLogo /> 
      </div>
      
      <nav className="flex flex-col gap-2">
        <a href="/" className={`block p-3 rounded ${pathname === '/' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>Dashboard</a>
        <a href="/clients" className={`block p-3 rounded ${pathname === '/clients' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>Mijozlar</a>
        <a href="/settings" className={`block p-3 rounded ${pathname === '/settings' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>Sozlamalar</a>
      </nav>
    </aside>
  );
};