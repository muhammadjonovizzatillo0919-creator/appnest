import { Buffer } from "node:buffer";

/**
 * GitHub omborasi orqali JSON ma'lumotlar bazasi.
 *
 * Nima uchun: Vercel serverless muhitida bir nechta instance ishlaydi va
 * ularning **o'z xotira bazasi** bor. SQLite fayli esa faqat o'qiladigan.
 * Natijada: login bir instance'da, keyingi so'rov boshqasida → 401.
 *
 * Yechim: ma'lumotlarni umumiy joyda (GitHub repo'sida) saqlash.
 * Bu Turso/Postgres o'rniga **bepul va darhol** ishlaydigan yechim.
 *
 * Ishlashi uchun muhit o'zgaruvchilari:
 *   GITHUB_TOKEN  — repo'ga yozish huquqi bilan PAT
 *   GITHUB_REPO   — "user/repo" ko'rinishi
 *   GITHUB_BRANCH — odatda "main"
 *   GITHUB_DB_PATH — odatda "data/store.json"
 */

export interface JsonShape {
  users: Record<string, unknown>[];
  clients: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  activity: Record<string, unknown>[];
}

const EMPTY: JsonShape = {
  users: [],
  clients: [],
  projects: [],
  activity: [],
};

export class GitHubJsonDb {
  private cache: JsonShape | null = null;
  private cacheAt = 0;
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(
    private token: string,
    private repo: string,
    private branch: string,
    private filePath: string
  ) {}

  private get apiUrl(): string {
    return `https://api.github.com/repos/${this.repo}/contents/${this.filePath}`;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };
  }

  /** Ma'lumotlarni o'qiydi (5 soniya kesh bilan) */
  async read(): Promise<JsonShape> {
    const now = Date.now();
    if (this.cache && now - this.cacheAt < 5000) {
      return this.cache;
    }

    try {
      const res = await fetch(`${this.apiUrl}?ref=${this.branch}`, {
        headers: this.headers(),
        cache: "no-store",
      });

      if (res.status === 404) {
        this.cache = structuredClone(EMPTY);
        this.cacheAt = now;
        return this.cache;
      }

      if (!res.ok) throw new Error(`GitHub o'qish xatosi: ${res.status}`);

      const file = (await res.json()) as { content?: string; sha?: string };
      const decoded = Buffer.from(file.content ?? "", "base64").toString("utf8");
      const parsed = JSON.parse(decoded || "{}") as Partial<JsonShape>;

      this.cache = {
        users: parsed.users ?? [],
        clients: parsed.clients ?? [],
        projects: parsed.projects ?? [],
        activity: parsed.activity ?? [],
      };
      this.cacheAt = now;
      return this.cache;
    } catch (e) {
      // O'qib bo'lmasa — bo'sh struktura (ishlamaydi, lekin crash qilmaydi)
      console.error("[json-db] o'qish xatosi:", e);
      return this.cache ?? structuredClone(EMPTY);
    }
  }

  /** Ma'lumotlarni yozadi (409 — parallel yozishda qayta urinish) */
  private async write(data: JsonShape): Promise<void> {
    const content = Buffer.from(JSON.stringify(data, null, 2), "utf8").toString(
      "base64"
    );

    for (let attempt = 0; attempt < 3; attempt++) {
      // Mavjud faylning sha'sini olamiz
      let sha: string | undefined;
      try {
        const existing = await fetch(`${this.apiUrl}?ref=${this.branch}`, {
          headers: this.headers(),
          cache: "no-store",
        });
        if (existing.ok) {
          const file = (await existing.json()) as { sha?: string };
          sha = file.sha;
        }
      } catch {
        /* yangi fayl bo'lishi mumkin */
      }

      const body: Record<string, unknown> = {
        message: "chore(db): AppNest ma'lumotlarini yangilash",
        content,
        branch: this.branch,
      };
      if (sha) body.sha = sha;

      const res = await fetch(this.apiUrl, {
        method: "PUT",
        headers: this.headers(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        this.cache = data;
        this.cacheAt = Date.now();
        return;
      }

      // 409 — boshqa instance yozgan, qayta o'qib, qayta urinamiz
      if (res.status === 409) {
        this.cache = null;
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }

      const text = await res.text();
      throw new Error(`GitHub yozish xatosi (${res.status}): ${text.slice(0, 200)}`);
    }

    throw new Error("GitHub'ga yozish: 3 urinishdan keyin ham muvaffaqiyatsiz");
  }

  /**
   * O'qish → o'zgartirish → yozish.
   * Yozishlar navbatga (queue) tushiriladi — parallel so'rovlar bir-birini
   * buzmasligi uchun.
   */
  async update<T>(fn: (data: JsonShape) => T): Promise<T> {
    const run = async (): Promise<T> => {
      const data = structuredClone(await this.read());
      const result = fn(data);
      await this.write(data);
      return result;
    };

    const next = this.writeQueue.then(run, run);
    this.writeQueue = next.catch(() => undefined);
    return next;
  }
}

/** GitHub omborasi sozlamalari mavjudmi? */
export function githubStoreConfig(): {
  token: string;
  repo: string;
  branch: string;
  filePath: string;
} | null {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) return null;

  return {
    token,
    repo,
    branch: process.env.GITHUB_BRANCH ?? "main",
    filePath: process.env.GITHUB_DB_PATH ?? "data/store.json",
  };
}
