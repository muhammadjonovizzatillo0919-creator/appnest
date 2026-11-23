// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createMemoryDb } from "@/lib/db";
import { createClientStore } from "@/lib/client-store";

/**
 * Mijozlar ombori testlari.
 * Xotiradagi (`:memory:`) baza ishlatiladi — faylga tegilmaydi.
 */

function setup() {
  const db = createMemoryDb();
  const store = createClientStore(db);
  return { db, store };
}

describe("SQLite sxemasi", () => {
  it("barcha jadvallar yaratiladi", async () => {
    const db = createMemoryDb();
    const tables = await db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );

    const names = tables.map((t) => t.name);
    expect(names).toContain("clients");
    expect(names).toContain("users");
    expect(names).toContain("activity");
  });

  it("indekslar yaratiladi", async () => {
    const db = createMemoryDb();
    const indexes = await db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='index'"
    );

    expect(indexes.some((i) => i.name.includes("idx_clients"))).toBe(true);
  });

  it("namuna mijozlar avtomatik qo'shiladi", async () => {
    const db = createMemoryDb();
    const row = await db.get<{ count: number }>(
      "SELECT COUNT(*) AS count FROM clients"
    );

    expect(Number(row?.count ?? 0)).toBeGreaterThan(0);
  });
});

describe("client store", () => {
  it("yangi mijoz yaratiladi", async () => {
    const { store } = setup();

    const created = await store.create({
      name: "Test Mijoz",
      email: "test@example.com",
      note: "Sinov",
    });

    expect(created.id).toBeGreaterThan(0);
    expect(created.name).toBe("Test Mijoz");
    expect(created.email).toBe("test@example.com");
    expect(created.status).toBe("Faol");
  });

  it("email kichik harflarga o'tkaziladi", async () => {
    const { store } = setup();

    const created = await store.create({
      name: "Upper",
      email: "MiXeD@Example.COM",
    });

    expect(created.email).toBe("mixed@example.com");
  });

  it("ro'yxatda qidirish ishlaydi", async () => {
    const { store } = setup();
    await store.create({ name: "Qidiriladigan Xabar", email: "qidirish@example.com" });

    const found = await store.list({ search: "Qidiriladigan" });
    expect(found.length).toBeGreaterThan(0);
    expect(found[0].name).toContain("Qidiriladigan");
  });

  it("holatga qarab filtrlash ishlaydi", async () => {
    const { store } = setup();
    const created = await store.create({ name: "Arxivlanadigan", email: "arxiv@example.com" });

    await store.update(created.id, { status: "Arxiv" });

    const archived = await store.list({ status: "Arxiv" });
    expect(archived.some((c) => c.id === created.id)).toBe(true);

    const active = await store.list({ status: "Faol" });
    expect(active.some((c) => c.id === created.id)).toBe(false);
  });

  it("yangilash ishlaydi", async () => {
    const { store } = setup();
    const created = await store.create({ name: "Eski nom", email: "update@example.com" });

    const updated = await store.update(created.id, {
      name: "Yangi nom",
      status: "Arxiv",
    });

    expect(updated?.name).toBe("Yangi nom");
    expect(updated?.status).toBe("Arxiv");
  });

  it("mavjud bo'lmagan mijoz yangilanmaydi", async () => {
    const { store } = setup();
    expect(await store.update(999999, { name: "Yo'q" })).toBeNull();
  });

  it("o'chirish ishlaydi", async () => {
    const { store } = setup();
    const created = await store.create({ name: "O'chiriladigan", email: "delete@example.com" });

    expect(await store.remove(created.id)).toBe(true);
    expect(await store.get(created.id)).toBeNull();
    expect(await store.remove(created.id)).toBe(false);
  });

  it("statistika to'g'ri hisoblanadi", async () => {
    const { store } = setup();

    const a = await store.create({ name: "Faol Bir", email: "bir@example.com" });
    await store.create({ name: "Faol Ikki", email: "ikki@example.com" });
    await store.update(a.id, { status: "Arxiv" });

    const stats = await store.stats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats.active + stats.archived).toBe(stats.total);
  });

  it("har bir amal faol jurnalga yoziladi", async () => {
    const { db, store } = setup();
    const created = await store.create({ name: "Jurnal", email: "jurnal@example.com" });

    await store.update(created.id, { status: "Arxiv" });
    await store.remove(created.id);

    const rows = await db.all<{ action: string }>(
      "SELECT action FROM activity ORDER BY id"
    );

    expect(rows.map((r) => r.action)).toEqual(["create", "update", "delete"]);
  });
});

