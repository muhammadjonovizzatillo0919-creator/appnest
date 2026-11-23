// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createMemoryDb } from "@/lib/db";
import { createUserStore } from "@/lib/user-store";

/**
 * Foydalanuvchilar ombori — xotiradagi bazada.
 */
function setup() {
  const db = createMemoryDb();
  return { db, store: createUserStore(db) };
}

describe("user store (SQLite)", () => {
  it("foydalanuvchi yaratiladi", async () => {
    const { store } = setup();

    const user = await store.create({
      name: "Admin",
      email: "Admin@Example.com",
      password: "parol12345",
    });

    expect(user.name).toBe("Admin");
    expect(user.email).toBe("admin@example.com");
    expect(user.id).toBeTruthy();
  });

  it("parol hash qilinadi (ochiq saqlanmaydi)", async () => {
    const { store } = setup();

    await store.create({
      name: "Xabar",
      email: "hash@example.com",
      password: "jiddiy-parol",
    });

    const stored = await store.findByEmail("hash@example.com");
    expect(stored?.passwordHash).not.toBe("jiddiy-parol");
    expect(stored?.passwordHash).toContain(":");
  });

  it("bir xil email bilan qayta ro'yxatdan o'tib bo'lmaydi", async () => {
    const { store } = setup();

    await store.create({
      name: "Birinchi",
      email: "takror@example.com",
      password: "parol12345",
    });

    await expect(
      store.create({
        name: "Ikkinchi",
        email: "TAKROR@example.com",
        password: "parol12345",
      })
    ).rejects.toThrow("EMAIL_TAKEN");
  });

  it("email bo'yicha qidirish ishlaydi", async () => {
    const { store } = setup();

    await store.create({
      name: "Qidiriluvchi",
      email: "qidiruv@example.com",
      password: "parol12345",
    });

    const found = await store.findByEmail("QIDIRUV@example.com");
    expect(found?.name).toBe("Qidiriluvchi");
  });

  it("id bo'yicha qidirish ishlaydi", async () => {
    const { store } = setup();

    const created = await store.create({
      name: "Id bilan",
      email: "id@example.com",
      password: "parol12345",
    });

    const found = await store.findById(created.id);
    expect(found?.email).toBe("id@example.com");
  });

  it("foydalanuvchilar soni to'g'ri", async () => {
    const { store } = setup();

    const before = await store.count();
    await store.create({
      name: "Yangi",
      email: "yangi@example.com",
      password: "parol12345",
    });

    expect(await store.count()).toBe(before + 1);
  });
});

