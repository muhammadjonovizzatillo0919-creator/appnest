import { getDb, nowIso } from "./db";
import { hashPassword } from "./auth";

/**
 * Foydalanuvchilar saqlanishi вЂ” SQLite.
 *
 * `UserStore` interfeysi saqlanadi: kelajakda Postgres/Turso bilan
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

export const sqliteUserStore: UserStore = {
  async findByEmail(email) {
    const row = getDb()
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(normalizeEmail(email)) as UserRow | undefined;
    return row ? toStored(row) : null;
  },

  async findById(id) {
    const row = getDb()
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as unknown as UserRow | undefined;
    return row ? toStored(row) : null;
  },

  async create({ name, email, password }) {
    const normalized = normalizeEmail(email);

    const existing = getDb()
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(normalized);
    if (existing) throw new Error("EMAIL_TAKEN");

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalized,
      passwordHash: hashPassword(password),
      createdAt: nowIso(),
    };

    getDb()
      .prepare(
        "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .run(user.id, user.name, user.email, user.passwordHash, user.createdAt);

    return { id: user.id, name: user.name, email: user.email };
  },

  async count() {
    const row = getDb()
      .prepare("SELECT COUNT(*) AS count FROM users")
      .get() as unknown as { count: number };
    return row.count;
  },
};

export const userStore: UserStore = sqliteUserStore;

