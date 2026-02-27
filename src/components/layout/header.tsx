"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { Search, Bell, Menu } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

export function Header() {
  const { profile } = useAuth();
  const prefix = useRoutePrefix();
  const {
    sidebarCollapsed,
    setCommandPaletteOpen,
    setNotificationPanelOpen,
    setMobileMenuOpen,
  } = useUIStore();

  const initials = profile?.full_name ? getInitials(profile.full_name) : "U";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 flex items-center justify-between px-6 transition-all duration-300",
        "bg-background/80 backdrop-blur-xl",
        "border-b border-border/50",
        sidebarCollapsed ? "lg:pl-[96px]" : "lg:pl-[284px]"
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search bar */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden sm:flex items-center gap-3 h-10 px-4 bg-muted/50 rounded-full text-muted-foreground hover:bg-muted/80 transition-all duration-200 cursor-pointer w-full max-w-sm"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="text-sm">Rechercher...</span>
        <kbd className="ml-auto text-[11px] bg-background border border-border rounded-md px-1.5 py-0.5 font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <button
          onClick={() => setNotificationPanelOpen(true)}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
        </button>

        {/* Avatar */}
        <Link
          href={`${prefix}/settings`}
          className="relative rounded-full transition-all duration-200 hover:ring-2 hover:ring-primary/20 hover:ring-offset-2 hover:ring-offset-background"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? ""}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold">
              {initials}
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
        </Link>
      </div>
    </header>
  );
}
