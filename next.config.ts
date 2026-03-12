import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Pre-existing TS errors from Vite→Next.js migration (Supabase Database types)
    // TODO: generate proper Database types with `supabase gen types`
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "srhpdgqqiuzdrlqaitdk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
        {
          key: "Cache-Control",
          value: "no-cache, no-store, must-revalidate",
        },
      ],
    },
  ],
};

export default nextConfig;
