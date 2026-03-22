import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export interface ServerAuthData {
  user: User | null;
  profile: Profile | null;
}

/**
 * Fetch auth data on the server for layout bootstrap.
 * Uses React cache() so multiple calls in the same request are deduped.
 * Uses getSession() (cookie-based, no network call) instead of getUser().
 */
export const getServerAuth = cache(async (): Promise<ServerAuthData> => {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { user: null, profile: null };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    return { user: session.user, profile: profile ?? null };
  } catch {
    return { user: null, profile: null };
  }
});
