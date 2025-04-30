import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/" ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Block access if not logged in
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/api");
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
