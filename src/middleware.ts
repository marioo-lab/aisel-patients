import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/server/lib/auth";

// Edge middleware: coarse route protection. Verifies the JWT cookie with jose
// (no Prisma/bcrypt here). API routes enforce their own RBAC and are excluded.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(user ? "/patients" : "/login", req.url));
  }

  const isLogin = pathname === "/login";
  if (!user && !isLogin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL("/patients", req.url));
  }
  return NextResponse.next();
}

export const config = {
  // Run on everything except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
