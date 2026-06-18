'use client';
import { useRouter } from 'next/navigation';
// Agar sizda "Button" komponenti boshqa faylda bo'lsa, import yo'lini tekshiring
import { Button } from "./index"; 

interface NavbarProps {
  title: string;
}

export const Navbar = ({ title }: NavbarProps) => {
  const router = useRouter();

  const handleLogout = () => {
    // Tizimdan chiqish uchun login holatini o'chiramiz
    localStorage.removeItem("isLoggedIn");
    
    // Foydalanuvchini login sahifasiga yo'naltiramiz
    router.push("/login");
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      
      <div className="flex items-center gap-4">
        {/* Chiqish tugmasi */}
        <Button 
          onClick={handleLogout} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Chiqish
        </Button>
      </div>
    </nav>
  );
};