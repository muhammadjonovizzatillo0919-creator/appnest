import { NextResponse } from "next/server";
import { getAppearance } from "@/lib/appearance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/appearance — platformaning joriy dizayn palitrasi.
 * Ommaga ochiq: har bir foydalanuvchi UI ni shu rangda ko'radi
 * (agar shaxsiy rangi tanlanmagan bo'lsa).
 */
export async function GET() {
  const appearance = await getAppearance();
  return NextResponse.json({ appearance });
}
