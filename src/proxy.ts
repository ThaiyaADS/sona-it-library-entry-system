import { NextRequest, NextResponse } from "next/server";
import { updateSession, decrypt } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  // Update session expiration if present
  const res = await updateSession(request);
  const sessionValue = request.cookies.get("session")?.value;
  
  let user = null;
  if (sessionValue) {
    try {
      const decrypted = await decrypt(sessionValue);
      user = decrypted?.user;
    } catch (e) {
      // invalid token
    }
  }

  const { pathname } = request.nextUrl;

  // Protect Admin Routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin" || pathname === "/admin/login") {
      if (user && user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    } else {
      if (!user || user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
  }

  // Protect Student Routes
  if (pathname.startsWith("/student")) {
    if (pathname === "/student/login") {
      if (user && user.role === "STUDENT") {
        return NextResponse.redirect(new URL("/student/dashboard", request.url));
      }
    } else {
      if (!user || user.role !== "STUDENT") {
        return NextResponse.redirect(new URL("/student/login", request.url));
      }
    }
  }

  // Protect Faculty Routes
  if (pathname.startsWith("/faculty")) {
    if (pathname === "/faculty/login") {
      if (user && user.role === "FACULTY") {
        return NextResponse.redirect(new URL("/faculty/dashboard", request.url));
      }
    } else {
      if (!user || user.role !== "FACULTY") {
        return NextResponse.redirect(new URL("/faculty/login", request.url));
      }
    }
  }

  return res || NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/faculty/:path*"],
};
