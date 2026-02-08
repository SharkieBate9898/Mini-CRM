import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const sessionCookieName = "session_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/app")) {
    const token = request.cookies.get(sessionCookieName)?.value;
    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"]
};
