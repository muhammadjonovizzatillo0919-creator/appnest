import { NextResponse } from "next/server";
import { clientStore } from "@/lib/client-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/stats — dashboard statistikalari */
export async function GET() {
  const stats = await clientStore.stats();
  return NextResponse.json(stats);
}
