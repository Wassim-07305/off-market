"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useNotifications } from "@/hooks/use-notifications";
import { useTheme } from "next-themes";
import { Search, Bell, Menu, Sun, Moon, Monitor, User, LogOut } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

export function Header() {
  const { profile, signOut } = useAuth();
  const prefix = useRoutePrefix();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    sidebarCollapsed,
    setCommandPaletteOpen,
    setNotificationPanelOpen,
    setMobileMenuOpen,
  } = useUIStore();

  const initials = profile?.full_name ? getInitials(profile.full_name) : "U";

  // Avoid hydration mismatch for theme icon
  useEffect(() => setMounted(true), []);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dropdownOpen]);

  // Cycle theme: light → dark → system → light
  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const ThemeIcon = !mounted
    ? Sun
    : theme === "dark"
      ? Moon
      : theme === "system"
        ? Monitor
        : Sun;

  const themeLabel = !mounted
    ? "Theme"
    : theme === "dark"
      ? "Mode sombre"
      : theme === "system"
        ? "Mode systeme"
        : "Mode clair";

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
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
          aria-label={themeLabel}
          title={themeLabel}
        >
          <ThemeIcon className="w-[18px] h-[18px]" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => setNotificationPanelOpen(true)}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full bg-primary px-1 flex items-center justify-center text-[10px] font-medium text-white leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
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
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-popover border border-border shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {/* User info header */}
              <div className="px-3 py-2.5 border-b border-border/50">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.full_name ?? "Mon profil"}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {profile?.email}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href={`${prefix}/settings`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Mon profil
                </Link>
              </div>

              <div className="border-t border-border/50 py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Deconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
