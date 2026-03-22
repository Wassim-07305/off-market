import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // If this is a password recovery flow, redirect to reset password page
        if (type === "recovery") {
          return NextResponse.redirect(`${origin}/reset-password`);
        }

        // Fetch profile to determine role and onboarding status
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role, onboarding_completed")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // New user from SSO — redirect to onboarding
          return NextResponse.redirect(`${origin}/onboarding`);
        }

        // If onboarding not completed, go to onboarding
        if (!profile.onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }

        // Redirect to the correct dashboard based on role
        const rolePrefixes: Record<string, string> = {
          admin: "/admin/dashboard",
          coach: "/coach/dashboard",
          client: "/client/dashboard",
          prospect: "/client/dashboard",
          setter: "/sales/dashboard",
          closer: "/sales/dashboard",
        };
        const destination = rolePrefixes[profile.role ?? "client"] ?? "/client/dashboard";
        return NextResponse.redirect(`${origin}${destination}`);
      }

      return NextResponse.redirect(`${origin}/login`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
