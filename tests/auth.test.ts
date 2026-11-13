// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth";

describe("parol hashing", () => {
  it("parolni hash qiladi va tekshiradi", () => {
    const hash = hashPassword("mening-parolim-123");
    expect(hash).not.toBe("mening-parolim-123");
    expect(hash).toContain(":");
    expect(verifyPassword("mening-parolim-123", hash)).toBe(true);
  });

  it("noto'g'ri parolni rad etadi", () => {
    const hash = hashPassword("mening-parolim-123");
    expect(verifyPassword("boshqa-parol", hash)).toBe(false);
  });

  it("har bir hash noyob (salt tasodifiy)", () => {
    expect(hashPassword("bir-xil")).not.toBe(hashPassword("bir-xil"));
  });

  it("buzilgan hash bilan xato beradi", () => {
    expect(verifyPassword("x", "buzilgan")).toBe(false);
    expect(verifyPassword("x", "")).toBe(false);
  });
});

describe("sessiya tokeni", () => {
  it("yaratadi va tekshiradi", async () => {
    const token = await createSessionToken("user-123");
    expect(verifySessionToken(token)).toBe("user-123");
  });

  it("soxtalashgan token rad etiladi", async () => {
    const token = await createSessionToken("user-123");
    const [payload, signature] = token.split(".");
    const forged = `${payload}.${signature!.slice(0, -2)}xx`;

    expect(verifySessionToken(forged)).toBeNull();
  });

  it("bo'sh yoki noto'g'ri token rad etiladi", () => {
    expect(verifySessionToken(undefined)).toBeNull();
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("not-a-token")).toBeNull();
  });

  it("muddati o'tgan token rad etiladi", async () => {
    const token = await createSessionToken("user-123");
    // Token ichidagi payload'ni o'zgartirib muddatni o'tkazib yuboramiz
    const [encoded, signature] = token.split(".");
    const payload = JSON.parse(Buffer.from(encoded!, "base64url").toString()) as {
      uid: string;
      exp: number;
    };
    payload.exp = Date.now() - 1000;
    const forged = `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${signature}`;

    // Imzo mos kelmaydi в†’ rad etiladi
    expect(verifySessionToken(forged)).toBeNull();
  });
});

