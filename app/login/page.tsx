'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button } from "../../components/core";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    const savedUser = localStorage.getItem("user_data");
    
    if (savedUser) {
      const { email: savedEmail, password: savedPassword } = JSON.parse(savedUser);
      
      if (email === savedEmail && password === savedPassword) {
        localStorage.setItem("isLoggedIn", "true");
        router.push("/"); // Dashboardga o'tish
      } else {
        alert("Email yoki parol noto'g'ri!");
      }
    } else {
      alert("Foydalanuvchi topilmadi. Avval ro'yxatdan o'ting!");
    }
  };

  return (
    <main className="h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Panelga kirish</h2>
        <Input label="Email" onChange={(e: any) => setEmail(e.target.value)} />
        <Input label="Parol" type="password" onChange={(e: any) => setPassword(e.target.value)} />
        <Button onClick={handleLogin} className="w-full mt-4">Kirish</Button>
        <p className="mt-4 text-center text-sm">
          Hisobingiz yo'qmi? <a href="/register" className="text-blue-600 font-bold">Ro'yxatdan o'tish</a>
        </p>
      </Card>
    </main>
  );
}