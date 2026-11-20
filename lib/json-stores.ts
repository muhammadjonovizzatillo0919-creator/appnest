import { GitHubJsonDb, githubStoreConfig } from "./json-db";
import { roleForNewUser } from "./roles";
import type {
  UserStore,
  PublicUser,
} from "./user-store";
import { normalizePaletteValue } from "./palettes";
import type { ClientStore, Client, ClientStatus } from "./client-store";
import type {
  ProjectStore,
  Project,
} from "./project-store";

/**
 * GitHub omborasi asosidagi store'lar.
 *
 * SQL bilan bir xil interfeys — shuning uchun route handler'lar
 * implementatsiyani bilmaydi.
 */

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  plan: string;
  created_at: string;
  accent_color?: string;
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
  palette?: string | null;
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

const nowIso = () => new Date().toISOString();

function getDb(): GitHubJsonDb | null {
  const config = githubStoreConfig();
  if (!config) return null;
  return new GitHubJsonDb(
    config.token,
    config.repo,
    config.branch,
    config.filePath
  );
}

/** GitHub omborasi mavjud bo'lsa — uning store'lari, aks holda null */
export function createJsonStores(): {
  users: UserStore | null;
  clients: ClientStore | null;
  projects: ProjectStore | null;
} | null {
  const db = getDb();
  if (!db) return null;

  /* ── Users ── */
  const users: UserStore = {
    async findByEmail(email) {
      const data = await db.read();
      const target = email.trim().toLowerCase();
      const row = data.users.find(
        (u) => String(u.email).toLowerCase() === target
      ) as UserRow | undefined;
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role === "superadmin" ? "superadmin" : "user",
        plan: row.plan === "pro" ? "pro" : "free",
        createdAt: row.created_at,
        accentColor: row.accent_color || "appnest",
      };
    },

    async findById(id) {
      const data = await db.read();
      const row = data.users.find((u) => u.id === id) as UserRow | undefined;
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role === "superadmin" ? "superadmin" : "user",
        plan: row.plan === "pro" ? "pro" : "free",
        createdAt: row.created_at,
        accentColor: row.accent_color || "appnest",
      };
    },

    async create({ name, email, password }) {
      const passwordHash = hashPasswordLocal(password);
      const normalized = email.trim().toLowerCase();
      let created: PublicUser | null = null;

      await db.update((data) => {
        if (
          data.users.some(
            (u) => String(u.email).toLowerCase() === normalized
          )
        ) {
          throw new Error("EMAIL_TAKEN");
        }

        // Birinchi foydalanuvchi yoki allowlistdagi email → superadmin
        const role = roleForNewUser(normalized, data.users.length);
        const user = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: normalized,
          password_hash: passwordHash,
          role,
          plan: "free",
          created_at: nowIso(),
          accent_color: "appnest",
        };

        data.users.push(user);
        created = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "user" | "superadmin",
          plan: "free",
          accentColor: "appnest",
        };
      });

      if (!created) throw new Error("USER_CREATE_FAILED");
      return created;
    },

    async updateProfile(id, { name, email, accentColor }) {
      let updated: PublicUser | null = null;

      await db.update((data) => {
        const row = data.users.find((u) => u.id === id) as UserRow | undefined;
        if (!row) return;
        if (name?.trim()) row.name = name.trim();
        if (email?.trim()) row.email = email.trim().toLowerCase();
        const nextAccent = normalizePaletteValue(accentColor);
        if (nextAccent) row.accent_color = nextAccent;
        updated = {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role === "superadmin" ? "superadmin" : "user",
          plan: row.plan === "pro" ? "pro" : "free",
          accentColor: row.accent_color || "appnest",
        };
      });

      return updated;
    },

    async setPlan(id, plan) {
      let updated: PublicUser | null = null;

      await db.update((data) => {
        const row = data.users.find((u) => u.id === id) as UserRow | undefined;
        if (!row) return;
        row.plan = plan;
        updated = {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role === "superadmin" ? "superadmin" : "user",
          plan,
          accentColor: row.accent_color || "appnest",
        };
      });

      return updated;
    },

    async setRole(id, role) {
      let updated: PublicUser | null = null;

      await db.update((data) => {
        const row = data.users.find((u) => u.id === id) as UserRow | undefined;
        if (!row) return;
        row.role = role;
        updated = {
          id: row.id,
          name: row.name,
          email: row.email,
          role,
          plan: row.plan === "pro" ? "pro" : "free",
          accentColor: row.accent_color || "appnest",
        };
      });

      return updated;
    },

    async count() {
      const data = await db.read();
      return data.users.length;
    },

    async countByPlan(plan) {
      const data = await db.read();
      return data.users.filter((u) => u.plan === plan).length;
    },

    async listAll() {
      const data = await db.read();
      return (data.users as unknown as UserRow[]).map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role === "superadmin" ? "superadmin" : "user",
        plan: r.plan === "pro" ? "pro" : "free",
        accentColor: r.accent_color || "appnest",
      }));
    },
  };

  /* ── Clients ── */
  const toClient = (row: ClientRow): Client => ({
    id: Number(row.id),
    name: row.name,
    email: row.email,
    status: row.status === "Arxiv" ? "Arxiv" : "Faol",
    note: row.note ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  const clients: ClientStore = {
    async list({ search, status } = {}) {
      const data = await db.read();
      let rows = data.clients as unknown as ClientRow[];

      if (search?.trim()) {
        const like = search.trim().toLowerCase();
        rows = rows.filter(
          (r) =>
            r.name.toLowerCase().includes(like) ||
            r.email.toLowerCase().includes(like)
        );
      }
      if (status) rows = rows.filter((r) => r.status === status);

      return rows.map(toClient);
    },

    async get(id) {
      const data = await db.read();
      const row = data.clients.find((c) => Number(c.id) === id) as
        | ClientRow
        | undefined;
      return row ? toClient(row) : null;
    },

    async create({ name, email, note }) {
      const now = nowIso();
      let id = 0;

      await db.update((data) => {
        id = data.clients.length
          ? Math.max(...data.clients.map((c) => Number(c.id))) + 1
          : 1;
        data.clients.push({
          id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          status: "Faol",
          note: note ?? null,
          created_at: now,
          updated_at: now,
        });
      });

      return {
        id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        status: "Faol" as ClientStatus,
        note: note ?? null,
        createdAt: now,
        updatedAt: now,
      };
    },

    async update(id, input) {
      let result: Client | null = null;

      await db.update((data) => {
        const row = data.clients.find((c) => Number(c.id) === id) as
          | ClientRow
          | undefined;
        if (!row) return;
        if (input.name?.trim()) row.name = input.name.trim();
        if (input.email?.trim()) row.email = input.email.trim().toLowerCase();
        if (input.status) row.status = input.status;
        if (input.note !== undefined) row.note = input.note;
        row.updated_at = nowIso();
        result = toClient(row);
      });

      return result;
    },

    async remove(id) {
      let removed = false;

      await db.update((data) => {
        const before = data.clients.length;
        data.clients = data.clients.filter((c) => Number(c.id) !== id);
        removed = data.clients.length < before;
      });

      return removed;
    },

    async stats() {
      const data = await db.read();
      const rows = data.clients as unknown as ClientRow[];
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      return {
        total: rows.length,
        active: rows.filter((r) => r.status === "Faol").length,
        archived: rows.filter((r) => r.status === "Arxiv").length,
        recentActivity: data.activity.filter(
          (a) => String(a.created_at) >= since
        ).length,
      };
    },
  };

  /* ── Projects ── */
  const toProject = (row: ProjectRow): Project => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    brief: row.brief ?? null,
    platform: row.platform === "mobile" ? "mobile" : "web",
    status: (row.status as Project["status"]) ?? "draft",
    aiSpec: row.ai_spec ?? null,
    layout: row.layout ?? null,
    palette: row.palette ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  const projects: ProjectStore = {
    async listByUser(userId) {
      const data = await db.read();
      return (data.projects as unknown as ProjectRow[])
        .filter((p) => p.user_id === userId)
        .map(toProject);
    },

    async listAll() {
      const data = await db.read();
      return (data.projects as unknown as ProjectRow[]).map(toProject);
    },

    async get(id) {
      const data = await db.read();
      const row = data.projects.find((p) => p.id === id) as
        | ProjectRow
        | undefined;
      return row ? toProject(row) : null;
    },

    async countByUser(userId) {
      const data = await db.read();
      return data.projects.filter((p) => p.user_id === userId).length;
    },

    async create({ userId, title, category, brief, platform = "web", palette }) {
      const now = nowIso();
      const id = crypto.randomUUID();
      const finalPalette = normalizePaletteValue(palette) ?? "appnest";

      await db.update((data) => {
        data.projects.push({
          id,
          user_id: userId,
          title: title.trim(),
          category: category.trim(),
          brief: brief ?? null,
          platform,
          status: "draft",
          ai_spec: null,
          layout: null,
          palette: finalPalette,
          created_at: now,
          updated_at: now,
        });
      });

      return {
        id,
        userId,
        title: title.trim(),
        category: category.trim(),
        brief: brief ?? null,
        platform,
        status: "draft" as const,
        aiSpec: null,
        layout: null,
        palette: finalPalette,
        createdAt: now,
        updatedAt: now,
      };
    },

    async update(id, input) {
      let result: Project | null = null;

      await db.update((data) => {
        const row = data.projects.find((p) => p.id === id) as
          | ProjectRow
          | undefined;
        if (!row) return;
        if (input.title?.trim()) row.title = input.title.trim();
        if (input.category?.trim()) row.category = input.category.trim();
        if (input.brief !== undefined) row.brief = input.brief;
        if (input.platform) row.platform = input.platform;
        if (input.status) row.status = input.status;
        if (input.aiSpec !== undefined) row.ai_spec = input.aiSpec;
        if (input.layout !== undefined) row.layout = input.layout;
        if (input.palette !== undefined) {
          row.palette = normalizePaletteValue(input.palette) ?? "appnest";
        }
        row.updated_at = nowIso();
        result = toProject(row);
      });

      return result;
    },

    async remove(id) {
      let removed = false;

      await db.update((data) => {
        const before = data.projects.length;
        data.projects = data.projects.filter((p) => p.id !== id);
        data.activity = data.activity.filter((a) => a.project_id !== id);
        removed = data.projects.length < before;
      });

      return removed;
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
      let id = 0;

      await db.update((data) => {
        id = data.activity.length
          ? Math.max(...data.activity.map((a) => Number(a.id))) + 1
          : 1;
        data.activity.push({
          id,
          project_id: projectId,
          attempt_no: attemptNo,
          model: model ?? null,
          duration_ms: durationMs ?? null,
          status,
          error: error ?? null,
          created_at: now,
        });
      });

      return {
        id,
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
      const data = await db.read();
      return (data.activity as unknown as AttemptRow[])
        .filter((a) => a.project_id === projectId)
        .map((a) => ({
          id: Number(a.id),
          projectId: a.project_id,
          attemptNo: Number(a.attempt_no),
          model: a.model,
          durationMs: a.duration_ms === null ? null : Number(a.duration_ms),
          status: a.status === "error" ? ("error" as const) : ("ok" as const),
          error: a.error,
          createdAt: a.created_at,
        }));
    },

    async adminStats() {
      const data = await db.read();
      const users = data.users as unknown as UserRow[];
      const projects = data.projects as unknown as ProjectRow[];
      const activity = data.activity as unknown as AttemptRow[];

      const byCategory = new Map<string, number>();
      for (const p of projects) {
        byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + 1);
      }

      const durations = activity
        .map((a) => Number(a.duration_ms ?? 0))
        .filter((d) => d > 0);

      return {
        users: {
          total: users.length,
          free: users.filter((u) => u.plan === "free").length,
          pro: users.filter((u) => u.plan === "pro").length,
          superadmins: users.filter((u) => u.role === "superadmin").length,
        },
        projects: {
          total: projects.length,
          draft: projects.filter((p) => p.status === "draft").length,
          active: projects.filter((p) => p.status === "active").length,
        },
        categories: [...byCategory.entries()].map(([category, count]) => ({
          category,
          count,
        })),
        attempts: {
          total: activity.length,
          failed: activity.filter((a) => a.status === "error").length,
          avgDurationMs: durations.length
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0,
        },
      };
    },
  };

  return { users, clients, projects };
}

/** JSON store'larda parol hashlash uchun (lib/auth dan import qilinadi) */
import { hashPassword } from "./auth";
function hashPasswordLocal(password: string): string {
  return hashPassword(password);
}
