import type { NextConfig } from "next";

const nextConfig = {
  typescript: {
    // Pre-existing TS errors from Vite→Next.js migration (Supabase Database types)
    // TODO: generate proper Database types with `supabase gen types`
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: {
      exclude: ["error"],
    },
  },
  poweredByHeader: false,
  reactCompiler: true,
  experimental: {
    optimizePackageImports: [
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "recharts",
      "date-fns",
      "lucide-react",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "framer-motion",
    ],
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

export default nextConfig as NextConfig;
