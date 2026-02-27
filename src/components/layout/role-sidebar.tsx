"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import {
  type RoleVariant,
  getNavigationForRole,
} from "@/lib/navigation";

interface RoleSidebarProps {
  variant: RoleVariant;
}

export function RoleSidebar({ variant }: RoleSidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { profile, loading, signOut } = useAuth();

  const navigation = getNavigationForRole(variant);
  const initials = profile?.full_name ? getInitials(profile.full_name) : "";
  const settingsHref = `/${variant}/settings`;

  const roleLabel =
    variant === "admin"
      ? "Admin"
      : variant === "coach"
        ? "Coach"
        : variant === "sales"
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
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href={`/${variant}/dashboard`}
          className="flex items-center gap-3 group"
        >
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
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-white/[0.06] transition-all duration-200"
            aria-label="Reduire le menu"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {navigation.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          // Add separator before "Reglages" (last item in each group)
          const showSeparator =
            item.name === "Reglages" ||
            (variant === "admin" && item.name === "Feed") ||
            (variant === "coach" && item.name === "Feed") ||
            (variant === "client" && item.name === "Feed");

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
                    ? "bg-white/[0.08] text-[var(--sidebar-text-active)]"
                    : "text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-white/[0.04]",
                  sidebarCollapsed && "justify-center px-0"
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                )}
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-colors duration-200",
                    isActive ? "text-primary" : "group-hover:text-[var(--sidebar-text-active)]"
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="text-[13px] font-medium tracking-[-0.01em] truncate">
                    {item.name}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/[0.06] p-3 space-y-2 shrink-0">
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="w-full h-10 rounded-xl flex items-center justify-center text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-white/[0.04] transition-all duration-200"
            aria-label="Agrandir le menu"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* User profile */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl",
            sidebarCollapsed && "justify-center"
          )}
        >
          <Link
            href={settingsHref}
            className={cn(
              "flex items-center gap-3 flex-1 min-w-0 p-2 rounded-xl hover:bg-white/[0.04] transition-all duration-200",
              sidebarCollapsed && "justify-center p-0"
            )}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? ""}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white/[0.08]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-semibold shrink-0 ring-2 ring-white/[0.08]">
                {loading ? "..." : initials || "U"}
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[var(--sidebar-text-active)] font-medium truncate leading-tight">
                  {loading ? "Chargement..." : profile?.full_name ?? "Mon profil"}
                </p>
                <p className="text-[11px] text-[var(--sidebar-text)] truncate mt-0.5">
                  {roleLabel}
                </p>
              </div>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={signOut}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-red-400 hover:bg-white/[0.04] transition-all duration-200 shrink-0"
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
