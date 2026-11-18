import { getDb, nowIso, type Db } from "./db";
import { createJsonStores } from "./json-stores";

/**
 * Loyihalar saqlanishi — AI no-code builder uchun.
 *
 * `ai_spec` — AI generatsiya natijasi (JSON)
 * `layout`  — foydalanuvchi vizual quruvchida tahrirlagan tuzilma (JSON)
 */

export type ProjectPlatform = "web" | "mobile";
export type ProjectStatus = "draft" | "active" | "archived";

export interface Project {
  id: string;
  userId: string;
  title: string;
  category: string;
  brief: string | null;
  platform: ProjectPlatform;
  status: ProjectStatus;
  aiSpec: string | null;
  layout: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationAttempt {
  id: number;
  projectId: string;
  attemptNo: number;
  model: string | null;
  durationMs: number | null;
  status: "ok" | "error";
  error: string | null;
  createdAt: string;
}

export interface ProjectStore {
  listByUser(userId: string): Promise<Project[]>;
  listAll(): Promise<Project[]>;
  get(id: string): Promise<Project | null>;
  countByUser(userId: string): Promise<number>;
  create(input: {
    userId: string;
    title: string;
    category: string;
    brief?: string;
    platform?: ProjectPlatform;
  }): Promise<Project>;
  update(
    id: string,
    input: {
      title?: string;
      category?: string;
      brief?: string;
      platform?: ProjectPlatform;
      status?: ProjectStatus;
      aiSpec?: string | null;
      layout?: string | null;
    }
  ): Promise<Project | null>;
  remove(id: string): Promise<boolean>;
  logAttempt(input: {
    projectId: string;
    attemptNo: number;
    model?: string;
    durationMs?: number;
    status?: "ok" | "error";
    error?: string;
  }): Promise<GenerationAttempt>;
  attempts(projectId: string): Promise<GenerationAttempt[]>;
  adminStats(): Promise<{
    users: { total: number; free: number; pro: number; superadmins: number };
    projects: { total: number; draft: number; active: number };
    categories: { category: string; count: number }[];
    attempts: { total: number; failed: number; avgDurationMs: number };
  }>;
}

interface ProjectRow {
  id: string;
  user_id: string;
  title: string;
  category: string;
  brief: string | null;
  platform: string;
  status: string;
  ai_spec: string | null;
  layout: string | null;
  created_at: string;
  updated_at: string;
}

interface AttemptRow {
  id: number;
  project_id: string;
  attempt_no: number;
  model: string | null;
  duration_ms: number | null;
  status: string;
  error: string | null;
  created_at: string;
}

const toProject = (row: ProjectRow): Project => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  category: row.category,
  brief: row.brief,
  platform: row.platform === "mobile" ? "mobile" : "web",
  status: (row.status as ProjectStatus) ?? "draft",
  aiSpec: row.ai_spec,
  layout: row.layout,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toAttempt = (row: AttemptRow): GenerationAttempt => ({
  id: Number(row.id),
  projectId: row.project_id,
  attemptNo: Number(row.attempt_no),
  model: row.model,
  durationMs: row.duration_ms === null ? null : Number(row.duration_ms),
  status: row.status === "error" ? "error" : "ok",
  error: row.error,
  createdAt: row.created_at,
});

export function createProjectStore(db: Db): ProjectStore {
  const store: ProjectStore = {
    async listByUser(userId) {
      const rows = await db.all<ProjectRow>(
        "SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
      );
      return rows.map(toProject);
    },

    async listAll() {
      const rows = await db.all<ProjectRow>(
        "SELECT * FROM projects ORDER BY created_at DESC"
      );
      return rows.map(toProject);
    },

    async get(id) {
      const row = await db.get<ProjectRow>("SELECT * FROM projects WHERE id = ?", [
        id,
      ]);
      return row ? toProject(row) : null;
    },

    async countByUser(userId) {
      const row = await db.get<{ count: number }>(
        "SELECT COUNT(*) AS count FROM projects WHERE user_id = ?",
        [userId]
      );
      return Number(row?.count ?? 0);
    },

    async create({ userId, title, category, brief, platform = "web" }) {
      const now = nowIso();
      const id = crypto.randomUUID();

      await db.run(
        `INSERT INTO projects
           (id, user_id, title, category, brief, platform, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
        [id, userId, title.trim(), category.trim(), brief ?? null, platform, now, now]
      );

      const created = await store.get(id);
      if (!created) throw new Error("PROJECT_CREATE_FAILED");
      return created;
    },

    async update(id, input) {
      const existing = await store.get(id);
      if (!existing) return null;

      const next = {
        title: input.title?.trim() ?? existing.title,
        category: input.category?.trim() ?? existing.category,
        brief: input.brief !== undefined ? input.brief : existing.brief,
        platform: input.platform ?? existing.platform,
        status: input.status ?? existing.status,
        aiSpec: input.aiSpec !== undefined ? input.aiSpec : existing.aiSpec,
        layout: input.layout !== undefined ? input.layout : existing.layout,
      };

      await db.run(
        `UPDATE projects
           SET title = ?, category = ?, brief = ?, platform = ?, status = ?,
               ai_spec = ?, layout = ?, updated_at = ?
         WHERE id = ?`,
        [
          next.title,
          next.category,
          next.brief,
          next.platform,
          next.status,
          next.aiSpec,
          next.layout,
          nowIso(),
          id,
        ]
      );

      return store.get(id);
    },

    async remove(id) {
      const existing = await store.get(id);
      if (!existing) return false;

      await db.run("DELETE FROM generation_attempts WHERE project_id = ?", [id]);
      await db.run("DELETE FROM projects WHERE id = ?", [id]);
      return true;
    },

    async logAttempt({
      projectId,
      attemptNo,
      model,
      durationMs,
      status = "ok",
      error,
    }) {
      const now = nowIso();

      const result = await db.run(
        `INSERT INTO generation_attempts
           (project_id, attempt_no, model, duration_ms, status, error, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          attemptNo,
          model ?? null,
          durationMs ?? null,
          status,
          error ?? null,
          now,
        ]
      );

      return {
        id: Number(result.lastInsertRowid),
        projectId,
        attemptNo,
        model: model ?? null,
        durationMs: durationMs ?? null,
        status,
        error: error ?? null,
        createdAt: now,
      };
    },

    async attempts(projectId) {
      const rows = await db.all<AttemptRow>(
        "SELECT * FROM generation_attempts WHERE project_id = ? ORDER BY attempt_no",
        [projectId]
      );
      return rows.map(toAttempt);
    },

    async adminStats() {
      const userRows = await db.get<{
        total: number;
        free: number;
        pro: number;
        superadmins: number;
      }>(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN plan = 'free' THEN 1 ELSE 0 END) AS free,
           SUM(CASE WHEN plan = 'pro' THEN 1 ELSE 0 END) AS pro,
           SUM(CASE WHEN role = 'superadmin' THEN 1 ELSE 0 END) AS superadmins
         FROM users`
      );

      const projectRows = await db.get<{
        total: number;
        draft: number;
        active: number;
      }>(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft,
           SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active
         FROM projects`
      );

      const categoryRows = await db.all<{ category: string; count: number }>(
        "SELECT category, COUNT(*) AS count FROM projects GROUP BY category ORDER BY count DESC"
      );

      const attemptRows = await db.get<{
        total: number;
        failed: number;
        avgDurationMs: number | null;
      }>(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS failed,
           AVG(duration_ms) AS avgDurationMs
         FROM generation_attempts`
      );

      return {
        users: {
          total: Number(userRows?.total ?? 0),
          free: Number(userRows?.free ?? 0),
          pro: Number(userRows?.pro ?? 0),
          superadmins: Number(userRows?.superadmins ?? 0),
        },
        projects: {
          total: Number(projectRows?.total ?? 0),
          draft: Number(projectRows?.draft ?? 0),
          active: Number(projectRows?.active ?? 0),
        },
        categories: categoryRows.map((r) => ({
          category: r.category,
          count: Number(r.count),
        })),
        attempts: {
          total: Number(attemptRows?.total ?? 0),
          failed: Number(attemptRows?.failed ?? 0),
          avgDurationMs: Math.round(Number(attemptRows?.avgDurationMs ?? 0)),
        },
      };
    },
  };

  return store;
}

let storePromise: Promise<ProjectStore> | null = null;

function getStore(): Promise<ProjectStore> {
  if (!storePromise) {
    storePromise = getDb().then((db) => createProjectStore(db));
  }
  return storePromise;
}

const sqlProjectStore: ProjectStore = {
  async listByUser(userId) {
    return (await getStore()).listByUser(userId);
  },
  async listAll() {
    return (await getStore()).listAll();
  },
  async get(id) {
    return (await getStore()).get(id);
  },
  async countByUser(userId) {
    return (await getStore()).countByUser(userId);
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
  async logAttempt(input) {
    return (await getStore()).logAttempt(input);
  },
  async attempts(projectId) {
    return (await getStore()).attempts(projectId);
  },
  async adminStats() {
    return (await getStore()).adminStats();
  },
};

/**
 * Qaysi ombor ishlatiladi:
 * 1. `GITHUB_TOKEN` + `GITHUB_REPO` → GitHub omborasi (serverless'ga mos)
 * 2. Aks holda → SQL (Turso yoki lokal SQLite)
 */
const jsonStores = createJsonStores();

export const projectStore: ProjectStore = jsonStores?.projects ?? sqlProjectStore;
