import { Loading as LoadingSpinner } from "@/components/core";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0b1120]">
      <LoadingSpinner label="Sahifa yuklanmoqda..." size="lg" />
    </div>
  );
}
