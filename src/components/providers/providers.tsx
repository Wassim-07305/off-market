"use client";

import {
  keepPreviousData,
  QueryCache,
  MutationCache,
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
import { usePresence } from "@/hooks/usePresence";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

function PresenceTracker() {
  usePresence();
  return null;
}

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
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Only log query errors that are not retried (final failure)
            if (query.state.fetchFailureCount > 1) return;
            logError({
              message: error.message || "Query error",
              stack: error instanceof Error ? error.stack : undefined,
              source: "api-error",
              severity: "error",
              page: typeof window !== "undefined" ? window.location.pathname : undefined,
              metadata: {
                source: "react-query",
                queryKey: JSON.stringify(query.queryKey).slice(0, 200),
              },
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            logError({
              message: error.message || "Mutation error",
              stack: error instanceof Error ? error.stack : undefined,
              source: "manual",
              severity: "error",
              page: typeof window !== "undefined" ? window.location.pathname : undefined,
              metadata: {
                source: "react-query-mutation",
                mutationKey: mutation.options.mutationKey
                  ? JSON.stringify(mutation.options.mutationKey).slice(0, 200)
                  : undefined,
              },
            });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes — data stays fresh
            gcTime: 30 * 60 * 1000, // 30 minutes — cache kept in memory
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1, // Retry once on failure (covers aborted requests)
            placeholderData: keepPreviousData, // Show cached data immediately — no skeleton flash on return navigation
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
                  <PresenceTracker />
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
