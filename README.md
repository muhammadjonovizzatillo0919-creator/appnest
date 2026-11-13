# AppNest

**Next.js 16 · React 19 · Tailwind CSS v4 asosidagi admin panel va UI Kit.**

Tayyor komponentlar, tungi rejim, responsive dizayn va autentifikatsiya sahifalari — nusxalang va
foydalanishga tayyor.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

**Live:** [appnest-mir07.vercel.app](https://appnest-mir07.vercel.app) · **Repo:** [github.com/muhammadjonovizzatillo0919-creator/appnest](https://github.com/muhammadjonovizzatillo0919-creator/appnest)

---

## Tez ishga tushirish

```bash
git clone https://github.com/muhammadjonovizzatillo0919-creator/appnest.git
cd appnest
npm install
npm run dev
```

Brauzer: [http://localhost:3000](http://localhost:3000)

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Ishlab chiqarish serveri (Turbopack) |
| `npm run build` | Production build (Vercel shu buyruqni ishga tushiradi) |
| `npm run start` | Production serverni ishga tushirish |
| `npm run lint` | ESLint tekshiruvi |

---

## Sahifalar

| Sahifa | Yo'l | Vazifasi |
|---|---|---|
| Landing | `/` | Loyiha taqdimoti, komponentlar ro'yxati, o'rnatish ko'rsatmasi |
| Dashboard | `/` | (demo) kirish oynasi orqali |
| Mijozlar | `/clients` | Jadval, qidirish, modal, arxivlash, o'chirish |
| Sozlamalar | `/settings` | Profil ma'lumotlari, tema |
| Kirish | `/login` | Demo autentifikatsiya |
| Ro'yxatdan o'tish | `/register` | Demo ro'yxatdan o'tish |

Qo'shimcha fayllar: `app/error.tsx` (500), `app/loading.tsx`, `app/not-found.tsx` (404).

---

## Komponentlar (18 ta)

Barchasi `components/core/` papkasida, yagona eksport nuqtasi orqali:

```tsx
import { Button, Card, Table, Input, Modal, Toast, Badge } from "@/components/core";
```

| Komponent | Imkoniyatlar |
|---|---|
| `Button` | 5 variant (`primary`, `secondary`, `danger`, `outline`, `ghost`), 3 o'lcham, `loading`, `fullWidth` |
| `Input` | `label`, `hint`, `error`, `required`, `disabled`, `useId` bilan `htmlFor` bog'lanishi |
| `Table` | Generik (`Table<T>`), ustunlar, `render`/`accessor`, `loading`, bo'sh holat, `onDelete`, `onRowClick` |
| `Modal` | Esc bilan yopish, orqa fon bosilish, fokus, tana scroll bloklash, `aria-modal` |
| `Dropdown` | Tashqariga bosilganda yopiladi, Esc, `align`, xavfli amal (`danger`) |
| `Toast` | `success` / `error` / `info`, avtomatik yopilish, `onClose` |
| `Sidebar` | Faol holat (`usePathname`), mobil drawer, `next/link` |
| `Navbar` | Tema tugmasi, foydalanuvchi menyusi, mobil menyu tugmasi |
| `Badge` | 6 rang, `soft` va `solid` variantlar |
| `Alert` | 4 tur: `success`, `error`, `info`, `warning` |
| `StatCard` | Qiymat, trend, ikonka |
| `Card` | `hover` effekti bilan |
| `Grid` | 1–4 ustun, responsive |
| `Container` | `max-w-7xl` konteyner |
| `Loading` | 3 o'lchamdagi spinner |
| `AppLogo` | CSS bilan chiziladi — fayl kerak emas |
| `ThemeToggle` | `localStorage` + tizim afzalligi bilan sinxron |
| `Footer` | Yil avtomatik |

Qo'shimcha layout komponenti: `components/layout/DashboardShell.tsx` (Sidebar + Navbar + content + Footer).

---

## Namuna kodi

```tsx
"use client";
import { useState } from "react";
import { Badge, Button, Card, Input, Modal, Table, Toast } from "@/components/core";

export default function Example() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <Card>
        <Button onClick={() => setOpen(true)}>Modal ochish</Button>
      </Card>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Sarlavha">
        <Input label="Ism" placeholder="Ismingiz" />
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
```

---

## Tungi rejim

Rejim `<html>` elementidagi `dark` klassi bilan boshqariladi. Tanlov `localStorage` da saqlanadi
(`appnest-theme` kaliti) va `app/layout.tsx` dagi skript sahifa bo'yalishidan **oldin** klassni
qo'yadi — shuning uchun "flash" bo'lmaydi.

```css
/* globals.css */
@custom-variant dark (&:where(.dark, .dark *));
```

Komponentlarda esa oddiy `dark:` prefiksi ishlatiladi:

```tsx
<div className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white" />
```

---

## Fayl tuzilmasi

```
appnest/
├── app/
│   ├── layout.tsx          # metadata, viewport, shriftlar, tema skripti
│   ├── globals.css         # tokenlar, dark variant, animatsiyalar
│   ├── page.tsx            # landing sahifa
│   ├── error.tsx           # 500
│   ├── loading.tsx         # yuklanish
│   ├── not-found.tsx       # 404
│   ├── clients/page.tsx    # jadval + modal demo
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── core/               # 18 ta komponent + index.ts
│   └── layout/             # DashboardShell
├── context/UserContext.tsx
├── next.config.ts
├── tailwind.config (Tailwind v4 — CSS-first, config fayli kerak emas)
└── tsconfig.json
```

---

## Muhim eslatmalar

> ✅ **Autentifikatsiya haqiqiy.** Parollar `scrypt` hash bilan saqlanadi (`.data/appnest.db`),
> sessiya HMAC imzolangan httpOnly cookie. `/dashboard`, `/clients`, `/settings` — `proxy.ts` bilan
> himoyalangan.
>
> ✅ **Ma'lumotlar bazasi — SQLite / Turso.** Lokol muhitda `node:sqlite` (Node.js'ning o'z
> moduli — qo'shimcha paket kerak emas), production'da **Turso/libSQL** (serverless).
> Tanlash avtomatik: `TURSO_DATABASE_URL` belgilangan bo'lsa — Turso, aks holda lokal fayl.
> Jadvalar: `users`, `clients`, `activity`. Sxema birinchi ulanishda avtomatik yaratiladi.
>
> ⚠️ **Production (Vercel) uchun:** Vercel'da fayl tizimi faqat o'qiladigan — shuning uchun
> `AUTH_SECRET` va `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` muhit o'zgaruvchilarini
> **albatta** qo'ying (quyida ko'rsatilgan).
>
> ⚠️ **`AUTH_SECRET`** ni Vercel'ga **albatta** qo'ying — aks holda deploy'dan keyin barcha
> sessiyalar bekor bo'ladi. Kalitni generatsiya qilish:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
>
> ℹ️ **Turbopack root.** `next.config.ts` da `turbopack.root` aniq belgilangan — kompyuterda
> `C:\Users\user\package-lock.json` kabi tashqaridagi lockfile'lar Next.js root'ni noto'g'ri
> aniqlashiga olib kelardi.

---

## Ma'lumotlar bazasi — SQLite / Turso

Bitta kod, ikkala muhit. Tanlash avtomatik: `TURSO_DATABASE_URL` belgilangan bo'lsa — Turso,
aks holda lokal fayl.

| Muhit | Nima | Qayerda |
|---|---|---|
| **Lokal (development)** | `node:sqlite` — Node.js'ning o'z moduli, **0 qo'shimcha paket** | `.data/appnest.db` |
| **Production (Vercel)** | **Turso / libSQL** — serverless, bepul tier | Turso cloud |

> Nega Turso? SQL dialekti SQLite bilan **bir xil** — shuning uchun store kodi ikkala
> muhitda ham o'zgarmasdan ishlaydi. Vercel serverless'da fayl tizimi faqat o'qiladigan
> bo'lgani uchun oddiy fayl ishlamaydi.

### Turso'ni ulash (3 qadam)

1. **https://turso.tech** → hisob yarating (GitHub bilan)
2. **Create Database** → `DATABASE_URL` va `Auth Token` oling
3. `.env` fayliga yozing:

```bash
TURSO_DATABASE_URL=libsql://your-db-your-org.turso.io
TURSO_AUTH_TOKEN=your_auth_token
```

**Sxema avtomatik yaratiladi** — birinchi ulanishda `lib/db.ts` jadvallarni yaratadi va
bo'sh bo'lsa namuna ma'lumotlarni qo'shadi. Qo'shimcha migratsiya buyrug'i kerak emas.

### Vercel'ga o'tkazish

1. Vercel → Project → **Settings → Environment Variables**
2. Quyidagilarni qo'shing:
   - `AUTH_SECRET` — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
3. **Settings → Deployment Protection → Disabled** (sayt ommaga ochiq bo'lishi uchun)
4. Deploy

### Schema

```sql
users    (id, name, email UNIQUE, password_hash, created_at)
clients  (id, name, email, status, note, created_at, updated_at)
activity (id, client_id, action, created_at)   -- jurnal: create / update / delete
```

### API endpoint'lar

| Metod | Yo'l | Vazifasi |
|---|---|---|
| `GET` | `/api/clients?search=&status=` | Ro'yxat (server tomonda qidirish) |
| `POST` | `/api/clients` | Yangi mijoz |
| `PATCH` | `/api/clients/[id]` | Yangilash (holat, ism, email, izoh) |
| `DELETE` | `/api/clients/[id]` | O'chirish |
| `GET` | `/api/stats` | Dashboard statistikalari |
| `POST` | `/api/auth/register` \| `login` \| `logout` | Autentifikatsiya |
| `GET` | `/api/auth/session` | Joriy foydalanuvchi |

**Lokal ma'lumotlarni tozalash:** `.data/appnest.db` faylini o'chirib, keyin `npm run dev` bilan
qayta yaratish — baza avtomatik seed qilinadi.

---

## Deploy (Vercel)

1. Repozitoriy GitHub'ga ulangan (✅ bajarilgan).
2. Vercel → **Add New** → **Project** → `appnest` repozitoriyini tanlang.
3. Framework preset: **Next.js** · Build command: `npm run build` · Output: default.
4. **Deploy** — har bir `git push` avtomatik yangi versiya deploy qiladi.

Hozircha muhit o'zgaruvchilari (env vars) talab qilinmaydi.

> ⚠️ **Deployment Protection.** Loyiha hozirda Vercel Authentication bilan himoyalangan — tashqi
> tomondan kirganda "Login - Vercel" sahifasi chiqadi. Saytni ommaga ochish uchun:
> **Vercel Dashboard → appnest → Settings → Deployment Protection → "Disabled"** (yoki
> "Password Protection" qo'yib, parol bilan kirish).
>
> Sozlangandan keyin `appnest-mir07.vercel.app` to'g'ridan-to'g'ri ochiladi.

### Mahalliy xotira cheklovi

`next.config.ts` da `experimental.cpus: 1` va `memoryBasedWorkersCount: true` belgilangan —
kompyuterda RAM kam bo'lganda build worker'lar crash bo'lmasligi uchun.
Vercel'da bu cheklov avtomatik o'chadi (`process.env.VERCEL` tekshiruvi).

---

## Litsenziya

MIT — erkin ishlatish, o'zgartirish va tarqatish uchun.
