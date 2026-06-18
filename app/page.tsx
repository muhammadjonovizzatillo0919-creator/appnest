// app/page.tsx
'use client';
import { Table } from "@/components/core/Table";

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Table 
        headers={["Ism", "Email", "Holati"]} 
        data={[]} 
        onDelete={() => console.log("O'chirildi")} 
      />
    </div>
  );
}