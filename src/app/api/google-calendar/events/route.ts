import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOAuth2Client } from "@/lib/google-calendar";
import type { GoogleCalendarEvent } from "@/types/google-calendar";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const timeMin = searchParams.get("timeMin");
  const timeMax = searchParams.get("timeMax");

  if (!timeMin || !timeMax) {
    return NextResponse.json(
      { error: "timeMin et timeMax requis" },
      { status: 400 },
    );
  }

  // Fetch user's tokens
  const { data: tokenRow, error: tokenError } = await supabase
    .from("google_calendar_tokens")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (tokenError || !tokenRow) {
    return NextResponse.json(
      { error: "Google Calendar non connecte" },
      { status: 404 },
    );
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokenRow.access_token,
    refresh_token: tokenRow.refresh_token,
    expiry_date: tokenRow.expires_at
      ? new Date(tokenRow.expires_at).getTime()
      : undefined,
  });

  // Listen for token refresh events to persist new tokens
  oauth2Client.on("tokens", async (newTokens) => {
    const admin = createAdminClient();
    await admin
      .from("google_calendar_tokens")
      .update({
        access_token: newTokens.access_token ?? tokenRow.access_token,
        expires_at: newTokens.expiry_date
          ? new Date(newTokens.expiry_date).toISOString()
          : tokenRow.expires_at,
        ...(newTokens.refresh_token
          ? { refresh_token: newTokens.refresh_token }
          : {}),
      })
      .eq("user_id", user.id);
  });

  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: tokenRow.calendar_id ?? "primary",
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 100,
    });

    const events: GoogleCalendarEvent[] = (response.data.items ?? [])
      .filter((item) => item.status !== "cancelled")
      .map((item) => ({
        id: item.id ?? "",
        title: item.summary ?? "(Sans titre)",
        description: item.description ?? null,
        start: item.start?.dateTime ?? item.start?.date ?? "",
        end: item.end?.dateTime ?? item.end?.date ?? "",
        allDay: !item.start?.dateTime,
        location: item.location ?? null,
        htmlLink: item.htmlLink ?? "",
        status: (item.status as GoogleCalendarEvent["status"]) ?? "confirmed",
        color: item.colorId ?? null,
      }));

    return NextResponse.json({ events });
  } catch (err: unknown) {
    // If token is revoked/invalid, deactivate
    const isAuthError =
      err instanceof Error &&
      "code" in err &&
      (err as { code: number }).code === 401;
    if (isAuthError) {
      const admin = createAdminClient();
      await admin
        .from("google_calendar_tokens")
        .delete()
        .eq("user_id", user.id);
      return NextResponse.json(
        { error: "Token Google revoque. Veuillez reconnecter." },
        { status: 401 },
      );
    }
    console.error("Google Calendar events fetch error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des événements" },
      { status: 500 },
    );
  }
}
