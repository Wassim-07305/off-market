"use client";

import { Bell, User, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
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
  const router = useRouter();

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

      {/* Right: Shortcuts + Notifications + User */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <button
          onClick={() => setNotificationPanelOpen(true)}
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
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
