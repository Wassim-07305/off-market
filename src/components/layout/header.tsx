"use client";

import { useState } from "react";
import { Bell, User, LogOut, Menu, Moon, MoonStar, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
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
  const { setMobileMenuOpen, setNotificationPanelOpen } = useUIStore();
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
    <header className="flex h-14 items-center justify-between border-b border-border/40 bg-surface px-4 md:px-6">
      {/* Left: Hamburger (mobile) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right: Shortcuts + DND + Notifications + User */}
      <div className="flex items-center gap-1">
        {/* DND toggle */}
        <div className="relative">
          <button
            onClick={toggleDnd}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowDndMenu(!showDndMenu);
            }}
            className={cn(
              "relative rounded-lg p-2 transition-colors",
              isDnd
                ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/15"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            title={isDnd ? "Desactiver Ne pas deranger" : "Activer Ne pas deranger"}
          >
            {isDnd ? <MoonStar className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {isDnd && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-surface" />
            )}
          </button>

          {/* DND dropdown for duration */}
          <button
            onClick={() => setShowDndMenu(!showDndMenu)}
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center bg-surface border border-border/60 text-muted-foreground hover:text-foreground transition-colors",
              showDndMenu && "text-foreground",
            )}
          >
            <ChevronDown className="w-2.5 h-2.5" />
          </button>

          {showDndMenu && (
            <div className="absolute top-full right-0 mt-1.5 w-52 bg-surface border border-border/60 rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-border/30">
                <p className="text-xs font-semibold text-foreground">Ne pas deranger</p>
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
                className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted/60 transition-colors"
              >
                Pendant 1 heure
              </button>
              <button
                onClick={() => handleDndDuration(2)}
                className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted/60 transition-colors"
              >
                Pendant 2 heures
              </button>
              <button
                onClick={() => handleDndDuration(4)}
                className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted/60 transition-colors"
              >
                Pendant 4 heures
              </button>
              <button
                onClick={handleDndUntilTomorrow}
                className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted/60 transition-colors"
              >
                Jusqu&apos;a demain 8h
              </button>
              <div className="border-t border-border/30 mt-1 pt-1">
                <button
                  onClick={() => {
                    toggleDnd();
                    setShowDndMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
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
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {isDnd && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500/60 rounded-full" />
          )}
        </button>

        {/* User dropdown */}
        <DropdownMenu
          align="right"
          trigger={
            <button className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-secondary">
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
