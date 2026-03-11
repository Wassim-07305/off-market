"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
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
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "coach", "setter", "closer"] },
  { name: "CRM", href: "/crm", icon: Users, roles: ["admin", "coach", "setter", "closer"] },
  { name: "Messagerie", href: "/messaging", icon: MessageSquare, roles: ["admin", "coach", "setter", "closer", "client"] },
  { name: "Formation", href: "/school", icon: GraduationCap, roles: ["admin", "coach", "client"] },
  { name: "Formulaires", href: "/forms", icon: FileText, roles: ["admin", "coach", "client"] },
  { name: "Assistant IA", href: "/ai", icon: Bot, roles: ["admin", "coach"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin", "coach"] },
  { name: "Reglages", href: "/settings", icon: Settings, roles: ["admin", "coach", "setter", "closer", "client"] },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { profile, loading, signOut } = useAuth();
  const role = profile?.role ?? "admin";

  const filteredNavigation = navigation.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  const initials = profile?.full_name ? getInitials(profile.full_name) : "";

  const roleLabel =
    role === "admin"
      ? "Admin"
      : role === "coach"
        ? "Coach"
        : role === "setter" || role === "closer"
          ? "Sales"
          : "Client";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-40 hidden lg:flex",
        "bg-[var(--sidebar-bg)]",
        sidebarCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "h-16 flex items-center px-4 shrink-0",
          sidebarCollapsed ? "justify-center" : "gap-3"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/logo.png"
              alt="Off Market"
              width={34}
              height={34}
              className="rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/10 blur-md" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-lg text-[var(--sidebar-text-active)] font-display font-bold tracking-tight">
              Off Market
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          const showSeparator = item.name === "Reglages";

          return (
            <div key={item.name}>
              {showSeparator && (
                <div className="my-2 mx-3 h-px bg-white/[0.06]" />
              )}
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 h-10 rounded-xl px-3 transition-all duration-200 group",
                  isActive
                    ? "bg-primary/[0.08] text-[var(--sidebar-text-active)]"
                    : "text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-white/[0.04]",
                  sidebarCollapsed && "justify-center px-0"
                )}
              >
                {/* Active indicator bar with glow */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary shadow-[0_0_8px_rgba(196,30,58,0.4)]" />
                )}
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-all duration-200",
                    isActive
                      ? "text-primary drop-shadow-[0_0_6px_rgba(196,30,58,0.3)]"
                      : "group-hover:text-[var(--sidebar-text-active)]"
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="text-[13px] font-medium tracking-[-0.01em] truncate">
                    {item.name}
                  </span>
                )}
                {/* Tooltip when collapsed */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 hidden lg:group-hover:block pointer-events-none z-50">
                    <div className="bg-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white shadow-xl whitespace-nowrap">
                      {item.name}
                    </div>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Collapse button — desktop only */}
      <div className="border-t border-white/[0.05] px-3 py-2 shrink-0 hidden lg:block">
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full h-9 rounded-xl flex items-center gap-3 transition-all duration-200 text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-white/[0.04]",
            sidebarCollapsed ? "justify-center px-0" : "px-3"
          )}
          title={sidebarCollapsed ? "Ouvrir le menu" : "Reduire le menu"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-[18px] h-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="w-[18px] h-[18px]" />
              <span className="text-[13px] font-medium">Reduire</span>
            </>
          )}
        </button>
      </div>

      {/* Profile section */}
      <div className="border-t border-white/[0.05] p-3 shrink-0">
        <div
          className={cn(
            "flex items-center gap-2",
            sidebarCollapsed && "justify-center"
          )}
        >
          {/* Avatar + info */}
          <div
            className={cn(
              "flex items-center gap-3 flex-1 min-w-0 group",
              sidebarCollapsed && "justify-center"
            )}
          >
            <div className="relative shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? ""}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/10"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs text-primary font-semibold ring-2 ring-primary/10">
                  {loading ? "..." : initials || "U"}
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[var(--sidebar-bg)]" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {loading ? "Chargement..." : profile?.full_name ?? "Mon profil"}
                </p>
                <p className="text-xs text-stone-500 capitalize truncate mt-0.5">
                  {roleLabel}
                </p>
              </div>
            )}
            {/* Tooltip when collapsed */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-3 hidden lg:group-hover:block pointer-events-none z-50">
                <div className="bg-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white shadow-xl whitespace-nowrap">
                  {profile?.full_name ?? "Mon profil"}
                </div>
              </div>
            )}
          </div>

          {/* Settings + Logout buttons */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/settings"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-white/[0.06] transition-all duration-200"
                title="Reglages"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                onClick={signOut}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                title="Deconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
