import { NextResponse } from "next/server";
import { userStore } from "@/lib/user-store";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/session";
import { normalizePaletteValue } from "@/lib/palettes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/auth/profile — profil va ish muhiti rangini saqlash.
 *
 * Rang faqat preset id yoki to'g'ri #hex bo'lsa qabul qilinadi —
 * scss/css in'ektsiyasining oldini olish uchun.
 */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: {
    name?: string;
    email?: string;
    accentColor?: string;
  };

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const email = typeof body.email === "string" ? body.email.trim() : undefined;

  if (name !== undefined && name.length < 2) {
    return badRequest("Ism kamida 2 ta belgidan iborat bo'lishi kerak");
  }
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest("Email manzili noto'g'ri");
  }

  let accentColor: string | undefined;
  if (body.accentColor !== undefined) {
    const normalized = normalizePaletteValue(body.accentColor);
    if (!normalized) {
      return badRequest("Rang noto'g'ri formatda. Masalan: #0057FF yoki preset id");
    }
    accentColor = normalized;
  }

  const updated = await userStore.updateProfile(user.id, {
    name,
    email,
    accentColor,
  });

  if (!updated) {
    return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
  }

  return NextResponse.json({ user: updated });
}
