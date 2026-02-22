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
        <Link href={`/${variant}/dashboard`} className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Off Market"
            width={32}
            height={32}
            className="rounded-lg shrink-0"
          />
          {!sidebarCollapsed && (
            <span className="text-xl text-white font-bold">
              Off Market
            </span>
          )}
        </Link>
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-zinc-800 transition-colors"
            aria-label="Reduire le menu"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
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
            "flex items-center gap-3 rounded-lg",
            sidebarCollapsed && "justify-center"
          )}
        >
          <Link
            href={settingsHref}
            className={cn(
              "flex items-center gap-3 flex-1 min-w-0 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors",
              sidebarCollapsed && "justify-center p-0"
            )}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? ""}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-semibold shrink-0">
                {loading ? "..." : initials || "U"}
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--sidebar-text-active)] font-medium truncate">
                  {loading ? "Chargement..." : profile?.full_name ?? "Mon profil"}
                </p>
                <p className="text-xs text-[var(--sidebar-text)] truncate">
                  {profile?.email}
                </p>
              </div>
            )}
          </Link>
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
