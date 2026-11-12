import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Next.js 16 — `middleware.ts` o'rniga `proxy.ts`.
 * (Next 16 da `middleware` konventsiyasi `proxy` ga qayta nomlangan.)
 *
 * Himoyalangan sahifalar: /clients, /settings
 * Sessiya yo'q bo'lsa — /login ga yuboriladi (savol saqlanadi).
 */

const PROTECTED = ["/dashboard", "/clients", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const userId = verifySessionToken(token);

  if (!userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/clients/:path*", "/settings/:path*"],
};
