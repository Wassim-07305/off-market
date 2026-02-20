"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  GraduationCap,
  FileText,
  Bot,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "coach", "team"] },
  { name: "CRM", href: "/crm", icon: Users, roles: ["admin", "coach", "team"] },
  { name: "Messagerie", href: "/messaging", icon: MessageSquare, roles: ["admin", "coach", "team", "student"] },
  { name: "Formation", href: "/school", icon: GraduationCap, roles: ["admin", "coach", "team", "student"] },
  { name: "Formulaires", href: "/forms", icon: FileText, roles: ["admin", "coach", "team", "student"] },
  { name: "Assistant IA", href: "/ai", icon: Bot, roles: ["admin", "coach", "team"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin", "coach"] },
  { name: "Reglages", href: "/settings", icon: Settings, roles: ["admin", "coach", "team"] },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { profile, signOut } = useAuth();
  const role = profile?.role ?? "student";

  const filteredNavigation = navigation.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex flex-col transition-all duration-300 z-40 hidden lg:flex",
        sidebarCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-[var(--sidebar-border)] px-4",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span
              className="text-2xl text-white"
              style={{ fontFamily: "Instrument Serif, serif" }}
            >
              Off Market
            </span>
          </Link>
        )}
        {sidebarCollapsed && (
          <Link href="/dashboard">
            <span
              className="text-2xl text-white font-bold"
              style={{ fontFamily: "Instrument Serif, serif" }}
            >
              O
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-zinc-800 transition-colors",
            sidebarCollapsed && "hidden"
          )}
          aria-label="Reduire le menu"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 h-10 rounded-lg px-3 transition-all duration-150 group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-zinc-800/50",
                sidebarCollapsed && "justify-center px-0"
              )}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-primary" : ""
                )}
              />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium truncate">
                  {item.name}
                </span>
              )}
              {isActive && !sidebarCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--sidebar-border)] p-3 space-y-2">
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="w-full h-10 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-zinc-800/50 transition-colors"
            aria-label="Agrandir le menu"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* User profile */}
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg",
            sidebarCollapsed && "justify-center p-0"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white font-medium shrink-0">
            {profile?.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) ?? "?"}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--sidebar-text-active)] font-medium truncate">
                {profile?.full_name ?? "Chargement..."}
              </p>
              <p className="text-xs text-[var(--sidebar-text)] truncate">
                {profile?.email}
              </p>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={signOut}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-red-400 hover:bg-zinc-800/50 transition-colors shrink-0"
              aria-label="Deconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
