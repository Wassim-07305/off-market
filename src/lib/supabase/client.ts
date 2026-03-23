"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Fetch wrapper with a 15-second timeout to prevent hung requests */
const fetchWithTimeout: typeof fetch = (input, init) => {
  // Combine any existing signal with a 15s timeout
  const timeoutSignal = AbortSignal.timeout(15_000);
  const existingSignal = init?.signal;
  const signal =
    existingSignal && typeof AbortSignal.any === "function"
      ? AbortSignal.any([existingSignal, timeoutSignal])
      : timeoutSignal;
  return fetch(input, { ...init, signal });
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithTimeout,
      },
    },
  );
}
