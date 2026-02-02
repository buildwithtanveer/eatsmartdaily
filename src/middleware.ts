import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    // Add security headers to authenticated requests
    const response = NextResponse.next();

    // Prevent response caching for sensitive pages
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    // Add X-Request-ID for security logging
    const requestId = crypto.randomUUID();
    response.headers.set("X-Request-ID", requestId);

    // Prevent caching of admin pages
    if (req.nextauth?.token) {
      response.headers.set(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate",
      );
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Verify token exists and is valid
        if (!token) return false;

        // Additional security check - verify token has required fields
        if (!token.email || !token.role) return false;

        return true;
      },
    },
    pages: {
      signIn: "/admin/login",
      error: "/admin/login?error=auth",
    },
  },
);

export const config = {
  matcher: ["/admin/:path*"],
};
