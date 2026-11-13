// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  canCreateProject,
  canActivateProject,
  canGenerate,
  describeEntitlements,
  PLAN_LIMITS,
} from "@/lib/entitlements";

const freeUser = { id: "u1", role: "user" as const, plan: "free" as const };
const proUser = { id: "u2", role: "user" as const, plan: "pro" as const };
const admin = { id: "u3", role: "superadmin" as const, plan: "free" as const };

describe("1+1 qoidasi — loyiha yaratish", () => {
  it("bepul foydalanuvchi 1 ta loyiha yarata oladi", () => {
    const result = canCreateProject(freeUser, 0);
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(1);
  });

  it("bepul foydalanuvchi 2-ga urinishda rad etiladi", () => {
    const result = canCreateProject(freeUser, 1);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("1+1");
  });

  it("PRO foydalanuvchi cheksiz yarata oladi", () => {
    expect(canCreateProject(proUser, 0).allowed).toBe(true);
    expect(canCreateProject(proUser, 50).allowed).toBe(true);
    expect(PLAN_LIMITS.pro.maxProjects).toBe(Infinity);
  });

  it("super admin cheklovsiz", () => {
    expect(canCreateProject(admin, 999).allowed).toBe(true);
  });
});

describe("Loyihani faollashtirish (production)", () => {
  const freeDraft = { status: "draft", user_id: "u1" };
  const proDraft = { status: "draft", user_id: "u2" };

  it("bepul foydalanuvchi faollashtira olmaydi", () => {
    const result = canActivateProject(freeUser, freeDraft);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("PRO");
  });

  it("PRO foydalanuvchi faollashtira oladi", () => {
    expect(canActivateProject(proUser, proDraft).allowed).toBe(true);
  });

  it("boshqaning loyihasini faollashtirib bo'lmaydi", () => {
    const result = canActivateProject(proUser, {
      status: "draft",
      user_id: "boshqa",
    });
    expect(result.allowed).toBe(false);
  });

  it("allaqachon faollashtirilgan loyiha qayta faollashtirilmaydi", () => {
    const result = canActivateProject(proUser, {
      status: "active",
      user_id: "u2",
    });
    expect(result.allowed).toBe(false);
  });
});

describe("AI generatsiya", () => {
  it("bepul foydalanuvchi o'z 1 ta loyihasini generatsiya qila oladi", () => {
    expect(
      canGenerate(freeUser, { user_id: "u1" }, 1).allowed
    ).toBe(true);
  });

  it("bepul foydalanuvchi boshqa loyihani generatsiya qila olmaydi", () => {
    const result = canGenerate(freeUser, { user_id: "boshqa" }, 1);
    expect(result.allowed).toBe(false);
  });
});

describe("Entitlement tavsifi (UI uchun)", () => {
  it("bepul foydalanuvchi uchun qoldiq limit ko'rsatiladi", () => {
    const state = describeEntitlements(freeUser, 0);
    expect(state.remainingProjects).toBe(1);
    expect(state.canCreateProject).toBe(true);
    expect(state.label).toBe("FREE");
  });

  it("limit tugaganda bloklanish sababi beriladi", () => {
    const state = describeEntitlements(freeUser, 1);
    expect(state.canCreateProject).toBe(false);
    expect(state.createBlockedReason).toBeTruthy();
  });

  it("PRO foydalanuvchi uchun cheklov yo'q", () => {
    const state = describeEntitlements(proUser, 12);
    expect(state.canCreateProject).toBe(true);
    expect(state.canActivate).toBe(true);
    expect(state.remainingProjects).toBe(Infinity);
  });
});
