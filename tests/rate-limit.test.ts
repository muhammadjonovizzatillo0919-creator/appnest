// @vitest-environment node
import { describe, expect, it } from "vitest";
import { rateLimit, clientIp } from "@/lib/rate-limit";

describe("rate limiting", () => {
  it("limit ichida ruxsat beradi", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      const r = rateLimit(key, 3, 60);
      expect(r.allowed).toBe(true);
    }
  });

  it("limitdan oshganda rad etadi", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 2, 60).allowed).toBe(true);
    expect(rateLimit(key, 2, 60).allowed).toBe(true);

    const third = rateLimit(key, 2, 60);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("turli kalitlar bir-biriga ta'sir qilmaydi", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(rateLimit(a, 1, 60).allowed).toBe(true);
    expect(rateLimit(a, 1, 60).allowed).toBe(false);
    expect(rateLimit(b, 1, 60).allowed).toBe(true);
  });

  it("qolgan so'rovlar soni kamayadi", () => {
    const key = `test-${Math.random()}`;
    const first = rateLimit(key, 5, 60);
    expect(first.remaining).toBe(4);

    const second = rateLimit(key, 5, 60);
    expect(second.remaining).toBe(3);
  });
});

describe("client IP aniqlash", () => {
  const makeReq = (headers: Record<string, string>) =>
    new Request("http://localhost", { headers });

  it("x-forwarded-for dan oladi", () => {
    expect(
      clientIp(makeReq({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))
    ).toBe("1.2.3.4");
  });

  it("x-real-ip dan oladi", () => {
    expect(clientIp(makeReq({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
  });

  it("yo'q bo'lsa 'unknown' qaytaradi", () => {
    expect(clientIp(makeReq({}))).toBe("unknown");
  });
});
