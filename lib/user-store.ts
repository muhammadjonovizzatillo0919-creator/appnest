import { getDb, nowIso, type Db } from "./db";
import { hashPassword } from "./auth";

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
  createdAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface UserStore {
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  create(input: { name: string; email: string; password: string }): Promise<PublicUser>;
  count(): Promise<number>;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

const toStored = (row: UserRow): StoredUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  createdAt: row.created_at,
});

export function createUserStore(db: Db): UserStore {
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

      const user: StoredUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalized,
        passwordHash: hashPassword(password),
        createdAt: nowIso(),
      };

      await db.run(
        "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
        [user.id, user.name, user.email, user.passwordHash, user.createdAt]
      );

      return { id: user.id, name: user.name, email: user.email };
    },

    async count() {
      const row = await db.get<{ count: number }>(
        "SELECT COUNT(*) AS count FROM users"
      );
      return Number(row?.count ?? 0);
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
  async count() {
    return (await getStore()).count();
  },
};
