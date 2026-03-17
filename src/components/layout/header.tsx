"use client";

import { useState } from "react";
import {
  Bell,
  User,
  LogOut,
  Menu,
  Moon,
  MoonStar,
  ChevronDown,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useDndMode } from "@/hooks/use-dnd-mode";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { setMobileMenuOpen, setNotificationPanelOpen, setCommandPaletteOpen } =
    useUIStore();
  const { unreadCount } = useNotificationStore();
  const { isDnd, toggleDnd, setDndUntil, dndUntil } = useDndMode();
  const [showDndMenu, setShowDndMenu] = useState(false);
  const router = useRouter();

  const handleDndDuration = (hours: number) => {
    const until = new Date(Date.now() + hours * 3600000);
    setDndUntil(until);
    setShowDndMenu(false);
  };

  const handleDndUntilTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    setDndUntil(tomorrow);
    setShowDndMenu(false);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/60 bg-surface/80 backdrop-blur-md px-4 md:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Left: Hamburger (mobile) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Center: Search bar — visible on md+ screens */}
      <div className="hidden md:flex flex-1 justify-center px-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 h-9 w-full max-w-md rounded-xl border border-border/60 bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted hover:border-border transition-colors"
        >
          <Search className="size-4 shrink-0" />
          <span>Rechercher...</span>
          <kbd className="ml-auto text-[10px] font-medium text-muted-foreground/60 bg-background rounded px-1.5 py-0.5 border border-border/40">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: DND + Notifications + User */}
      <div className="flex items-center gap-0.5">
        {/* DND toggle */}
        <div className="relative">
          <button
            onClick={toggleDnd}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowDndMenu(!showDndMenu);
            }}
            className={cn(
              "relative size-8 inline-flex items-center justify-center rounded-lg transition-colors",
              isDnd
                ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/15"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            title={
              isDnd ? "Desactiver Ne pas deranger" : "Activer Ne pas deranger"
            }
          >
            {isDnd ? (
              <MoonStar className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {isDnd && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full border-[1.5px] border-surface" />
            )}
          </button>

          {/* DND duration chevron */}
          <button
            onClick={() => setShowDndMenu(!showDndMenu)}
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center bg-surface border border-border text-muted-foreground hover:text-foreground transition-colors",
              showDndMenu && "text-foreground",
            )}
          >
            <ChevronDown className="w-2 h-2" />
          </button>

          {showDndMenu && (
            <div className="absolute top-full right-0 mt-1.5 w-48 bg-surface border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-foreground">
                  Ne pas deranger
                </p>
                {isDnd && dndUntil && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Actif jusqu&apos;a{" "}
                    {dndUntil.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDndDuration(1)}
                className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted transition-colors"
              >
                Pendant 1 heure
              </button>
              <button
                onClick={() => handleDndDuration(2)}
                className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted transition-colors"
              >
                Pendant 2 heures
              </button>
              <button
                onClick={() => handleDndDuration(4)}
                className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted transition-colors"
              >
                Pendant 4 heures
              </button>
              <button
                onClick={handleDndUntilTomorrow}
                className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted transition-colors"
              >
                Jusqu&apos;a demain 8h
              </button>
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={() => {
                    toggleDnd();
                    setShowDndMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                >
                  {isDnd ? "Desactiver" : "Activer indefiniment"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification bell */}
        <button
          onClick={() => setNotificationPanelOpen(true)}
          className="relative size-9 inline-flex items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground hover:shadow-sm"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && !isDnd && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#AF0000] px-1 text-[10px] font-semibold text-white shadow-[0_0_8px_rgba(175,0,0,0.3)] animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          {isDnd && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500/60 rounded-full" />
          )}
        </button>

        {/* User dropdown */}
        <DropdownMenu
          align="right"
          trigger={
            <button className="flex items-center gap-2 rounded-xl p-1 transition-all duration-200 hover:bg-muted hover:shadow-sm">
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name ?? "Utilisateur"}
                size="sm"
              />
            </button>
          }
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {profile?.full_name ?? "Utilisateur"}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.email ?? ""}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            icon={<User className="h-4 w-4" />}
            onClick={() => router.push("/settings")}
          >
            Mon profil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            icon={<LogOut className="h-4 w-4" />}
            destructive
            onClick={signOut}
          >
            Deconnexion
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
