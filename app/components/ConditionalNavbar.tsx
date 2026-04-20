"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Routes where navbar should NOT be displayed
  const hideNavbarRoutes = [
    /^\/dashboard2/,           // Admin dashboard
    /^\/\(dashboard\)/,         // Delivery dashboard (route group)
    /^\/delivery-dashboard/,    // Alternative delivery dashboard path
  ];

  // Check if current route should hide navbar
  const shouldHideNavbar = hideNavbarRoutes.some((route) => {
    if (route instanceof RegExp) {
      return route.test(pathname);
    }
    return pathname === route || pathname.startsWith(route);
  });

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="h-16" />
    </>
  );
}
