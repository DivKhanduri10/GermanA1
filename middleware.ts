import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from "@/lib/session";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get(SESSION_COOKIE_NAME)) {
    const sessionId = crypto.randomUUID();
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and api internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
