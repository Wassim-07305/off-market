"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
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
    Finances: "finances",
    Journal: "journal",
    Communaute: "community",
    Pipeline: "pipeline",
    Formulaires: "forms",
    AlexIA: "ai",
    Invitations: "invitations",
    Ressources: "resources",
    Recompenses: "rewards",
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
    Calendrier: "calendar",
    Equipe: "csm",
    "Closer Calls": "closer-calls",
    Documents: "documents",
    Suivi: "suivi",
    Commissions: "commissions",
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-40 hidden lg:flex",
        "bg-gradient-to-b from-[#0C0E10] to-[#1A1D24] border-r border-white/[0.04]",
        sidebarCollapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/5 px-5 shrink-0",
          sidebarCollapsed ? "justify-center px-0" : "",
        )}
      >
        <Link
          href={`/${variant}/dashboard`}
          className="flex items-center gap-3 group"
        >
          <Image
            src="/logo.png"
            alt={branding?.app_name || "Off Market"}
            width={36}
            height={36}
            className="shrink-0 rounded-lg transition-transform duration-200 group-hover:scale-105"
          />
          {!sidebarCollapsed && (
            <span className="text-[15px] text-white font-bold tracking-tight">
              {branding?.app_name || "Off Market"}
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-2 pb-4 px-3 space-y-px overflow-y-auto">
        {navigation.map((item, idx) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const isFirstSection = item.section && idx === 0;

          return (
            <div key={item.name}>
              {item.section && (
                <>
                  {!isFirstSection && (
                    <div className="my-2 mx-2 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  )}
                  {!sidebarCollapsed && (
                    <div
                      className={cn(
                        "px-3 pb-1.5",
                        isFirstSection ? "pt-0" : "pt-0.5",
                      )}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                        {item.section}
                      </span>
                    </div>
                  )}
                </>
              )}
              <Link
                href={item.href}
                onMouseEnter={() => router.prefetch(item.href)}
                data-tour={tourMap[item.name]}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-[#AF0000]/15 text-white shadow-[inset_0_0_12px_rgba(175,0,0,0.08)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06]",
                  sidebarCollapsed && "justify-center px-0",
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#AF0000] shadow-[0_0_8px_rgba(175,0,0,0.4)]" />
                )}
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-all duration-200",
                    isActive
                      ? "text-[#DC2626]"
                      : "text-zinc-500 group-hover:text-zinc-200",
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
      <div className="border-t border-white/[0.04] px-2 py-1.5 shrink-0 hidden lg:block">
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
      <div className="border-t border-white/5 px-3 py-4 shrink-0">
        {/* Avatar + info */}
        <div
          className={cn(
            "flex items-center rounded-xl px-3 py-2.5",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600/20 to-blue-500/10 text-xs font-semibold text-blue-300 ring-2 ring-blue-600/10">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name ?? ""}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : loading ? (
                "..."
              ) : (
                initials || "U"
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0C0E10]" />
          </div>
          <div
            className={cn("ml-3 min-w-0 flex-1", sidebarCollapsed && "hidden")}
          >
            <p className="truncate text-sm font-semibold text-white">
              {loading
                ? "Chargement..."
                : (profile?.full_name ?? "Utilisateur")}
            </p>
            <p className="truncate text-xs text-slate-500 capitalize">
              {roleLabel}
            </p>
          </div>
        </div>

        {/* Paramètres */}
        <Link
          href={settingsHref}
          onMouseEnter={() => router.prefetch(settingsHref)}
          className={cn(
            "mt-1 flex w-full items-center rounded-xl px-3 py-2 text-sm transition-all duration-200 text-slate-500 hover:bg-white/[0.06] hover:text-slate-300",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <Settings
            className={cn(
              "h-[18px] w-[18px] shrink-0",
              sidebarCollapsed ? "" : "mr-3",
            )}
          />
          <span className={cn(sidebarCollapsed && "hidden")}>Paramètres</span>
        </Link>

        {/* Déconnexion */}
        <button
          onClick={signOut}
          className={cn(
            "mt-1 flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <LogOut
            className={cn(
              "h-[18px] w-[18px] shrink-0",
              sidebarCollapsed ? "" : "mr-3",
            )}
          />
          <span className={cn(sidebarCollapsed && "hidden")}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
