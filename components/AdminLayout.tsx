"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  UserCog,
  Package,
  Users,
  BarChart2,
  Tag,
  Settings,
  Menu,
  Bell,
  Search,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", value: "overview", icon: LayoutDashboard },
  { label: "Employees", value: "employees", icon: UserCog },
  { label: "Products", value: "products", icon: Package },
  { label: "Customers", value: "customers", icon: Users },
  { label: "Analytics", value: "analytics", icon: BarChart2 },
  { label: "Coupons", value: "coupons", icon: Tag },
  { label: "Settings", value: "settings", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  hideNavbar?: boolean;
}

export function AdminLayout({ children, title, subtitle, activeTab, onTabChange, hideNavbar = false }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300",
          "lg:static lg:inset-auto lg:z-auto lg:translate-x-0 lg:flex-shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-lg tracking-tight">ShopAdmin</span>
        </div>

        {/* Admin Profile */}
        <div className="px-4 py-4">
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
            {/* Decorative circle */}
            {/* <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10" />
            <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-primary/5" /> */}

            {/* Avatar + name */}
            <div className="relative flex flex-col items-center text-center gap-2">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background text-lg font-bold shadow-lg  ring-primary/20">
                  {session?.user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">{session?.user?.name || "Super Admin"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{session?.user?.email || "admin@shopadmin.com"}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <ShieldCheck className="h-3 w-3" /> Administrator
              </span>
            </div>

            {/* Divider */}
            <div className="my-3 border-t border-border/60" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-1 text-center">
              <div>
                <p className="text-sm font-bold text-foreground">48</p>
                <p className="text-[10px] text-muted-foreground">Team</p>
              </div>
              <div className="border-x border-border/60">
                <p className="text-sm font-bold text-foreground">$412K</p>
                <p className="text-[10px] text-muted-foreground">Revenue</p>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">99.9%</p>
                <p className="text-[10px] text-muted-foreground">Uptime</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => {
                  onTabChange?.(item.value);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-border p-4">
          <Button
            onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            className="w-full flex items-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20"
            variant="ghost"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        {!hideNavbar && (
          <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1">
              <h1 className="text-lg font-semibold">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
                A
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}


