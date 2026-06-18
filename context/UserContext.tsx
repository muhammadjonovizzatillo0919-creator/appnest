'use client';
import { createContext, useState, useContext } from 'react';

// 1. Context uchun interfeys (TypeScript uchun muhim)
interface UserContextType {
  user: { name: string; email: string };
  setUser: (user: { name: string; email: string }) => void;
  totalClients: number;
  setTotalClients: (count: number) => void;
}

// 2. Context ni yaratamiz (undefined bilan boshlaymiz)
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState({ name: "Admin User", email: "admin@appnest.uz" });
  const [totalClients, setTotalClients] = useState(0);

  return (
    <UserContext.Provider value={{ user, setUser, totalClients, setTotalClients }}>
      {children}
    </UserContext.Provider>
  );
};

// 3. Custom hook (xatolarni oldini olish uchun)
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};