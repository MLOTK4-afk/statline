import { NextResponse, type NextRequest } from "next/server";
import { DEVICE_ID_COOKIE } from "@/lib/deviceTokenCookie";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get(DEVICE_ID_COOKIE)) {
    response.cookies.set(DEVICE_ID_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 5,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
