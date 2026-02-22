"use client";

import { RoleSidebar } from "@/components/layout/role-sidebar";
import { Header } from "@/components/layout/header";
import { RoleMobileNav } from "@/components/layout/role-mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import type { RoleVariant } from "@/lib/navigation";

interface RoleLayoutProps {
  variant: RoleVariant;
  children: React.ReactNode;
}

export function RoleLayout({ variant, children }: RoleLayoutProps) {
  const { sidebarCollapsed } = useUIStore();

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
    </div>
  );
}
