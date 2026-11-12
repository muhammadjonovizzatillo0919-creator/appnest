import Link from "next/link";
import { Button } from "@/components/core";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center dark:bg-[#0b1120]">
      <p className="text-6xl font-bold text-[#0057FF]">404</p>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sahifa topilmadi
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Siz izlagan sahifa mavjud emas yoki ko&apos;chirilgan.
        </p>
      </div>
      <Link href="/">
        <Button>Bosh sahifaga qaytish</Button>
      </Link>
    </main>
  );
}
