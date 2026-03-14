"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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
