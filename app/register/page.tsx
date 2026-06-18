'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button } from "../../components/core";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = () => {
    // Foydalanuvchi ma'lumotlarini saqlaymiz
    const userData = { email, password };
    localStorage.setItem("user_data", JSON.stringify(userData));
    alert("Ro'yxatdan o'tdingiz! Endi kiring.");
    router.push("/login");
  };

  return (
    <main className="h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Ro'yxatdan o'tish</h2>
        <Input label="Email" onChange={(e: any) => setEmail(e.target.value)} />
        <Input label="Parol" type="password" onChange={(e: any) => setPassword(e.target.value)} />
        <Button onClick={handleRegister} className="w-full mt-4">Ro'yxatdan o'tish</Button>
      </Card>
    </main>
  );
}