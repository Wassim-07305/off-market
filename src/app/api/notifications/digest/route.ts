import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/send";
import { digestEmail } from "@/lib/email/templates";

// This route is designed to be called by a cron job (Vercel Cron or external)
// It sends digest emails to users based on their email_digest preference

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://offmarket.app";

export async function POST(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { type = "daily" } = await request.json().catch(() => ({ type: "daily" }));

  if (type !== "daily" && type !== "weekly") {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  // Use service role to access all users
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Config manquante" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Get users with matching digest preference
    const { data: preferences, error: prefError } = await supabase
      .from("user_preferences")
      .select("user_id, email_digest")
      .eq("email_digest", type);

    if (prefError) throw prefError;
    if (!preferences || preferences.length === 0) {
      return NextResponse.json({ sent: 0, message: "Aucun utilisateur avec ce digest" });
    }

    const userIds = preferences.map((p: { user_id: string }) => p.user_id);

    // Get profiles for these users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("id", userIds);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const now = new Date();
    const periodStart = new Date(now);
    if (type === "weekly") {
      periodStart.setDate(periodStart.getDate() - 7);
    } else {
      periodStart.setDate(periodStart.getDate() - 1);
    }
    const periodISO = periodStart.toISOString();

    let sentCount = 0;
    const errors: string[] = [];

    for (const profile of profiles) {
      try {
        // Count notifications for this user in the period
        const { count: notifCount } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", profile.id)
          .gte("created_at", periodISO);

        // Count unread messages
        const { count: msgCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .neq("sender_id", profile.id)
          .gte("created_at", periodISO);

        // Count upcoming sessions
        const { count: sessionCount } = await supabase
          .from("sessions")
          .select("*", { count: "exact", head: true })
          .or(`client_id.eq.${profile.id},coach_id.eq.${profile.id}`)
          .eq("status", "scheduled")
          .gte("scheduled_at", now.toISOString());

        // Sum XP earned in period
        const { data: xpData } = await supabase
          .from("xp_transactions")
          .select("xp_amount")
          .eq("profile_id", profile.id)
          .gte("created_at", periodISO);

        const xpEarned = (xpData ?? []).reduce(
          (sum: number, t: { xp_amount: number }) => sum + t.xp_amount,
          0,
        );

        // Build highlights
        const highlights: string[] = [];
        if ((notifCount ?? 0) > 5) {
          highlights.push(`${notifCount} nouvelles notifications cette periode`);
        }
        if (xpEarned > 0) {
          highlights.push(`Tu as gagne ${xpEarned} XP — continue comme ca !`);
        }
        if ((sessionCount ?? 0) > 0) {
          highlights.push(
            `${sessionCount} seance${(sessionCount ?? 0) > 1 ? "s" : ""} de coaching a venir`,
          );
        }

        const periodLabel = type === "weekly" ? "de la semaine" : "du jour";
        const rolePrefix =
          profile.role === "admin" || profile.role === "coach"
            ? `/${profile.role}`
            : profile.role === "setter" || profile.role === "closer"
              ? "/sales"
              : "/client";

        const { subject, html } = digestEmail({
          userName: profile.full_name?.split(" ")[0] ?? "Utilisateur",
          period: periodLabel,
          stats: {
            newNotifications: notifCount ?? 0,
            unreadMessages: msgCount ?? 0,
            upcomingSessions: sessionCount ?? 0,
            xpEarned,
          },
          highlights,
          dashboardUrl: `${SITE_URL}${rolePrefix}/dashboard`,
        });

        const result = await sendEmail({
          to: profile.email,
          subject,
          html,
        });

        if (result.success) {
          sentCount++;
        } else {
          errors.push(`${profile.email}: ${result.error}`);
        }
      } catch (err) {
        errors.push(`${profile.email}: ${err}`);
      }
    }

    return NextResponse.json({
      sent: sentCount,
      total: profiles.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Digest error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du digest" },
      { status: 500 },
    );
  }
}
