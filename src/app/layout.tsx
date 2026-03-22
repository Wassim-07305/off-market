import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers/providers";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://off-market-amber.vercel.app",
  ),
  title: {
    default: "Off Market — Deviens le choix evident",
    template: "%s | Off Market",
  },
  description:
    "Sors du marche sature. Formation, coaching prive et communaute pour atteindre 10K EUR/mois en freelance.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Off Market — Deviens le choix evident",
    description:
      "Sors du marche sature. Formation, coaching prive et communaute pour atteindre 10K EUR/mois en freelance.",
    siteName: "Off Market",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Off Market — Deviens le choix evident",
    description:
      "Sors du marche sature. Formation, coaching prive et communaute pour atteindre 10K EUR/mois en freelance.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Off Market",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0A09",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <AnalyticsProvider />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Inter, system-ui, sans-serif",
              boxShadow:
                "0 4px 16px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.04)",
            },
          }}
        />
      </body>
    </html>
  );
}
