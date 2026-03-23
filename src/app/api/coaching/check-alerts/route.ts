import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * CRON endpoint: Check for coaching alerts
 *
 * 1. Mark missed sessions (scheduled_at < now AND status = 'scheduled') as 'no_show'
 * 2. Create coach_alerts with type 'session_missed'
 * 3. Check for clients with no check-in in 10+ days -> 'no_checkin' alert
 * 4. Check for clients with last login > 7 days -> 'inactive_7d' alert
 */

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const now = new Date();
  const nowISO = now.toISOString();

  const results = {
    no_show_marked: 0,
    session_missed_alerts: 0,
    no_checkin_alerts: 0,
    inactive_alerts: 0,
  };

  // ═══════════════════════════════════════
  // 1. Mark missed sessions as no_show
  // ═══════════════════════════════════════
  const { data: missedSessions, error: missedErr } = await supabase
    .from("coaching_sessions")
    .select("id, coach_id, client_id, scheduled_at")
    .eq("status", "scheduled")
    .lt("scheduled_at", nowISO);

  if (missedErr) {
    console.error(
      "[check-alerts] Erreur sessions manquees:",
      missedErr.message,
    );
  }

  if (missedSessions?.length) {
    const missedIds = missedSessions.map((s: { id: string }) => s.id);

    const { count } = await supabase
      .from("coaching_sessions")
      .update({ status: "no_show" })
      .in("id", missedIds);

    results.no_show_marked = count ?? missedIds.length;

    // 2. Create coach_alerts for each missed session
    const alerts = missedSessions.map(
      (s: {
        id: string;
        coach_id: string;
        client_id: string;
        scheduled_at: string;
      }) => ({
        coach_id: s.coach_id,
        client_id: s.client_id,
        type: "session_missed",
        title: "Session manquee",
        body: `Le client n'a pas rejoint la session prevue le ${new Date(s.scheduled_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}.`,
        metadata: { session_id: s.id, scheduled_at: s.scheduled_at },
        created_at: nowISO,
      }),
    );

    const { error: alertErr } = await supabase
      .from("coach_alerts")
      .insert(alerts);

    if (alertErr) {
      console.error(
        "[check-alerts] Erreur creation alertes session:",
        alertErr.message,
      );
    } else {
      results.session_missed_alerts = alerts.length;
    }
  }

  // ═══════════════════════════════════════
  // 3. Clients with no check-in in 10+ days
  // ═══════════════════════════════════════
  const tenDaysAgo = new Date(
    now.getTime() - 10 * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Get all active client assignments
  const { data: activeAssignments, error: assignErr } = await supabase
    .from("coach_assignments")
    .select("coach_id, client_id")
    .eq("status", "active");

  if (assignErr) {
    console.error("[check-alerts] Erreur assignments:", assignErr.message);
  }

  if (activeAssignments?.length) {
    const clientIds = activeAssignments.map(
      (a: { client_id: string }) => a.client_id,
    );

    // Find the latest journal entry per client
    const { data: recentCheckins, error: checkinErr } = await supabase
      .from("journal_entries")
      .select("profile_id, created_at")
      .in("profile_id", clientIds)
      .gte("created_at", tenDaysAgo);

    if (checkinErr) {
      console.error("[check-alerts] Erreur journal:", checkinErr.message);
    }

    const clientsWithRecentCheckin = new Set(
      (recentCheckins ?? []).map((j: { profile_id: string }) => j.profile_id),
    );

    // Clients without recent check-in
    const noCheckinClients = activeAssignments.filter(
      (a: { client_id: string }) => !clientsWithRecentCheckin.has(a.client_id),
    );

    if (noCheckinClients.length) {
      // Avoid duplicate alerts: check for existing 'no_checkin' alerts created in the last 3 days
      const threeDaysAgo = new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const { data: existingNoCheckin } = await supabase
        .from("coach_alerts")
        .select("client_id")
        .eq("alert_type", "no_checkin")
        .gte("created_at", threeDaysAgo);

      const alreadyAlerted = new Set(
        (existingNoCheckin ?? []).map(
          (a: { client_id: string }) => a.client_id,
        ),
      );

      const newNoCheckinAlerts = noCheckinClients
        .filter((a: { client_id: string }) => !alreadyAlerted.has(a.client_id))
        .map((a: { coach_id: string; client_id: string }) => ({
          coach_id: a.coach_id,
          client_id: a.client_id,
          type: "no_checkin",
          title: "Pas de check-in depuis 10 jours",
          body: "Ce client n'a pas fait de check-in (journal) depuis plus de 10 jours.",
          metadata: { last_check_threshold: tenDaysAgo },
          created_at: nowISO,
        }));

      if (newNoCheckinAlerts.length) {
        const { error: ncErr } = await supabase
          .from("coach_alerts")
          .insert(newNoCheckinAlerts);

        if (ncErr) {
          console.error(
            "[check-alerts] Erreur alertes no_checkin:",
            ncErr.message,
          );
        } else {
          results.no_checkin_alerts = newNoCheckinAlerts.length;
        }
      }
    }

    // ═══════════════════════════════════════
    // 4. Clients with last login > 7 days
    // ═══════════════════════════════════════
    const sevenDaysAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: inactiveClients, error: inactiveErr } = await supabase
      .from("profiles")
      .select("id, last_seen_at")
      .in("id", clientIds)
      .lt("last_seen_at", sevenDaysAgo);

    if (inactiveErr) {
      console.error(
        "[check-alerts] Erreur profils inactifs:",
        inactiveErr.message,
      );
    }

    if (inactiveClients?.length) {
      // Avoid duplicate alerts: check for existing 'inactive_7d' alerts in the last 7 days
      const { data: existingInactive } = await supabase
        .from("coach_alerts")
        .select("client_id")
        .eq("type", "inactive_7d")
        .gte("created_at", sevenDaysAgo);

      const alreadyAlertedInactive = new Set(
        (existingInactive ?? []).map((a: { client_id: string }) => a.client_id),
      );

      // Build a map of client_id -> coach_id from active assignments
      const clientCoachMap = new Map<string, string>();
      for (const a of activeAssignments as {
        coach_id: string;
        client_id: string;
      }[]) {
        clientCoachMap.set(a.client_id, a.coach_id);
      }

      const newInactiveAlerts = inactiveClients
        .filter((c: { id: string }) => !alreadyAlertedInactive.has(c.id))
        .filter((c: { id: string }) => clientCoachMap.has(c.id))
        .map((c: { id: string; last_seen_at: string }) => ({
          coach_id: clientCoachMap.get(c.id)!,
          client_id: c.id,
          type: "inactive_7d",
          title: "Client inactif depuis 7 jours",
          body: `Derniere connexion : ${c.last_seen_at ? new Date(c.last_seen_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "inconnue"}.`,
          metadata: { last_seen_at: c.last_seen_at },
          created_at: nowISO,
        }));

      if (newInactiveAlerts.length) {
        const { error: iaErr } = await supabase
          .from("coach_alerts")
          .insert(newInactiveAlerts);

        if (iaErr) {
          console.error(
            "[check-alerts] Erreur alertes inactive:",
            iaErr.message,
          );
        } else {
          results.inactive_alerts = newInactiveAlerts.length;
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    processed_at: nowISO,
  });
}
