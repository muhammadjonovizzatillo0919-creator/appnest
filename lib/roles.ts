/**
 * Rol qoidalari — barcha store'lar (SQL va JSON) uchun umumiy.
 *
 * 1. `SUPERADMIN_EMAILS` ro'yxatidagi email → superadmin
 * 2. Omborada foydalanuvchi yo'q bo'lsa (birinchi ro'yxatdan o'tish) → superadmin
 * 3. Aks holda → oddiy foydalanuvchi
 */

export type UserRole = "user" | "superadmin";

const normalize = (email: string) => email.trim().toLowerCase();

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
  if (superadminEmails().includes(normalize(email))) return "superadmin";
  if (userCount === 0) return "superadmin";
  return "user";
}
