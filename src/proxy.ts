import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const protectedPath =
    request.nextUrl.pathname.startsWith("/owner") ||
    request.nextUrl.pathname.startsWith("/tenant");

  if (protectedPath && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/tenant/:path*"],
};
