'use client';
import { useState } from 'react';
import { useUser } from "../../context/UserContext";
import { Sidebar, Navbar, Card, Button, Input, Footer } from "../../components/core";

export default function SettingsPage() {
  const { user, setUser } = useUser();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    setUser({ name, email });
    alert("Ma'lumotlar muvaffaqiyatli saqlandi!");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Sozlamalar" />
        <div className="p-10 flex-grow">
          <h2 className="text-2xl font-bold mb-6">Profil ma'lumotlari</h2>
          <Card className="max-w-xl">
            <div className="space-y-4">
              <Input 
                label="Ism" 
                value={name} 
                onChange={(e: any) => setName(e.target.value)} 
              />
              <Input 
                label="Email" 
                value={email} 
                onChange={(e: any) => setEmail(e.target.value)} 
              />
              <Button onClick={handleSave}>Saqlash</Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    </main>
  );
}