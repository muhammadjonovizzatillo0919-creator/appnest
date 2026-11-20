/**
 * Rol qoidalari — barcha store'lar (SQL va JSON) uchun umumiy.
 *
 * 1. `SUPERADMIN_EMAILS` ro'yxatidagi email → superadmin
 * 2. Omborada foydalanuvchi yo'q bo'lsa (birinchi ro'yxatdan o'tish) → superadmin
 * 3. Aks holda → oddiy foydalanuvchi
 */

export type UserRole = "user" | "superadmin";

const normalize = (email: string) => email.trim().toLowerCase();

/**
 * Doimiy superadmin emaillari.
 * Vercel env o'rnatilmasa ham bu akkaunt superadmin bo'lib qoladi.
 */
const ALWAYS_SUPERADMIN_EMAILS = [
  "muhammadjonovizzatillo0919@gmail.com",
];

/** `SUPERADMIN_EMAILS` ro'yxatidagi emaillar */
export function superadminEmails(): string[] {
  const raw = process.env.SUPERADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map(normalize)
    .filter(Boolean);
}

/**
 * Yangi foydalanuvchining roli.
 * @param email      Ro'yxatdan o'tayotgan email
 * @param userCount  Omboradagi mavjud foydalanuvchilar soni
 */
export function roleForNewUser(email: string, userCount: number): UserRole {
  const normalized = normalize(email);
  if (ALWAYS_SUPERADMIN_EMAILS.includes(normalized)) return "superadmin";
  if (superadminEmails().includes(normalized)) return "superadmin";
  if (userCount === 0) return "superadmin";
  return "user";
}
