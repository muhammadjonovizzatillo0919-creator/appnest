import type { NextConfig } from "next";

/**
 * Vercel'da ishlayotgan build'lar uchun normal sozlamalar.
 * Mahalliy kompyuterda RAM cheklovini hisobga olib, worker sonini
 * kamaytiramiz — aks holda "Generating static pages" bosqichida
 * xotira yetishmaydi (build worker crash bo'ladi).
 */
const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  /**
   * Turbopack workspace root'ni aniq belgilaymiz.
   * Sabab: kompyuterda C:\Users\user\package-lock.json (asosiy ish joyidan tashqarida)
   * mavjudligi Next.js root'ni noto'g'ri aniqlashiga va build ogohlantirishiga olib keladi.
   * process.cwd() har doim loyiha papkasini ko'rsatadi — lokal va Vercel'da to'g'ri ishlaydi.
   */
  turbopack: {
    root: process.cwd(),
  },

  experimental: {
    // Next.js worker sonini qolgan RAM bo'yicha avtomatik tanlasin
    memoryBasedWorkersCount: true,
    ...(isVercel ? {} : { cpus: 1 }),
  },
};

export default nextConfig;
