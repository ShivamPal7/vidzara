import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth"; // adjust path

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginRoute = pathname === "/login";

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // 🔒 Not logged in → block dashboard
  if (isDashboardRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔁 Already logged in → block login
  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
  runtime: "nodejs", // 🔴 required for Better Auth
};
