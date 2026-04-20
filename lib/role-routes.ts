export type AppRole = "user" | "delivery_agent" | "admin";

export const ROLE_HOME_ROUTES: Record<AppRole, string> = {
  user: "/profile",
  delivery_agent: "/delivery_dashboard",
  admin: "/dashboard2",
};

export function isAppRole(value: unknown): value is AppRole {
  return value === "user" || value === "delivery_agent" || value === "admin";
}

export function getDefaultRouteForRole(role: unknown): string {
  if (isAppRole(role)) {
    return ROLE_HOME_ROUTES[role];
  }

  return "/sign-in";
}



export function getRequiredRolesForPath(pathname: string): AppRole[] | null {
  if (pathname === "/admin_dashboard" || pathname.startsWith("/dashboard2")) {
    return ["admin"];
  }

  if (pathname.startsWith("/delivery_dashboard")) {
    return ["delivery_agent"];
  }

  if (pathname.startsWith("/profile")) {
    return ["user"];
  }

  return null;
}
