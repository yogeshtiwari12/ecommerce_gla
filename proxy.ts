import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
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

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;
    const role = token?.role as string | undefined;

    // Redirect authenticated users away from auth pages
    if (AUTH_PAGES.includes(pathname) && token) {
      const homeRoute = getDefaultRouteForRole(role);
      return NextResponse.redirect(new URL(homeRoute, request.url));
    }

    // Check role-based access
    const requiredRoles = getRequiredRolesForPath(pathname);
    if (requiredRoles && token && !requiredRoles.includes(role as any)) {
      return NextResponse.redirect(
        new URL(getDefaultRouteForRole(role), request.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Public pages don't need authentication
        const publicPages = ["/", "/about", "/contact", "/register", "/buy"];
        if (publicPages.includes(pathname)) {
          return true;
        }

        // Auth pages are accessible to everyone (will be redirected if already logged in)
        if (AUTH_PAGES.includes(pathname)) {
          return true;
        }

        // Protected pages require token
        return !!token;
      },
    },
  }
);

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
