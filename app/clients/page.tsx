'use client';
import { useState, useEffect } from 'react';
import { useUser } from "../../context/UserContext";
import { Sidebar, Navbar, Card, Button, Footer, Modal, Input, Table, Badge } from "../../components/core";

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { setTotalClients } = useUser();

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((user: any) => [
          user.id.toString(),
          user.name,
          user.email,
          "Faol"
        ]);
        setClients(formatted);
        setTotalClients(data.length);
        setLoading(false);
      });
  }, [setTotalClients]);

  // Holatni o'zgartirish funksiyasi
  const toggleStatus = (index: number) => {
    const updated = clients.map((client, i) => {
      if (i === index) {
        return [client[0], client[1], client[2], client[3] === "Faol" ? "Arxiv" : "Faol"];
      }
      return client;
    });
    setClients(updated);
  };

  const deleteClient = (index: number) => {
    const updated = clients.filter((_, i) => i !== index);
    setClients(updated);
    setTotalClients(updated.length);
  };

  const addClient = () => {
    const newClient = [(clients.length + 1).toString(), newName, newEmail, "Faol"];
    const updated = [...clients, newClient];
    setClients(updated);
    setTotalClients(updated.length);
    setNewName("");
    setNewEmail("");
    setIsModalOpen(false);
  };

  const filteredClients = clients.filter((client) =>
    client[1].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Mijozlar" />
        <div className="p-10 flex-grow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Mijozlar ro'yxati</h2>
            <div className="flex gap-4">
              <Input placeholder="Qidirish..." onChange={(e: any) => setSearchTerm(e.target.value)} />
              <Button onClick={() => setIsModalOpen(true)}>+ Yangi Mijoz</Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center font-bold text-gray-500 py-10">Yuklanmoqda...</div>
          ) : (
            <Card>
              <Table 
                headers={["ID", "Ism", "Email", "Holat", "Amallar"]} 
                data={filteredClients.map((row: any, index: number) => [
                  row[0], 
                  row[1], 
                  row[2], 
                  <Badge color={row[3] === "Faol" ? "green" : "gray"}>{row[3]}</Badge>,
                  <Button size="sm" onClick={() => toggleStatus(index)}>
                    {row[3] === "Faol" ? "Arxivlash" : "Faollashtirish"}
                  </Button>
                ])} 
                onDelete={deleteClient} 
              />
            </Card>
          )}
        </div>
        <Footer />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Mijoz qo'shish">
        <div className="flex flex-col gap-4">
          <Input label="Mijoz ismi" placeholder="Ism..." onChange={(e: any) => setNewName(e.target.value)} />
          <Input label="Email" placeholder="Email..." onChange={(e: any) => setNewEmail(e.target.value)} />
          <Button onClick={addClient}>Saqlash</Button>
        </div>
      </Modal>
    </main>
  );
}