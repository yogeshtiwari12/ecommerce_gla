import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getDefaultRouteForRole,
  getRequiredRolesForPath,
  isAppRole,
} from "@/lib/role-routes";

const AUTH_PAGES = ["/sign-in", "/employee_login", "/login"];

function getSignInRouteForPath(pathname: string): string {
  if (
    pathname.startsWith("/delivery_dashboard") ||
    pathname === "/admin_dashboard" ||
    pathname.startsWith("/dashboard2")
  ) {
    return "/employee_login";
  }

  return "/sign-in";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const role = token?.role;
  const isAuthenticated = Boolean(token);

  if (AUTH_PAGES.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(
      new URL(getDefaultRouteForRole(role), request.url)
    );
  }

  if (pathname === "/admin_dashboard") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/employee_login", request.url));
    }

    if (!isAppRole(role)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.redirect(
      new URL(getDefaultRouteForRole(role), request.url)
    );
  }

  const requiredRoles = getRequiredRolesForPath(pathname);

  if (!requiredRoles) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const signInRoute = getSignInRouteForPath(pathname);
    return NextResponse.redirect(new URL(signInRoute, request.url));
  }

  if (!isAppRole(role)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!requiredRoles.includes(role)) {
    return NextResponse.redirect(
      new URL(getDefaultRouteForRole(role), request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/delivery_dashboard/:path*",
    "/dashboard2/:path*",
    "/admin_dashboard",
    "/sign-in",
    "/employee_login",
    "/login",
  ],
};
