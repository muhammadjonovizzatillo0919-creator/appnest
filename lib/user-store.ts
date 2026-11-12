import { promises as fs } from "node:fs";
import path from "node:path";
import { hashPassword } from "./auth";

/**
 * Foydalanuvchilar saqlanishi.
 *
 * ⚠️ Development uchun JSON fayl (`.data/users.json`).
 * Production'da Vercel'ning fayl tizimi faqat o'qiladigan — shuning uchun
 * `UserStore` interfeysi orqali DB ga almashtirish mumkin:
 * yangi `lib/user-store.ts` yozib, shu interfeysni bajarish kifoya.
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

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export interface UserStore {
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  create(input: { name: string; email: string; password: string }): Promise<PublicUser>;
  count(): Promise<number>;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

async function readAll(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(users: StoredUser[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${USERS_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(users, null, 2), "utf8");
  await fs.rename(tmp, USERS_FILE);
}

export const fileUserStore: UserStore = {
  async findByEmail(email) {
    const users = await readAll();
    const target = normalizeEmail(email);
    return users.find((u) => normalizeEmail(u.email) === target) ?? null;
  },

  async findById(id) {
    const users = await readAll();
    return users.find((u) => u.id === id) ?? null;
  },

  async create({ name, email, password }) {
    const users = await readAll();
    const normalized = normalizeEmail(email);

    if (users.some((u) => normalizeEmail(u.email) === normalized)) {
      throw new Error("EMAIL_TAKEN");
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalized,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await writeAll([...users, user]);
    return { id: user.id, name: user.name, email: user.email };
  },

  async count() {
    return (await readAll()).length;
  },
};

export const userStore: UserStore = fileUserStore;
