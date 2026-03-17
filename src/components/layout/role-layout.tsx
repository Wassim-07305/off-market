"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { RoleSidebar } from "@/components/layout/role-sidebar";
import { Header } from "@/components/layout/header";
import { RoleMobileNav } from "@/components/layout/role-mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { GuidedTour } from "@/components/onboarding/guided-tour";
import { useGuidedTour } from "@/hooks/use-guided-tour";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { RoleVariant } from "@/lib/navigation";

interface RoleLayoutProps {
  variant: RoleVariant;
  children: React.ReactNode;
}

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-5 md:p-8">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-72 rounded bg-muted/60" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border/40 bg-surface"
          />
        ))}
      </div>
      <div className="h-64 rounded-2xl border border-border/40 bg-surface" />
    </div>
  );
}

export function RoleLayout({ variant, children }: RoleLayoutProps) {
  const { sidebarCollapsed } = useUIStore();
  const { loading } = useAuth();
  const tour = useGuidedTour(variant);
  const pathname = usePathname();

  // Gate: don't render page content until auth is ready
  // This prevents hooks from firing queries before the Supabase client has a valid session
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleSidebar variant={variant} />
      <div
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64",
        )}
      >
        <Header />
        <main className="flex-1 p-5 pb-24 md:p-8 lg:p-10 lg:pb-10 overflow-y-auto">
          <div className="mx-auto max-w-[1400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <RoleMobileNav variant={variant} />
      <CommandPalette />
      <NotificationPanel />

      {/* Guided tour overlay */}
      <GuidedTour
        isActive={tour.isActive}
        currentStep={tour.currentStep}
        currentStepIndex={tour.currentStepIndex}
        totalSteps={tour.totalSteps}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onSkip={tour.skipTour}
      />
    </div>
  );
}
