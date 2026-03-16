"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import { useBrandingContext } from "@/components/providers/branding-provider";
import { colorVariants } from "@/hooks/use-branding";

interface BrandedAuthLayoutProps {
  children: ReactNode;
}

export function BrandedAuthLayout({ children }: BrandedAuthLayoutProps) {
  const { branding, isLoading } = useBrandingContext();

  const appName = branding?.app_name ?? "Off Market";
  const logoUrl = branding?.logo_url;
  const tagline = branding?.tagline;
  const primaryColor = branding?.primary_color ?? "#DC2626";
  const authBgUrl = branding?.auth_background_url;
  const variants = colorVariants(primaryColor);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A09]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0C0A09]">
      {/* Left panel — branding showcase */}
      <div
        className="relative hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col items-center justify-center p-12 overflow-hidden"
        style={{
          background: authBgUrl
            ? `url(${authBgUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}08 50%, transparent 100%)`,
        }}
      >
        {/* Gradient overlay when using background image */}
        {authBgUrl && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        )}

        {/* Decorative gradient orbs */}
        {!authBgUrl && (
          <>
            <div
              className="absolute -top-1/3 -left-1/4 w-[60%] h-[60%] rounded-full blur-[120px] opacity-20"
              style={{ background: primaryColor }}
            />
            <div
              className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full blur-[100px] opacity-15"
              style={{ background: primaryColor }}
            />
          </>
        )}

        <div className="relative z-10 text-center max-w-md">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={appName}
              width={96}
              height={96}
              className="mx-auto mb-8 rounded-2xl object-contain"
              style={{ filter: `drop-shadow(0 0 30px ${variants.base}40)` }}
            />
          ) : (
            <Image
              src="/logo.png"
              alt="Off Market"
              width={96}
              height={96}
              className="mx-auto mb-8 rounded-2xl"
              style={{ filter: "drop-shadow(0 0 30px rgba(196, 30, 58, 0.3))" }}
            />
          )}

          <h1 className="text-4xl xl:text-5xl text-white font-display font-bold tracking-tight mb-3">
            {appName}
          </h1>

          {tagline && (
            <p className="text-white/50 text-lg leading-relaxed">{tagline}</p>
          )}

          {/* Decorative dots */}
          <div className="flex items-center justify-center gap-1.5 mt-10">
            {[0.6, 1, 0.6].map((opacity, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: primaryColor, opacity }}
              />
            ))}
          </div>
        </div>

        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Mobile branded header */}
      <div
        className="lg:hidden p-6 pb-2 text-center"
        style={{
          background: `linear-gradient(180deg, ${primaryColor}10 0%, transparent 100%)`,
        }}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={appName}
            width={56}
            height={56}
            className="mx-auto mb-3 rounded-xl object-contain"
          />
        ) : (
          <Image
            src="/logo.png"
            alt="Off Market"
            width={56}
            height={56}
            className="mx-auto mb-3 rounded-xl"
            style={{ filter: "drop-shadow(0 0 16px rgba(196, 30, 58, 0.3))" }}
          />
        )}
        <h1 className="text-2xl text-white font-display font-bold tracking-tight">
          {appName}
        </h1>
        {tagline && <p className="text-white/40 text-sm mt-1">{tagline}</p>}
      </div>

      {/* Right panel — form content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-1/2 -right-1/3 w-[70%] h-[70%] rounded-full blur-[120px] opacity-20"
            style={{
              background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
              animation: "float 8s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -bottom-1/3 -left-1/4 w-[50%] h-[50%] rounded-full blur-[100px] opacity-15"
            style={{
              background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
              animation: "float 10s ease-in-out infinite reverse",
            }}
          />
        </div>

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative w-full max-w-[420px] z-10">{children}</div>
      </div>
    </div>
  );
}
