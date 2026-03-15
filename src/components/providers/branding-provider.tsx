"use client";

import { useEffect, createContext, useContext, type ReactNode } from "react";
import {
  useBranding,
  colorVariants,
  type BrandingSettings,
} from "@/hooks/use-branding";

interface BrandingContextValue {
  branding: BrandingSettings | null;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextValue>({
  branding: null,
  isLoading: true,
});

export function useBrandingContext() {
  return useContext(BrandingContext);
}

const FONT_URLS: Record<string, string> = {
  Inter: "",
  Poppins:
    "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
  "DM Sans":
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
  "Plus Jakarta Sans":
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
  Outfit:
    "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap",
};

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { data: branding, isLoading } = useBranding();

  // Apply CSS variables when branding changes
  useEffect(() => {
    if (!branding) return;

    const root = document.documentElement;

    // Primary color (light mode)
    const lightPrimary = colorVariants(branding.primary_color);
    root.style.setProperty("--primary", lightPrimary.base);
    root.style.setProperty("--primary-hover", lightPrimary.hover);
    root.style.setProperty("--primary-light", lightPrimary.light);
    root.style.setProperty("--primary-soft", lightPrimary.soft);

    // Accent color (light mode)
    root.style.setProperty("--accent", branding.accent_color);

    // Border radius
    const radius = parseInt(branding.border_radius) || 12;
    root.style.setProperty("--radius-sm", `${Math.max(4, radius - 4)}px`);
    root.style.setProperty("--radius-md", `${radius}px`);
    root.style.setProperty("--radius-lg", `${radius + 4}px`);
    root.style.setProperty("--radius-xl", `${radius + 8}px`);
    root.style.setProperty("--radius-2xl", `${radius + 12}px`);

    // Font
    if (branding.font_family !== "Inter") {
      const fontUrl = FONT_URLS[branding.font_family];
      if (fontUrl) {
        const existingLink = document.querySelector(`link[data-branding-font]`);
        if (!existingLink) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = fontUrl;
          link.setAttribute("data-branding-font", "true");
          document.head.appendChild(link);
        }
      }
      root.style.setProperty(
        "--font-sans",
        `"${branding.font_family}", system-ui, sans-serif`,
      );
      document.body.style.fontFamily = `"${branding.font_family}", system-ui, sans-serif`;
    }

    // Favicon
    if (branding.favicon_url) {
      const favicon =
        document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favicon) {
        favicon.href = branding.favicon_url;
      }
    }

    // Dark mode overrides — apply via a style tag
    const darkStyleId = "branding-dark-overrides";
    let darkStyle = document.getElementById(
      darkStyleId,
    ) as HTMLStyleElement | null;
    if (!darkStyle) {
      darkStyle = document.createElement("style");
      darkStyle.id = darkStyleId;
      document.head.appendChild(darkStyle);
    }

    const darkPrimary = colorVariants(branding.primary_color_dark);
    darkStyle.textContent = `
      .dark {
        --primary: ${darkPrimary.base};
        --primary-hover: ${darkPrimary.hover};
        --primary-light: ${darkPrimary.light};
        --primary-soft: ${darkPrimary.soft};
        --accent: ${branding.accent_color_dark};
      }
    `;

    // Update page title
    if (branding.app_name !== "Off Market") {
      document.title = branding.app_name;
    }
  }, [branding]);

  return (
    <BrandingContext.Provider value={{ branding: branding ?? null, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
}
