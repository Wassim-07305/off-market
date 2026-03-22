import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

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

        const admin = createAdminClient();

        // Fetch profile to determine role and onboarding status
        let { data: profile } = await admin
          .from("profiles")
          .select("id, role, onboarding_completed")
          .eq("id", user.id)
          .single();

        // If no profile exists (new SSO user), create one
        if (!profile) {
          const fullName =
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split("@")[0] ??
            "Utilisateur";

          await admin.from("profiles").upsert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            role: "client",
            onboarding_completed: false,
          }, { onConflict: "id" });

          return NextResponse.redirect(`${origin}/onboarding`);
        }

        // If profile exists but role is missing/wrong, ensure it's set
        if (!profile.role) {
          await admin
            .from("profiles")
            .update({ role: "client" })
            .eq("id", user.id);
          profile = { ...profile, role: "client" };
        }

        // Clear middleware cache to force re-fetch
        const response = NextResponse.redirect(
          profile.onboarding_completed
            ? `${origin}${getRoleDashboard(profile.role)}`
            : `${origin}/onboarding`
        );
        response.cookies.delete("om_profile_cache");
        return response;
      }

      return NextResponse.redirect(`${origin}/login`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

function getRoleDashboard(role: string | null): string {
  const map: Record<string, string> = {
    admin: "/admin/dashboard",
    coach: "/coach/dashboard",
    client: "/client/dashboard",
    prospect: "/client/dashboard",
    setter: "/sales/dashboard",
    closer: "/sales/dashboard",
  };
  return map[role ?? "client"] ?? "/client/dashboard";
}
