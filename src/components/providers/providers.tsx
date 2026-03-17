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
import { IncomingCallToast } from "@/components/calls/video-room/incoming-call-toast";
import { RgpdConsentBanner } from "@/components/shared/rgpd-consent-banner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // 10 minutes — data stays fresh
            gcTime: 30 * 60 * 1000, // 30 minutes — cache kept in memory
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch when component remounts (navigation)
            refetchOnReconnect: false,
            placeholderData: keepPreviousData, // Show cached data immediately — no skeleton flash on return navigation
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <BrandingProvider>
          <AuthProvider>
            <WalkthroughProvider>
              {children}
              <IncomingCallToast />
              <RgpdConsentBanner />
            </WalkthroughProvider>
          </AuthProvider>
        </BrandingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
