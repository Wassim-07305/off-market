import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOAuth2Client } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // user.id

  if (!code || !state) {
    return redirectToSettings(request, "error", "admin");
  }

  // Verify the authenticated user matches the state parameter
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== state) {
    return redirectToSettings(request, "error", "admin");
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get Google email
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    const googleEmail = userInfo.email ?? null;

    // Store tokens in DB via admin client (bypasses RLS)
    const admin = createAdminClient();
    const { error } = await admin.from("google_calendar_tokens").upsert(
      {
        user_id: state,
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token ?? null,
        expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("Failed to store Google Calendar tokens:", error);
      return redirectToSettings(request, "error", "admin");
    }

    // Get user's role for redirect
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", state)
      .single();

    const role = profile?.role ?? "admin";
    return redirectToSettings(request, "success", role);
  } catch (err) {
    console.error("Google Calendar OAuth callback error:", err);
    return redirectToSettings(request, "error", "admin");
  }
}

function redirectToSettings(
  request: NextRequest,
  status: "success" | "error",
  role: string,
) {
  const base = new URL(request.url).origin;
  const prefix = role === "setter" || role === "closer" ? "sales" : role;
  return NextResponse.redirect(`${base}/${prefix}/settings?google=${status}`);
}
