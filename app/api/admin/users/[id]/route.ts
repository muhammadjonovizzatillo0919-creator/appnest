import { NextResponse } from "next/server";
import { userStore } from "@/lib/user-store";
import { getCurrentUser, unauthorized, forbidden, badRequest } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/users/[id] — foydalanuvchi tarifini yoki rolini o'zgartirish.
 * Faqat super admin. (Stripe kelgandan keyin to'lov shu yerda amalga oshadi.)
 */
export async function PATCH(req: Request, { params }: Params) {
  const admin = await getCurrentUser();
  if (!admin) return unauthorized();

  if (admin.role !== "superadmin") {
    return forbidden("Bu bo'lim faqat super admin uchun");
  }

  const { id } = await params;

  let body: { plan?: "free" | "pro"; role?: "user" | "superadmin" };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (body.plan && body.plan !== "free" && body.plan !== "pro") {
    return badRequest("Noto'g'ri tarif");
  }
  if (body.role && body.role !== "user" && body.role !== "superadmin") {
    return badRequest("Noto'g'ri rol");
  }

  // O'zini demutatsiya qilishdan himoya
  if (id === admin.id && body.role === "user") {
    return badRequest("O'z rolingizni olib qo'yolmaysiz");
  }

  let updated = await userStore.findById(id);
  if (!updated) {
    return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
  }

  if (body.plan) {
    await userStore.setPlan(id, body.plan);
  }
  if (body.role) {
    await userStore.setRole(id, body.role);
  }

  updated = await userStore.findById(id);

  return NextResponse.json({
    user: updated
      ? {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          plan: updated.plan,
        }
      : null,
  });
}
