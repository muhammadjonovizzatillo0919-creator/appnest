import { getDb, nowIso } from "./db";
import type { DatabaseSync } from "node:sqlite";

/**
 * Mijozlar saqlanishi вЂ” SQLite.
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
  id: row.id,
  name: row.name,
  email: row.email,
  status: row.status === "Arxiv" ? "Arxiv" : "Faol",
  note: row.note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

function logActivity(db: DatabaseSync, clientId: number | null, action: string) {
  db.prepare("INSERT INTO activity (client_id, action, created_at) VALUES (?, ?, ?)")
    .run(clientId, action, nowIso());
}

/**
 * Mijozlar ombori вЂ” berilgan bazaga bog'langan.
 * (Test uchun xotiradagi baza bilan yaratiladi.)
 */
export function createClientStore(db: DatabaseSync): ClientStore {
  const store: ClientStore = {
    async list({ search, status } = {}) {
      const clauses: string[] = [];
      const params: (string | number)[] = [];

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
      const rows = db
        .prepare(`SELECT * FROM clients ${where} ORDER BY created_at DESC`)
        .all(...params) as unknown as ClientRow[];

      return rows.map(toClient);
    },

    async get(id) {
      const row = db
        .prepare("SELECT * FROM clients WHERE id = ?")
        .get(id) as unknown as ClientRow | undefined;
      return row ? toClient(row) : null;
    },

    async create({ name, email, note }) {
      const now = nowIso();

      const result = db
        .prepare(
          "INSERT INTO clients (name, email, status, note, created_at, updated_at) VALUES (?, ?, 'Faol', ?, ?, ?)"
        )
        .run(name.trim(), email.trim().toLowerCase(), note ?? null, now, now);

      const id = Number(result.lastInsertRowid);
      logActivity(db, id, "create");

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

      db.prepare(
        "UPDATE clients SET name = ?, email = ?, status = ?, note = ?, updated_at = ? WHERE id = ?"
      ).run(next.name, next.email, next.status, next.note, nowIso(), id);

      logActivity(db, id, "update");
      return store.get(id);
    },

    async remove(id) {
      const existing = await store.get(id);
      if (!existing) return false;

      db.prepare("DELETE FROM clients WHERE id = ?").run(id);
      logActivity(db, id, "delete");
      return true;
    },

    async stats() {
      const counts = db
        .prepare(
          `SELECT
             COUNT(*) AS total,
             SUM(CASE WHEN status = 'Faol' THEN 1 ELSE 0 END) AS active,
             SUM(CASE WHEN status = 'Arxiv' THEN 1 ELSE 0 END) AS archived
           FROM clients`
        )
        .get() as { total: number; active: number | null; archived: number | null };

      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const activity = db
        .prepare("SELECT COUNT(*) AS count FROM activity WHERE created_at >= ?")
        .get(since) as { count: number };

      return {
        total: counts.total,
        active: counts.active ?? 0,
        archived: counts.archived ?? 0,
        recentActivity: activity.count,
      };
    },
  };

  return store;
}

export const clientStore: ClientStore = createClientStore(getDb());

