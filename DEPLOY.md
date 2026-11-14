# Production'ga chiqarish — qadamlar

AppNest'ni Vercel'da **jamoqqa ochiq** qilish uchun 3 ta qadam. Umumiy vaqt: **10 daqiqa**.

---

## 1-qadam · Vercel API tokenini oling

1. [vercel.com/account-settings/tokens](https://vercel.com/account-settings/tokens) → **Create Token**
2. Nom bering: `appnest-setup` · **Scope: Full Account** · **Expiration: 30 days**
3. Tokenni **darhol nusxalang** — u ko'rsatilmaydi.

## 2-qadam · Token bilan skriptni ishga tushiring

PowerShell:

```powershell
cd C:\Users\user\Desktop\appnest

$env:VERCEL_TOKEN = "vercel_xxxxxxxxxxxxxxxxxxxx"

# .env faylidagi kalitlarni ham o'zgaruvchiga aylantiramiz
$env:AUTH_SECRET        = (Get-Content .env | Select-String "^AUTH_SECRET=").ToString().Split("=")[1]
$env:SUPERADMIN_EMAILS  = (Get-Content .env | Select-String "^SUPERADMIN_EMAILS=").ToString().Split("=")[1]
$env:GEMINI_API_KEY     = "AIza..."      # aistudio.google.com/apikey dan
$env:TURSO_DATABASE_URL = "libsql://..." # turso.tech dan (ixtiyoriy)
$env:TURSO_AUTH_TOKEN   = "..."

node scripts/setup-vercel.mjs
```

**Skript nima qiladi:**
- **Deployment Protection'ni o'chiradi** — sayt tashqaridan ochiq bo'ladi ("Login - Vercel" yo'qoladi)
- `AUTH_SECRET`, `SUPERADMIN_EMAILS`, `GEMINI_API_KEY`, `TURSO_*` ni Vercel Environment Variables'ga qo'shadi

Tayyor bo'lganda chiqadi:
```
✅ Sayt endi tashqaridan ochiq (Login - Vercel yo'qoladi)
   ➕ AUTH_SECRET qo'shildi
   ➕ SUPERADMIN_EMAILS qo'shildi
```

## 3-qadam · Deploy

```powershell
git push origin main
```

Vercel avtomatik deploy qiladi (~2 daqiqa).

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
