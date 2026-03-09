import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOAuth2Client, GOOGLE_CALENDAR_SCOPES } from "@/lib/google-calendar";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const oauth2Client = createOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_CALENDAR_SCOPES,
    state: user.id,
  });

  return NextResponse.redirect(authUrl);
}
