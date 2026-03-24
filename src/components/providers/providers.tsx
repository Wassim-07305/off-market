"use client";

import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { WalkthroughProvider } from "@/components/onboarding/walkthrough-provider";
import { BrandingProvider } from "@/components/providers/branding-provider";
import { logError } from "@/lib/error-logger";
import { IncomingCallToast } from "@/components/calls/video-room/incoming-call-toast";
import { RgpdConsentBanner } from "@/components/shared/rgpd-consent-banner";
import { GamificationProvider } from "@/components/providers/gamification-provider";
import { ErrorMonitoringProvider } from "@/components/providers/error-monitoring-provider";
import { LazyMotion, domAnimation } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

interface ProvidersProps {
  children: React.ReactNode;
  initialUser?: User | null;
  initialProfile?: Profile | null;
}

export function Providers({
  children,
  initialUser,
  initialProfile,
}: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes — data stays fresh
            gcTime: 30 * 60 * 1000, // 30 minutes — cache kept in memory
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1, // Retry once on failure (covers aborted requests)
            placeholderData: keepPreviousData, // Show cached data immediately — no skeleton flash on return navigation
          },
          mutations: {
            onError: (error: Error) => {
              logError({
                message: error.message || "Mutation error",
                stack: error.stack,
                source: "manual",
                severity: "error",
                page: typeof window !== "undefined" ? window.location.pathname : undefined,
                metadata: { source: "react-query-mutation" },
              });
            },
          },
        },
      }),
  );

  return (
    <ErrorMonitoringProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <LazyMotion features={domAnimation}>
            <BrandingProvider>
              <AuthProvider initialUser={initialUser} initialProfile={initialProfile}>
                <WalkthroughProvider>
                  {children}
                  <GamificationProvider />
                  <IncomingCallToast />
                  <RgpdConsentBanner />
                </WalkthroughProvider>
              </AuthProvider>
            </BrandingProvider>
          </LazyMotion>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorMonitoringProvider>
  );
}
