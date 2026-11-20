import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, forbidden, badRequest } from "@/lib/session";
import { getAppearance, setAppearance } from "@/lib/appearance";
import { normalizePaletteValue } from "@/lib/palettes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "superadmin") {
    return forbidden("Bu bo'lim faqat super admin uchun");
  }
  return null;
}

/** GET /api/admin/appearance — joriy platforma dizayni */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const appearance = await getAppearance();
  return NextResponse.json({ appearance });
}

/** PATCH /api/admin/appearance — platforma palitrasini o'zgartirish */
export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { palette?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const palette = normalizePaletteValue(body.palette);
  if (!palette) {
    return badRequest("Rang noto'g'ri formatda. Masalan: #0057FF yoki preset id");
  }

  const appearance = await setAppearance(palette);
  return NextResponse.json({ appearance });
}
