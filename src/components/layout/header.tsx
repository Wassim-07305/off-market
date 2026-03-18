"use client";

import { Bell, User, LogOut, Menu, Moon, Sun, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
import { useNotificationStore } from "@/stores/notification-store";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { setMobileMenuOpen, setNotificationPanelOpen, setCommandPaletteOpen } =
    useUIStore();
  const { unreadCount } = useNotificationStore();
  const prefix = useRoutePrefix();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-sm md:px-6">
      {/* Left: Hamburger (mobile) + Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Breadcrumb />
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
        {/* Theme toggle (clair / sombre) */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={theme === "dark" ? "Mode clair" : "Mode sombre"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Notification bell */}
        <button
          onClick={() => setNotificationPanelOpen(true)}
          className="relative size-9 inline-flex items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground hover:shadow-sm"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#AF0000] px-1 text-[10px] font-semibold text-white shadow-[0_0_8px_rgba(175,0,0,0.3)] animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
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
            onClick={() => router.push(`${prefix}/settings`)}
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
