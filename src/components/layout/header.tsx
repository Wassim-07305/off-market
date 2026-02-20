"use client";

import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
import {
  Search,
  Bell,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { profile } = useAuth();
  const {
    sidebarCollapsed,
    setCommandPaletteOpen,
    setNotificationPanelOpen,
    setMobileMenuOpen,
  } = useUIStore();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 bg-surface border-b border-border flex items-center justify-between px-6 transition-all duration-300",
        sidebarCollapsed ? "lg:pl-[96px]" : "lg:pl-[284px]"
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search bar */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden sm:flex items-center gap-3 h-10 px-4 bg-muted rounded-[10px] text-muted-foreground hover:bg-border/50 transition-colors cursor-pointer w-full max-w-sm"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Rechercher...</span>
        <kbd className="ml-auto text-xs bg-surface border border-border rounded px-1.5 py-0.5 font-mono">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={() => setNotificationPanelOpen(true)}
          className="relative w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold">
          {profile?.full_name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) ?? "?"}
        </div>
      </div>
    </header>
  );
}
