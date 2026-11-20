import { promises as fs } from "node:fs";
import path from "node:path";
import { GitHubJsonDb, githubStoreConfig } from "./json-db";
import { DEFAULT_PALETTE, normalizePaletteValue } from "./palettes";

/**
 * Butun AppNest platformasining dizayn sozlamalari.
 *
 * Saqlash:
 * - Production (Vercel): GitHub omboridagi `data/store.json` → appSettings.appearance
 * - Lokal development: `data/appearance.json`
 *
 * Foydalanuvchining shaxsiy rangi (users[].accent_color) ustun turadi —
 * bu palitra faqat "default" sifatida ishlaydi.
 */

export interface AppAppearance {
  palette: string;
  updatedAt?: string;
}

const DEFAULT_APPEARANCE: AppAppearance = {
  palette: DEFAULT_PALETTE.id,
};

const LOCAL_FILE = path.join(process.cwd(), "data", "appearance.json");

function normalize(value: unknown): AppAppearance {
  if (!value || typeof value !== "object") return DEFAULT_APPEARANCE;
  const raw = value as Record<string, unknown>;
  return {
    palette: normalizePaletteValue(raw.palette) ?? DEFAULT_PALETTE.id,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
}

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

/** Global dizayn sozlamalarini o'qiydi */
export async function getAppearance(): Promise<AppAppearance> {
  const db = getDb();
  if (db) {
    try {
      const data = await db.read();
      return normalize(data.appSettings?.appearance);
    } catch (e) {
      console.error("[appearance] GitHub o'qish xatosi:", e);
    }
  }

  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return normalize(JSON.parse(raw));
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

/** Global dizayn sozlamalarini saqlaydi (faqat superadmin) */
export async function setAppearance(palette: string): Promise<AppAppearance> {
  const value: AppAppearance = {
    palette: normalizePaletteValue(palette) ?? DEFAULT_PALETTE.id,
    updatedAt: new Date().toISOString(),
  };

  const db = getDb();
  if (db) {
    await db.update((data) => {
      data.appSettings = {
        ...data.appSettings,
        appearance: value,
      };
    });
    return value;
  }

  // Lokal development
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(value, null, 2));
  return value;
}
