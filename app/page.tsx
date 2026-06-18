// app/page.tsx
'use client';
import { useState } from 'react';
import { Card } from "@/components/core/Card";
import { Button } from "@/components/core/Button";
import { Table } from "@/components/core/Table";
import { Toast } from "@/components/core/Toast";
import { Loading } from "@/components/core/Loading";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleAction = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 2000);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {isLoading ? <Loading /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>Mijozlar: 150</Card>
            <Card>Faol loyihalar: 12</Card>
            <Button onClick={handleAction}>Yangilash</Button>
          </div>
          <Table />
        </>
      )}

      {showToast && <Toast message="Ma'lumotlar yangilandi!" type="success" />}
    </div>
  );
}