import { NextResponse } from "next/server";
import { clientStore, type ClientStatus } from "@/lib/client-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH  /api/clients/[id] — yangilash (holat, ism, email, izoh)
 * DELETE /api/clients/[id] — o'chirish
 */

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return NextResponse.json({ error: "Noto'g'ri id" }, { status: 400 });
  }

  let body: {
    name?: string;
    email?: string;
    status?: ClientStatus;
    note?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.status && body.status !== "Faol" && body.status !== "Arxiv") {
    return NextResponse.json({ error: "Noto'g'ri holat" }, { status: 400 });
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: "Email manzili noto'g'ri" }, { status: 400 });
  }

  const client = await clientStore.update(numericId, body);

  if (!client) {
    return NextResponse.json({ error: "Mijoz topilmadi" }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return NextResponse.json({ error: "Noto'g'ri id" }, { status: 400 });
  }

  const removed = await clientStore.remove(numericId);

  if (!removed) {
    return NextResponse.json({ error: "Mijoz topilmadi" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
