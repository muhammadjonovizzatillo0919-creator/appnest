# Production'ga chiqarish — qadamlar

AppNest'ni Vercel'da **jamoqqa ochiq** qilish uchun 3 ta qadam. Umumiy vaqt: **10 daqiqa**.

---

## 1-qadam · Vercel API tokenini oling

1. [vercel.com/account-settings/tokens](https://vercel.com/account-settings/tokens) → **Create Token**
2. Nom bering: `appnest-setup` · **Scope: Full Account** · **Expiration: 30 days**
3. Tokenni **darhol nusxalang** — u ko'rsatilmaydi.

## 2-qadam · Gemini API kalitini oling

1. [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → **Create API key**
2. Nom bering: `AppNest` → **Create**
3. Kalitni nusxalang (`AIza...` bilan boshlanadi)

> Gemini bepul kvota bilan ishlaydi. Bu kalitsiz ham tizim ishlaydi — AI o'rniga
> shablon asosidagi spec yaratiladi (xato chiqmaydi, lekin tahlil sodda bo'ladi).

## 3-qadam · Token va kalitlar bilan skriptni ishga tushiring

PowerShell:

```powershell
cd C:\Users\user\Desktop\appnest

# 1) Vercel token
$env:VERCEL_TOKEN = "vercel_xxxxxxxxxxxxxxxxxxxx"

# 2) .env faylidagi kalitlarni o'zgaruvchiga aylantiramiz
$env:AUTH_SECRET       = (Select-String -Path .env -Pattern '^AUTH_SECRET=(.*)$').Matches[0].Groups[1].Value
$env:SUPERADMIN_EMAILS = (Select-String -Path .env -Pattern '^SUPERADMIN_EMAILS=(.*)$').Matches[0].Groups[1].Value

# 3) Gemini kaliti (2-qadamda olganingiz)
$env:GEMINI_API_KEY = "AIza..."

# 4) Turso (ixtiyoriy, lekin production uchun kerak)
$env:TURSO_DATABASE_URL = "libsql://..."
$env:TURSO_AUTH_TOKEN   = "..."

# 5) Ishga tushiramiz
node scripts/setup-vercel.mjs
```

**Skript nima qiladi:**
- **Deployment Protection'ni o'chiradi** — sayt tashqaridan ochiq bo'ladi ("Login - Vercel" yo'qoladi)
- `AUTH_SECRET`, `SUPERADMIN_EMAILS`, `GEMINI_API_KEY`, `TURSO_*` ni Vercel Environment Variables'ga qo'shadi

Tayyor bo'lganda chiqadi:
```
✅ Sayt endi tashqaridan ochiq (Login - Vercel yo'qoladi)
   ♻️  AUTH_SECRET yangilandi
   ➕ SUPERADMIN_EMAILS qo'shildi
   ➕ GEMINI_API_KEY qo'shildi
```

## 4-qadam · Deploy

```powershell
git push origin main
```

Vercel avtomatik deploy qiladi (~2 daqiqa).

## 5-qadam · Birinchi administrator

Deploy tugagach `https://appnest-mir07.vercel.app/register` oching va
**`admin@appnest.uz`** bilan ro'yxatdan o'ting — bu foydalanuvchi avtomatik
superadmin bo'ladi (bootstrap qoidasi).

Keyin `https://appnest-mir07.vercel.app/admin` — statistika, loyiha tarihi va
tarif boshqaruvi ochiladi.

---

## Qo'shimcha: mavjud foydalanuvchini admin qilish

Agar foydalanuvchi **allaqachon** ro'yxatdan o'tgan bo'lsa va uni admin qilish kerak:

```powershell
node scripts/make-superadmin.mjs admin@appnest.uz
```

Skript lokal SQLite va Turso'da ishlaydi (Turso uchun `.env` dagi kalitlar kerak).

> Yangi o'rnatilgan tizimda **birinchi ro'yxatdan o'tgan foydalanuvchi avtomatik superadmin bo'ladi** —
> shuning uchun odatda skript kerak bo'lmaydi.

---

## Tekshirish ro'yxati

Deploy'dan keyin:

- [ ] `https://appnest-mir07.vercel.app` — "Login - Vercel" **yo'q**, marketing landing ochiladi
- [ ] `/register` — ro'yxatdan o'tish
- [ ] `/login` — kirish
- [ ] `/projects` — "Mening ilovamim" + namuna loyihalar
- [ ] `/admin` — superadmin statistikasi (faqat admin roli bilan)

## Muammolar

| Nima | Yechim |
|---|---|
| "Login - Vercel" chiqmoqda | Deployment Protection hali o'chmagan — 2-qadamni takrorlang |
| Sessiya har kunda uchib ketadi | `AUTH_SECRET` qo'yilmagan yoki noto'g'ri |
| AI javob bermayapti | `GEMINI_API_KEY` qo'yilmagan — AI o'rniga shablon ishlaydi (xato bo'lmaydi) |
| Ma'lumotlar saqlanmayapti | `TURSO_DATABASE_URL` kerak (Vercel'da fayl tizimi faqat o'qiladigan) |
