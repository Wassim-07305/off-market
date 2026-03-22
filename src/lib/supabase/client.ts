"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-based storage adapter so the Supabase session is shared
 * between the client (@supabase/supabase-js) and the middleware (@supabase/ssr).
 * Without this, signOut clears localStorage but the middleware still sees cookies.
 */
const cookieStorage = {
  getItem(key: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`));
    if (!match) return null;
    let value = decodeURIComponent(match.split("=").slice(1).join("="));
    // Handle base64-encoded session from @supabase/ssr middleware
    if (value.startsWith("base64-")) {
      try {
        value = atob(value.slice(7));
      } catch {
        // If decoding fails, return as-is
      }
    }
    return value;
  },
  setItem(key: string, value: string): void {
    if (typeof document === "undefined") return;
    // Set cookie with 1 year expiry, matching Supabase defaults
    const maxAge = 365 * 24 * 60 * 60;
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  },
  removeItem(key: string): void {
    if (typeof document === "undefined") return;
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  },
};

let client: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (client) return client;
  client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: cookieStorage,
        flowType: "pkce",
        // Disable navigator.locks — prevents getSession() from hanging
        // when the lock gets orphaned during HMR or page transitions
        lock: async <R>(
          name: string,
          acquireTimeout: number,
          fn: () => Promise<R>,
        ): Promise<R> => {
          return await fn();
        },
      },
    },
  );
  return client;
}
