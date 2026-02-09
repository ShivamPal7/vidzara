import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define protected routes
    const isDashboardRoute = path.startsWith("/dashboard");

    // Check for session token in cookies
    // Better Auth default cookie name is "better-auth.session_token"
    // We can also just check if the cookie exists for a lightweight check
    const sessionToken = request.cookies.get("better-auth.session_token") || request.cookies.get("better-auth.session_token.sig"); // Signature might be separate, but main token is what matters. 
    // actually better-auth uses "better-auth.session_token" usually.

    if (isDashboardRoute && !sessionToken) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
    ],
};
