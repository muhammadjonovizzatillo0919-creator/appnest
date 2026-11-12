"use client";

import { useEffect } from "react";
import { Button } from "@/components/core";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Xatoni serverga yuborish (productionda monitoring uchun)
    console.error("AppNest xatosi:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center dark:bg-[#0b1120]">
      <p className="text-6xl font-bold text-[#0057FF]">500</p>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Nimadir noto&apos;g&apos;ri ketdi
        </h1>
        <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
          Sahifani qayta yuklash muammoni hal qilishi mumkin. Agar takrorlansa, xato matnini
          yozib boring.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Qayta urinish</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Bosh sahifa
        </Button>
      </div>
    </main>
  );
}
