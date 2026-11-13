import { NextResponse } from "next/server";
import { clientStore, type ClientStatus } from "@/lib/client-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/clients?search=&status= — ro'yxat
 * POST /api/clients — yangi mijoz
 */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? undefined;
  const statusParam = url.searchParams.get("status");

  const status =
    statusParam === "Faol" || statusParam === "Arxiv"
      ? (statusParam as ClientStatus)
      : undefined;

  const clients = await clientStore.list({ search, status });
  return NextResponse.json({ clients });
}

export async function POST(req: Request) {
  let body: { name?: string; email?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const note = body.note ? String(body.note).trim() : undefined;

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Ism kamida 2 ta belgidan iborat bo'lishi kerak" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email manzili noto'g'ri" }, { status: 400 });
  }

  try {
    const client = await clientStore.create({ name, email, note });
    return NextResponse.json({ client }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Mijozni saqlab bo'lmadi" },
      { status: 500 }
    );
  }
}
