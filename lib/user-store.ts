import { getDb, nowIso, type Db } from "./db";
import { hashPassword } from "./auth";
import { ensureEnvLoaded } from "./env";
import type { Plan, UserRole } from "./entitlements";

/**
 * Foydalanuvchilar saqlanishi.
 *
 * `UserStore` interfeysi saqlanadi: kelajakda boshqa DB bilan
 * almashtirish uchun faqat shu interfeysni bajarish yetarli.
 */

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  plan: Plan;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: Plan;
}

export interface UserStore {
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  create(input: { name: string; email: string; password: string }): Promise<PublicUser>;
  updateProfile(id: string, input: { name?: string; email?: string }): Promise<PublicUser | null>;
  setPlan(id: string, plan: Plan): Promise<PublicUser | null>;
  setRole(id: string, role: UserRole): Promise<PublicUser | null>;
  count(): Promise<number>;
  countByPlan(plan: Plan): Promise<number>;
  /** Barcha foydalanuvchilar (admin paneli uchun) */
  listAll(): Promise<PublicUser[]>;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Avtomatik superadmin.
 *
 * `SUPERADMIN_EMAILS` muhit o'zgaruvchisida ko'rsatilgan email bilan
 * ro'yxatdan o'tgan foydalanuvchi darhol superadmin bo'ladi.
 *
 * Bu production'da DB'ga to'g'ridan-to'g'ri kirishsiz admin yaratishning
 * xavfsiz yo'li — foydalanuvchi ro'yxatdan o'tkanda roli server tomonda
 * belgilanadi.
 *
 * Misol: SUPERADMIN_EMAILS=admin@appnest.uz,boss@appnest.uz
 */
function superadminEmails(): string[] {
  ensureEnvLoaded();
  const raw = process.env.SUPERADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => normalizeEmail(e))
    .filter(Boolean);
}

/**
 * Yangi foydalanuvchining roli.
 *
 * 1. `SUPERADMIN_EMAILS` ro'yxatidagi email → superadmin
 * 2. Butun bazada foydalanuvchi yo'q bo'lsa (birinchi ro'yxatdan o'tish) → superadmin
 * 3. Aks holda → oddiy foydalanuvchi
 *
 * 2-band bootstrap uchun: yangi o'rnatilgan tizimda birinchi foydalanuvchi
 * administrator bo'lishi kerak — aks holda admin panelga hech kim kirolmaydi.
 */
interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string | null;
  plan: string | null;
  created_at: string | null;
}

const toStored = (row: UserRow): StoredUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role === "superadmin" ? "superadmin" : "user",
  plan: row.plan === "pro" ? "pro" : "free",
  createdAt: row.created_at ?? "",
});

const toPublic = (row: UserRow): PublicUser => {
  const stored = toStored(row);
  return {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    role: stored.role,
    plan: stored.plan,
  };
};

export function createUserStore(db: Db): UserStore {
  /**
   * Yangi foydalanuvchining roli:
   * 1. `SUPERADMIN_EMAILS` ro'yxatidagi email → superadmin
   * 2. Bazada foydalanuvchi yo'q bo'lsa (birinchi ro'yxatdan o'tish) → superadmin
   * 3. Aks holda → oddiy foydalanuvchi
   */
  const roleForEmail = async (email: string): Promise<UserRole> => {
    if (superadminEmails().includes(normalizeEmail(email))) {
      return "superadmin";
    }

    const row = await db.get<{ count: number }>(
      "SELECT COUNT(*) AS count FROM users"
    );
    return Number(row?.count ?? 0) === 0 ? "superadmin" : "user";
  };

  return {
    async findByEmail(email) {
      const row = await db.get<UserRow>(
        "SELECT * FROM users WHERE email = ?",
        [normalizeEmail(email)]
      );
      return row ? toStored(row) : null;
    },

    async findById(id) {
      const row = await db.get<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
      return row ? toStored(row) : null;
    },

    async create({ name, email, password }) {
      const normalized = normalizeEmail(email);

      const existing = await db.get<{ id: string }>(
        "SELECT id FROM users WHERE email = ?",
        [normalized]
      );
      if (existing) throw new Error("EMAIL_TAKEN");

      const role = await roleForEmail(normalized);

      const user: StoredUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalized,
        passwordHash: hashPassword(password),
        role,
        plan: "free",
        createdAt: nowIso(),
      };

      await db.run(
        `INSERT INTO users (id, name, email, password_hash, role, plan, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.name,
          user.email,
          user.passwordHash,
          user.role,
          user.plan,
          user.createdAt,
        ]
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      };
    },

    async updateProfile(id, { name, email }) {
      const existing = await db.get<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
      if (!existing) return null;

      const nextName = name?.trim() ?? existing.name;
      const nextEmail = email ? normalizeEmail(email) : existing.email;

      await db.run("UPDATE users SET name = ?, email = ? WHERE id = ?", [
        nextName,
        nextEmail,
        id,
      ]);

      const updated = await db.get<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
      return updated ? toPublic(updated) : null;
    },

    async setPlan(id, plan) {
      await db.run("UPDATE users SET plan = ? WHERE id = ?", [plan, id]);
      const updated = await db.get<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
      return updated ? toPublic(updated) : null;
    },

    async setRole(id, role) {
      await db.run("UPDATE users SET role = ? WHERE id = ?", [role, id]);
      const updated = await db.get<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
      return updated ? toPublic(updated) : null;
    },

    async count() {
      const row = await db.get<{ count: number }>(
        "SELECT COUNT(*) AS count FROM users"
      );
      return Number(row?.count ?? 0);
    },

    async countByPlan(plan) {
      const row = await db.get<{ count: number }>(
        "SELECT COUNT(*) AS count FROM users WHERE plan = ?",
        [plan]
      );
      return Number(row?.count ?? 0);
    },

    async listAll() {
      const rows = await db.all<UserRow>(
        "SELECT * FROM users ORDER BY created_at DESC, name ASC"
      );
      return rows.map(toPublic);
    },
  };
}

let storePromise: Promise<UserStore> | null = null;

function getStore(): Promise<UserStore> {
  if (!storePromise) {
    storePromise = getDb().then((db) => createUserStore(db));
  }
  return storePromise;
}

export const userStore: UserStore = {
  async findByEmail(email) {
    return (await getStore()).findByEmail(email);
  },
  async findById(id) {
    return (await getStore()).findById(id);
  },
  async create(input) {
    return (await getStore()).create(input);
  },
  async updateProfile(id, input) {
    return (await getStore()).updateProfile(id, input);
  },
  async setPlan(id, plan) {
    return (await getStore()).setPlan(id, plan);
  },
  async setRole(id, role) {
    return (await getStore()).setRole(id, role);
  },
  async count() {
    return (await getStore()).count();
  },
  async countByPlan(plan) {
    return (await getStore()).countByPlan(plan);
  },
  async listAll() {
    return (await getStore()).listAll();
  },
};
