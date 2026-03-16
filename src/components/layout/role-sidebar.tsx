"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";
import { PanelLeftClose, PanelLeft, LogOut, Settings } from "lucide-react";
import { type RoleVariant, getNavigationForRole } from "@/lib/navigation";
import { useBrandingContext } from "@/components/providers/branding-provider";

interface RoleSidebarProps {
  variant: RoleVariant;
}

export function RoleSidebar({ variant }: RoleSidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { profile, loading, signOut } = useAuth();
  const { branding } = useBrandingContext();

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

  // Map nav item names to data-tour attributes for guided tour
  const tourMap: Record<string, string> = {
    Dashboard: "dashboard",
    Formation: "school",
    Messagerie: "messaging",
    Feed: "community",
    "Check-in": "checkin",
    "Check-ins": "checkin",
    CRM: "crm",
    Clients: "clients",
    Appels: "calls",
    Facturation: "billing",
    Analytics: "analytics",
    Journal: "journal",
    Communaute: "community",
    Pipeline: "pipeline",
    Formulaires: "forms",
    "Assistant IA": "ai",
    Invitations: "invitations",
    Ressources: "resources",
    Recompenses: "rewards",
    Moderation: "moderation",
    Seances: "sessions",
    Alertes: "alerts",
    Disponibilites: "availability",
    Contrats: "contracts",
    Factures: "invoices",
    Objectifs: "goals",
    Certificats: "certificates",
    Progression: "progress",
    Defis: "challenges",
    Classement: "leaderboard",
    Roadmap: "roadmap",
    "Hall of Fame": "hall-of-fame",
    Reserver: "booking",
    Audit: "audit",
    "FAQ / Base IA": "faq",
    Upsell: "upsell",
    Calendrier: "calendar",
    "Equipe CSM": "csm",
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-40 hidden lg:flex",
        "bg-[#18181B]",
        sidebarCollapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "h-14 flex items-center px-3 shrink-0",
          sidebarCollapsed ? "justify-center" : "gap-2.5",
        )}
      >
        <Link
          href={`/${variant}/dashboard`}
          className="flex items-center gap-2.5 group"
        >
          <img
            src={branding?.logo_url || "/logo.png"}
            alt={branding?.app_name || "Off Market"}
            width={30}
            height={30}
            className="rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          {!sidebarCollapsed && (
            <span className="text-[15px] text-white font-display font-bold tracking-tight">
              {branding?.app_name || "Off Market"}
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-px overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          const showSeparator =
            (variant === "admin" && item.name === "Feed") ||
            (variant === "coach" && item.name === "Feed") ||
            (variant === "client" && item.name === "Feed");

          return (
            <div key={item.name}>
              {showSeparator && (
                <div className="my-2 mx-2 h-px bg-white/[0.06]" />
              )}
              <Link
                href={item.href}
                data-tour={tourMap[item.name]}
                className={cn(
                  "relative flex items-center gap-2.5 h-9 rounded-lg px-2.5 transition-colors duration-150 group",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06]",
                  sidebarCollapsed && "justify-center px-0",
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-[var(--primary,#AF0000)]" />
                )}
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors duration-150",
                    isActive
                      ? "text-white"
                      : "text-zinc-500 group-hover:text-white",
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="text-[13px] font-medium truncate">
                    {item.name}
                  </span>
                )}
                {/* Tooltip when collapsed */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 hidden lg:group-hover:block pointer-events-none z-50">
                    <div className="bg-zinc-800 rounded-md px-2 py-1 text-xs font-medium text-white shadow-lg whitespace-nowrap border border-zinc-700">
                      {item.name}
                    </div>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Collapse button — desktop only */}
      <div className="border-t border-white/[0.06] px-2 py-1.5 shrink-0 hidden lg:block">
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full h-8 rounded-lg flex items-center gap-2.5 transition-colors duration-150 text-zinc-400 hover:text-white hover:bg-white/[0.06]",
            sidebarCollapsed ? "justify-center px-0" : "px-2.5",
          )}
          title={sidebarCollapsed ? "Ouvrir le menu" : "Reduire le menu"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span className="text-[13px] font-medium">Reduire</span>
            </>
          )}
        </button>
      </div>

      {/* Profile section */}
      <div className="border-t border-white/[0.06] p-2 shrink-0 space-y-px">
        {/* Avatar + info */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <div className="relative shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? ""}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-[11px] text-zinc-300 font-semibold">
                {loading ? "..." : initials || "U"}
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#18181B]" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate leading-tight">
                {loading
                  ? "Chargement..."
                  : (profile?.full_name ?? "Mon profil")}
              </p>
              <p className="text-[11px] text-zinc-500 capitalize truncate">
                {roleLabel}
              </p>
            </div>
          )}
          {/* Tooltip when collapsed */}
          {sidebarCollapsed && (
            <div className="absolute left-full ml-2 hidden lg:group-hover:block pointer-events-none z-50">
              <div className="bg-zinc-800 rounded-md px-2 py-1 text-xs font-medium text-white shadow-lg whitespace-nowrap border border-zinc-700">
                {profile?.full_name ?? "Mon profil"}
              </div>
            </div>
          )}
        </div>

        {/* Paramètres */}
        <Link
          href={settingsHref}
          className={cn(
            "flex items-center gap-2.5 h-8 rounded-lg px-2.5 transition-colors duration-150 text-zinc-400 hover:text-white hover:bg-white/[0.06]",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-[13px] font-medium">Paramètres</span>
          )}
        </Link>

        {/* Déconnexion */}
        <button
          onClick={signOut}
          className={cn(
            "w-full flex items-center gap-2.5 h-8 rounded-lg px-2.5 transition-colors duration-150 text-zinc-400 hover:text-red-400 hover:bg-red-500/10",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-[13px] font-medium">Déconnexion</span>
          )}
        </button>
      </div>
    </aside>
  );
}
