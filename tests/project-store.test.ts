// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createMemoryDb } from "@/lib/db";
import { createProjectStore } from "@/lib/project-store";
import { createUserStore } from "@/lib/user-store";

function setup() {
  const db = createMemoryDb();
  return {
    db,
    projects: createProjectStore(db),
    users: createUserStore(db),
  };
}

describe("project store", () => {
  it("loyiha yaratiladi (draft holatda)", async () => {
    const { projects } = setup();

    const project = await projects.create({
      userId: "u1",
      title: "Restoran menyusi",
      category: "Restoran",
      brief: "Kafe uchun menyu va buyurtma",
    });

    expect(project.status).toBe("draft");
    expect(project.platform).toBe("web");
    expect(project.category).toBe("Restoran");
    expect(project.aiSpec).toBeNull();
  });

  it("foydalanuvchi bo'yicha filtrlash ishlaydi", async () => {
    const { projects } = setup();

    await projects.create({ userId: "u1", title: "Birinchi", category: "Do'kon" });
    await projects.create({ userId: "u2", title: "Ikkinchi", category: "Maktab" });

    const mine = await projects.listByUser("u1");
    expect(mine.length).toBe(1);
    expect(mine[0].title).toBe("Birinchi");

    expect(await projects.countByUser("u1")).toBe(1);
    expect(await projects.countByUser("u2")).toBe(1);
  });

  it("AI spetsifikatsiyasi va layout saqlanadi", async () => {
    const { projects } = setup();

    const created = await projects.create({
      userId: "u1",
      title: "Loyiha",
      category: "Universitet",
    });

    const updated = await projects.update(created.id, {
      aiSpec: JSON.stringify({ pages: ["home", "about"] }),
      layout: JSON.stringify({ rows: [] }),
      platform: "mobile",
    });

    expect(updated?.aiSpec).toContain("home");
    expect(updated?.layout).toContain("rows");
    expect(updated?.platform).toBe("mobile");
  });

  it("holatni faollashtirish mumkin", async () => {
    const { projects } = setup();

    const created = await projects.create({
      userId: "u1",
      title: "Loyiha",
      category: "Do'kon",
    });

    const activated = await projects.update(created.id, { status: "active" });
    expect(activated?.status).toBe("active");
  });

  it("AI urinishlari jurnalga yoziladi", async () => {
    const { projects } = setup();

    const created = await projects.create({
      userId: "u1",
      title: "Loyiha",
      category: "Do'kon",
    });

    await projects.logAttempt({
      projectId: created.id,
      attemptNo: 1,
      model: "gemini-2.5-pro",
      durationMs: 4200,
    });
    await projects.logAttempt({
      projectId: created.id,
      attemptNo: 2,
      model: "gemini-2.5-flash",
      durationMs: 1800,
      status: "error",
      error: "timeout",
    });

    const attempts = await projects.attempts(created.id);
    expect(attempts.length).toBe(2);
    expect(attempts[0].status).toBe("ok");
    expect(attempts[1].status).toBe("error");
    expect(attempts[1].error).toBe("timeout");
  });

  it("loyiha o'chirilganda urinishlar ham o'chadi", async () => {
    const { projects } = setup();

    const created = await projects.create({
      userId: "u1",
      title: "Loyiha",
      category: "Do'kon",
    });

    await projects.logAttempt({
      projectId: created.id,
      attemptNo: 1,
      durationMs: 1000,
    });

    expect(await projects.remove(created.id)).toBe(true);
    expect(await projects.get(created.id)).toBeNull();
    expect(await projects.attempts(created.id)).toHaveLength(0);
  });

  it("admin statistikasi to'g'ri", async () => {
    const { projects } = setup();

    await projects.create({ userId: "u1", title: "A", category: "Do'kon" });
    await projects.create({ userId: "u2", title: "B", category: "Do'kon" });
    await projects.create({ userId: "u3", title: "C", category: "Maktab" });

    const stats = await projects.adminStats();

    expect(stats.projects.total).toBe(3);
    expect(stats.projects.draft).toBe(3);
    expect(stats.categories.find((c) => c.category === "Do'kon")?.count).toBe(2);
  });
});

describe("user store — rol va tarif", () => {
  it("yangi foydalanuvchi free + user bo'ladi", async () => {
    const { users } = setup();

    const user = await users.create({
      name: "Yangi",
      email: "yangi@example.com",
      password: "parol12345",
    });

    expect(user.plan).toBe("free");
    expect(user.role).toBe("user");
  });

  it("tarifni PRO ga o'tkazish mumkin", async () => {
    const { users } = setup();

    const created = await users.create({
      name: "Pro",
      email: "pro@example.com",
      password: "parol12345",
    });

    const updated = await users.setPlan(created.id, "pro");
    expect(updated?.plan).toBe("pro");
  });

  it("rolni superadmin ga o'tkazish mumkin", async () => {
    const { users } = setup();

    const created = await users.create({
      name: "Admin",
      email: "admin@example.com",
      password: "parol12345",
    });

    const updated = await users.setRole(created.id, "superadmin");
    expect(updated?.role).toBe("superadmin");

    const stored = await users.findById(created.id);
    expect(stored?.role).toBe("superadmin");
    expect(stored?.plan).toBe("free");
  });
});
