"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";
import {
  type RoleVariant,
  getNavigationForRole,
  getMobileNavForRole,
} from "@/lib/navigation";
import { X, Settings, LogOut } from "lucide-react";

interface RoleMobileNavProps {
  variant: RoleVariant;
}

export function RoleMobileNav({ variant }: RoleMobileNavProps) {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { profile, loading, signOut } = useAuth();

  const bottomItems = getMobileNavForRole(variant);
  const allItems = getNavigationForRole(variant);
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
    <>
      {/* Sidebar overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar panel */}
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-[var(--sidebar-bg)] flex flex-col animate-in slide-in-from-left duration-300 lg:hidden">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 shrink-0">
              <Link
                href={`/${variant}/dashboard`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <img
                  src="/logo.png"
                  alt="Off Market"
                  width={34}
                  height={34}
                  className="rounded-xl"
                />
                <span className="text-lg text-[var(--sidebar-text-active)] font-display font-bold tracking-tight">
                  Off Market
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-white/[0.06] transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
              {allItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");

                const showSeparator =
                  item.name === "Reglages" ||
                  item.name === "Feed";

                return (
                  <div key={item.name}>
                    {showSeparator && (
                      <div className="my-2 mx-3 h-px bg-white/[0.06]" />
                    )}
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 h-10 rounded-xl px-3 transition-all duration-200",
                        isActive
                          ? "bg-primary/[0.08] text-[var(--sidebar-text-active)]"
                          : "text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-white/[0.04]"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary shadow-[0_0_8px_rgba(196,30,58,0.4)]" />
                      )}
                      <item.icon
                        className={cn(
                          "w-[18px] h-[18px] shrink-0",
                          isActive
                            ? "text-primary drop-shadow-[0_0_6px_rgba(196,30,58,0.3)]"
                            : ""
                        )}
                      />
                      <span className="text-[13px] font-medium truncate">
                        {item.name}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* Profile section */}
            <div className="border-t border-white/[0.05] p-3 shrink-0">
              <div className="flex items-center gap-3">
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
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[var(--sidebar-bg)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate leading-tight">
                    {loading ? "Chargement..." : profile?.full_name ?? "Mon profil"}
                  </p>
                  <p className="text-xs text-stone-500 capitalize truncate mt-0.5">
                    {roleLabel}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={settingsHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-white/[0.06] transition-all duration-200"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Bottom tab bar — quick nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/90 backdrop-blur-xl border-t border-border/50">
        <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
          {bottomItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:scale-95"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                />
                <span className="text-[10px] font-medium tracking-tight">
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
