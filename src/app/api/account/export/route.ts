import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// RGPD Article 20: Right to data portability
// Returns all personal data for the authenticated user as JSON

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const userId = user.id;

  // Fetch all user data in parallel
  const [
    profileRes,
    messagesRes,
    checkinsRes,
    goalsRes,
    journalRes,
    sessionsRes,
    xpRes,
    badgesRes,
    notificationsRes,
    preferencesRes,
    consentsRes,
    feedRes,
    invoicesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("messages")
      .select("id, content, created_at, channel_id")
      .eq("sender_id", userId)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("weekly_checkins")
      .select("*")
      .eq("client_id", userId)
      .order("week_start", { ascending: false }),
    supabase
      .from("coaching_goals")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("journal_entries")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("sessions")
      .select(
        "id, title, session_type, scheduled_at, duration_minutes, status, notes",
      )
      .or(`client_id.eq.${userId},coach_id.eq.${userId}`)
      .order("scheduled_at", { ascending: false }),
    supabase
      .from("xp_transactions")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_badges")
      .select("*, badge:badges(name, description)")
      .eq("profile_id", userId),
    supabase
      .from("notifications")
      .select("id, type, title, body, category, is_read, created_at")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_consents" as never)
      .select("*" as never)
      .eq("user_id" as never, userId as never),
    supabase
      .from("feed_posts")
      .select("id, content, created_at")
      .eq("author_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, invoice_number, amount, status, due_date, created_at")
      .eq("client_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const exportData = {
    _meta: {
      exported_at: new Date().toISOString(),
      user_id: userId,
      user_email: user.email,
      format: "RGPD_EXPORT_V1",
    },
    profile: profileRes.data,
    preferences: preferencesRes.data,
    consents: consentsRes.data ?? [],
    messages: messagesRes.data ?? [],
    weekly_checkins: checkinsRes.data ?? [],
    coaching_goals: goalsRes.data ?? [],
    journal_entries: journalRes.data ?? [],
    sessions: sessionsRes.data ?? [],
    xp_transactions: xpRes.data ?? [],
    badges: badgesRes.data ?? [],
    notifications: notificationsRes.data ?? [],
    feed_posts: feedRes.data ?? [],
    invoices: invoicesRes.data ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="off-market-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
