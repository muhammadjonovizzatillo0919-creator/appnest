import { getDb, nowIso, type Db } from "./db";

/**
 * Mijozlar saqlanishi.
 *
 * Bitta kod — ikkala muhit:
 * - lokal: node:sqlite (`.data/appnest.db`)
 * - production: Turso / libSQL
 */

export type ClientStatus = "Faol" | "Arxiv";

export interface Client {
  id: number;
  name: string;
  email: string;
  status: ClientStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientStore {
  list(options?: { search?: string; status?: ClientStatus }): Promise<Client[]>;
  get(id: number): Promise<Client | null>;
  create(input: { name: string; email: string; note?: string }): Promise<Client>;
  update(
    id: number,
    input: { name?: string; email?: string; status?: ClientStatus; note?: string }
  ): Promise<Client | null>;
  remove(id: number): Promise<boolean>;
  stats(): Promise<{
    total: number;
    active: number;
    archived: number;
    recentActivity: number;
  }>;
}

interface ClientRow {
  id: number;
  name: string;
  email: string;
  status: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

const toClient = (row: ClientRow): Client => ({
  id: Number(row.id),
  name: row.name,
  email: row.email,
  status: row.status === "Arxiv" ? "Arxiv" : "Faol",
  note: row.note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Mijozlar ombori — berilgan bazaga bog'langan.
 * (Test uchun xotiradagi baza bilan yaratiladi.)
 */
export function createClientStore(db: Db): ClientStore {
  const logActivity = async (clientId: number | null, action: string) => {
    await db.run(
      "INSERT INTO activity (client_id, action, created_at) VALUES (?, ?, ?)",
      [clientId, action, nowIso()]
    );
  };

  const store: ClientStore = {
    async list({ search, status } = {}) {
      const clauses: string[] = [];
      const params: unknown[] = [];

      if (search?.trim()) {
        clauses.push("(name LIKE ? OR email LIKE ?)");
        const like = `%${search.trim()}%`;
        params.push(like, like);
      }
      if (status) {
        clauses.push("status = ?");
        params.push(status);
      }

      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
      const rows = await db.all<ClientRow>(
        `SELECT * FROM clients ${where} ORDER BY created_at DESC`,
        params
      );

      return rows.map(toClient);
    },

    async get(id) {
      const row = await db.get<ClientRow>("SELECT * FROM clients WHERE id = ?", [
        id,
      ]);
      return row ? toClient(row) : null;
    },

    async create({ name, email, note }) {
      const now = nowIso();

      const result = await db.run(
        "INSERT INTO clients (name, email, status, note, created_at, updated_at) VALUES (?, ?, 'Faol', ?, ?, ?)",
        [name.trim(), email.trim().toLowerCase(), note ?? null, now, now]
      );

      const id = Number(result.lastInsertRowid);
      await logActivity(id, "create");

      const created = await store.get(id);
      if (!created) throw new Error("CLIENT_CREATE_FAILED");
      return created;
    },

    async update(id, input) {
      const existing = await store.get(id);
      if (!existing) return null;

      const next = {
        name: input.name?.trim() ?? existing.name,
        email: input.email?.trim().toLowerCase() ?? existing.email,
        status: input.status ?? existing.status,
        note: input.note !== undefined ? input.note : existing.note,
      };

      await db.run(
        "UPDATE clients SET name = ?, email = ?, status = ?, note = ?, updated_at = ? WHERE id = ?",
        [next.name, next.email, next.status, next.note, nowIso(), id]
      );

      await logActivity(id, "update");
      return store.get(id);
    },

    async remove(id) {
      const existing = await store.get(id);
      if (!existing) return false;

      await db.run("DELETE FROM clients WHERE id = ?", [id]);
      await logActivity(id, "delete");
      return true;
    },

    async stats() {
      const counts = await db.get<{
        total: number;
        active: number | null;
        archived: number | null;
      }>(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'Faol' THEN 1 ELSE 0 END) AS active,
           SUM(CASE WHEN status = 'Arxiv' THEN 1 ELSE 0 END) AS archived
         FROM clients`
      );

      const since = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const activity = await db.get<{ count: number }>(
        "SELECT COUNT(*) AS count FROM activity WHERE created_at >= ?",
        [since]
      );

      return {
        total: Number(counts?.total ?? 0),
        active: Number(counts?.active ?? 0),
        archived: Number(counts?.archived ?? 0),
        recentActivity: Number(activity?.count ?? 0),
      };
    },
  };

  return store;
}

/** Global ombor — joriy bazaga bog'langan */
let storePromise: Promise<ClientStore> | null = null;

function getStore(): Promise<ClientStore> {
  if (!storePromise) {
    storePromise = getDb().then((db) => createClientStore(db));
  }
  return storePromise;
}

export const clientStore: ClientStore = {
  async list(options) {
    return (await getStore()).list(options);
  },
  async get(id) {
    return (await getStore()).get(id);
  },
  async create(input) {
    return (await getStore()).create(input);
  },
  async update(id, input) {
    return (await getStore()).update(id, input);
  },
  async remove(id) {
    return (await getStore()).remove(id);
  },
  async stats() {
    return (await getStore()).stats();
  },
};
