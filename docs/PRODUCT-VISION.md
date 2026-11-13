# AppNest — Mahsulot Konsepsiyasi va Arxitektura

> Asl g'oya: **dasturlashni bilmaydigan odam** o'zining web yoki mobil ilovasini noldan,
> AI yordamida yaratadi. 1+1 usuli: har bir yangi foydalanuvchiga **1 ta bepul loyiha**.

---

## 1. Nima quriladi

| | |
|---|---|
| **Nomi** | AppNest |
| **Turi** | SaaS — AI no-code ilova quruvchi |
| **Foydalanuvchi** | Dasturlashni bilmaydigan oddiy foydalanuvchi (restoran, do'kon, maktab, universitet) |
| **Natija** | Matn yozadi → AI tahlil qiladi → tayyor ilova + vizual quruvchi |

---

## 2. 5 ta ustun (pillar)

```
                    ┌──────────────────────────────┐
   ① AI GENERATSIYA │  Gemini function calling     │  ← D:\AI-WEB-BUILDER
                    │  matn → app spetsifikatsiyasi │
                    └──────────────┬───────────────┘
                                   │ JSON: pages, blocks, fields
                                   ▼
   ② VIZUAL QURUVCHI ┌──────────────────────────────┐
   (Web)             │  bloklar ustma-ust, drag&drop │
                     └──────────────┬───────────────┘
                                    │
   ③ SMART GRID      ┌──────────────▼───────────────┐
   (Mobil)           │  12 ustun, qoidalar: yashil=   │
                     │  mumkin, qizil= xato           │
                     └──────────────┬───────────────┘
                                    │
   ④ FREEMIUM (1+1)  ┌──────────────▼───────────────┐
                     │  1 ta bepul loyiha | PRO      │
                     └──────────────┬───────────────┘
                                    │
   ⑤ SUPER ADMIN     ┌──────────────▼───────────────┐
                     │  tarix, urinishlar, statistika │
                     └──────────────────────────────┘
```

**Mavjud kod qayerda ishlatiladi:** 18 ta komponent (`components/core/*`) — bu **blok palitrasi**.
Har bir komponent = builder'da drag qilinadigan blok turi.

---

## 3. Foydalanuvchi oqimi (User Flow)

```
1. Ro'yxatdan o'tish → shaxsiy akunt
2. Kategoriya tanlash: Restoran | Do'kon | Maktab | Universitet | ... | Boshqa
   └─ "Boshqa" → erkin matnda o'z yo'nalishini yozadi
3. AI tahlil qiladi → kerakli sahifalar, bloklar, funksiyalar
4. Vizual quruvchi ochiladi → bloklarni surib joylashtiradi → "Saqlash"
5. (Freemium) Bepul loyihani faollashtirish uchun PRO kerak
```

---

## 4. Ma'lumot modeli

| Jadval | Vazifasi |
|---|---|
| `users` | + `role` (user/superadmin), + `plan` (free/pro) |
| `projects` | Loyiha: category, brief, platform (web/mobile), status (draft/active), `ai_spec` (JSON), `layout` (JSON) |
| `generation_attempts` | Har bir AI urinish: №, model, davomiylik, token, xato |
| `activity` | Umumiy harakat jurnal |

**`layout` JSON namunasi:**
```json
{
  "platform": "web",
  "rows": [
    {
      "id": "r1",
      "type": "window",
      "blocks": [
        { "id": "b1", "component": "Navbar", "props": { "title": "Restoran" }, "style": {} },
        { "id": "b2", "component": "Card", "props": { "title": "Bugungi taomlar" } }
      ]
    }
  ]
}
```

**Mobil uchun** qo'shimcha maydon:
```json
{ "id": "b5", "component": "Button", "grid": { "x": 0, "y": 12, "w": 12, "h": 2 },
  "constraints": { "anchor": "bottom", "allowedAnchors": ["bottom"] } }
```

---

## 5. 1+1 qoidasi (Freemium)

| | FREE | PRO |
|---|---|---|
| Loyiha yaratish | **1 ta** | Cheksiz |
| Loyihani ko'rish (preview) | ✅ | ✅ |
| Loyihani **faollashtirish** (production) | ❌ | ✅ |
| Drag & drop builder | ✅ | ✅ |
| AI generatsiya | 1 ta loyiha doirasida | ✅ |
| Export / publish | ❌ | ✅ |

**API darajasida tekshiruv** (`lib/entitlements.ts`) — faqat UI da emas, serverda ham:
- `canCreateProject(user)` → loyihalar soni < limit
- `canActivateProject(user, project)` → `plan === 'pro'`
- `canGenerate(user, project)` → free foydalanuvchi faqat o'zining 1 ta loyihasini generatsiya qila oladi

---

## 6. Smart Grid qoidalari (mobil)

Foydalanuvchi elementni olib joylashganda validator ishlaydi:

| Blok turi | Qoidalar |
|---|---|
| `Navbar` | faqat yuqorida (`y = 0`) |
| `Footer` | faqat pastda |
| `BottomNav` | faqat pastda, eng oxirgi qator |
| `Card`, `Button`, `Input` | erkin (grid ichida) |
| `Hero` | faqat birinchi qatorlarda |

Natija: **mumkin joylar yashil**, **mumkin bo'lmagan joylar qizil** — foydalanuvchi xato qilmaydi.

---

## 7. Super Admin dashboard

| Blok | Ko'rsatadi |
|---|---|
| **Loyiha tarixi** | Kim, qanday kategoriya, qanday dizayn tanladi |
| **Statistika va urinishlar** | Bitta loyiha uchun necha urinish, qancha vaqtda yasaldi |
| **Foydalanuvchi holati** | Kim Free, kim PRO, kim faol |
| **T转化a** | Free → PRO konversiyasi, kategoriya bo'yicha taqsimot |

---

## 8. Texnik arxitektura

| Qatlam | Texnologiya |
|---|---|
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind v4 |
| UI kit | `components/core/*` — 18 blok (builder'ning palitrasi) |
| Backend | Next.js Route Handlers (API) |
| DB | SQLite (lokal) / Turso (production) — `lib/db.ts` |
| AI | Gemini 2.5 Pro/Flash — `D:\AI-WEB-BUILDER`dan o'tadi |
| Autentifikatsiya | scrypt + HMAC sessiya — `lib/auth.ts` |
| Saqlash | `localStorage` / sonra server (Supabase kabi) |

---

## 9. Implementatsiya bosqichlari

| Bosqich | Nima | Holat |
|---|---|---|
| **P0** | UI kit + auth + DB + CRUD + CI | ✅ bajarilgan |
| **P1** | **Ma'lumot modeli**: `projects`, `generation_attempts`, `role`, `plan` + 1+1 entitlements | ✅ bajarilgan |
| **P2** | AI generatsiya servisi (Gemini → app spec JSON) | ✅ bajarilgan |
| **P3** | Web vizual quruvchi (drag & drop, blok palitrasi, property panel) | ⬜ |
| **P4** | Mobil Smart Grid + qoidalar (yashil/qizil) | ⬜ |
| **P5** | Freemium: aktivatsiya, PRO chegara, Stripe | 🟡 qoida ishlaydi, to'lov yo'q |
| **P6** | Super admin dashboard (statistika, tarix, urinishlar) | 🟡 API tayyor, UI kerak |

---

## 9.1. P1 va P2 — nima qurildi

### P1 — 1+1 qoidasi (server tomonda)

| Fayl | Vazifasi |
|---|---|
| `lib/entitlements.ts` | `canCreateProject` · `canActivateProject` · `canGenerate` · `describeEntitlements` |
| `lib/project-store.ts` | Loyihalar CRUD + `generation_attempts` jurnal + admin statistikasi |
| `lib/session.ts` | Joriy foydalanuvchi + 401/403/400 yordamchilari |
| `app/api/projects/route.ts` | GET (ro'yxat + tarif) · POST (1+1 gate bilan) |
| `app/api/projects/[id]/route.ts` | GET · PATCH · DELETE |
| `app/api/admin/stats/route.ts` | Super admin statistikasi (faqat superadmin) |

**Tekshirilgan:** FREE → 1 loyiha ✅ · 2-loyiha **403** ✅ · faollashtirish **403** ✅ ·
PRO → cheksiz ✅ · faollashtirish ✅ · admin statistikasi ✅

### P2 — AI generatsiya

| Fayl | Vazifasi |
|---|---|
| `lib/ai-generator.ts` | Kategoriya shablonlari (4 ta) + `buildTemplateSpec` + `validateAppSpec` |
| `lib/gemini.ts` | Gemini klienti, model routing (flash/pro), kontekst cache |
| `lib/ai-service.ts` | System prompt + JSON sxema + Gemini chaqiruvi + fallback |
| `app/api/projects/[id]/generate/route.ts` | Generatsiya + urish jurnali + 1+1 gate |

**Muhim:** Gemini kaliti yo'q bo'lsa yoki AI xato bersa — tizim **shablon bilan ishlaydi**
(foydalanuvchi hech narsaga olmaydi). Kalit olgach avtomatik AI ga o'tadi.

**Kategoriyalar va shablonlari:**

| Kategoriya | Sahifalar | Modellar |
|---|---|---|
| Restoran | 4 (Bosh, Menyu, Buyurtma, Biz haqimizda) | Dish, Order |
| Do'kon | 4 (Bosh, Katalog, Mahsulot, Savat) | Product, CartItem |
| Maktab | 4 (Bosh, Dars jadvali, O'quvchilar, E'lonlar) | Student, Lesson |
| Universitet | 4 (Bosh, Fakultetlar, Jadval, Kirish) | Faculty, Teacher |
| Boshqa | 3 (Bosh, Asosiy, Bog'lanish) | Item |

**Chiqish JSON formati** (vizual quruvchiga tayyor):

```json
{
  "title": "...", "category": "...", "platform": "web", "summary": "...",
  "pages": [{ "id": "p1", "name": "...", "route": "/", "purpose": "...",
              "rows": [{ "id": "r1", "type": "window",
                          "blocks": [{ "id": "b1", "component": "Hero", "props": {} }] }] }],
  "dataModels": [{ "name": "Dish", "fields": [{ "name": "id", "type": "number" }] }],
  "features": ["..."]
}
```

**Testlar:** 66 → **78** ✅

---

## 10. P1 — Ma'lumot modeli va 1+1 qoidasi (joriy ish)

**Yangi jadvallar:**
```sql
projects            (id, user_id, title, category, brief, platform, status, ai_spec, layout, ...)
generation_attempts (id, project_id, attempt_no, model, duration_ms, status, error, ...)
```

**`users` ga qo'shiladigan ustunlar:** `role` (user/superadmin), `plan` (free/pro), `created_at`

**Yangi fayllar:**
- `lib/entitlements.ts` — 1+1 qoidalari (server tomonda tekshiriladi)
- `lib/project-store.ts` — loyihalar CRUD + statistika
- `app/api/projects/route.ts` — ro'yxat + yaratish (1+1 gate bilan)
- `app/api/projects/[id]/route.ts` — o'qish / yangilash / faollashtirish
- `app/api/admin/stats/route.ts` — super admin statistikasi

**Qabul mezoni:**
- Bitta FREE foydalanuvchi **faqat 1 ta** loyiha yarata oladi
- Ikkinchi loyiha yaratishga urinish → **403** + aniq xabar
- FREE loyihani faollashtirishga urinish → **403**
- PRO foydalanuvchi cheksiz yarata oladi va faollashtira oladi
- Super admin barcha loyihalarni va urinishlarni ko'radi
