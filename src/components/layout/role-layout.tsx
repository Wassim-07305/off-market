"use client";

import { RoleSidebar } from "@/components/layout/role-sidebar";
import { Header } from "@/components/layout/header";
import { RoleMobileNav } from "@/components/layout/role-mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { RoleVariant } from "@/lib/navigation";

interface RoleLayoutProps {
  variant: RoleVariant;
  children: React.ReactNode;
}

export function RoleLayout({ variant, children }: RoleLayoutProps) {
  const { sidebarCollapsed } = useUIStore();
  const { loading } = useAuth();

  // Gate: don't render page content until auth is ready
  // This prevents hooks from firing queries before the Supabase client has a valid session
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleSidebar variant={variant} />
      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        <Header />
        <main className="p-6 pb-24 lg:pb-6">{children}</main>
      </div>
      <RoleMobileNav variant={variant} />
      <CommandPalette />
      <NotificationPanel />
    </div>
  );
}
