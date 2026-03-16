import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/notifications/batch
 *
 * Cron endpoint that batches pending notifications for users who have
 * batch_frequency set to 'hourly' or 'daily'. Creates a single digest
 * notification summarising the originals, then marks them as batched.
 *
 * Expected body: { type: "hourly" | "daily" }
 * Auth: Bearer CRON_SECRET
 */
export async function POST(request: Request) {
  // ── Auth ────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { type = "hourly" } = await request
    .json()
    .catch(() => ({ type: "hourly" }));

  if (type !== "hourly" && type !== "daily") {
    return NextResponse.json(
      { error: "Type invalide, utiliser 'hourly' ou 'daily'" },
      { status: 400 },
    );
  }

  // ── Supabase service client ─────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Config manquante" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // ── 1. Get users with matching batch frequency ──────────
    const { data: preferences, error: prefError } = await supabase
      .from("notification_preferences")
      .select("user_id, quiet_hours_start, quiet_hours_end")
      .eq("batch_frequency", type);

    if (prefError) throw prefError;
    if (!preferences || preferences.length === 0) {
      return NextResponse.json({
        processed: 0,
        message: "Aucun utilisateur avec cette frequence de batch",
      });
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let totalProcessed = 0;
    let totalDigests = 0;
    const errors: string[] = [];

    for (const pref of preferences) {
      try {
        // ── 2. Respect quiet hours ────────────────────────────
        const start = pref.quiet_hours_start as string;
        const end = pref.quiet_hours_end as string;
        let inQuietHours = false;

        if (start > end) {
          // Overnight quiet hours (e.g. 22:00 -> 08:00)
          inQuietHours = currentTime >= start || currentTime < end;
        } else {
          inQuietHours = currentTime >= start && currentTime < end;
        }

        if (inQuietHours) continue;

        // ── 3. Get unbatched notifications for this user ──────
        const { data: notifications, error: notifError } = await supabase
          .from("notifications")
          .select("id, type, title, category, priority")
          .eq("recipient_id", pref.user_id)
          .is("batched_at", null)
          .is("batch_id", null)
          .order("created_at", { ascending: false });

        if (notifError) throw notifError;
        if (!notifications || notifications.length === 0) continue;

        // ── 4. Group and create digest ────────────────────────
        const batchId = crypto.randomUUID();

        // Group by category for the summary
        const byCategory: Record<string, number> = {};
        for (const n of notifications) {
          const cat = (n.category as string) || "general";
          byCategory[cat] = (byCategory[cat] || 0) + 1;
        }

        const categoryLabels: Record<string, string> = {
          general: "Generales",
          messaging: "Messages",
          billing: "Facturation",
          coaching: "Coaching",
          gamification: "Gamification",
          system: "Systeme",
        };

        const summaryParts = Object.entries(byCategory).map(
          ([cat, count]) =>
            `${count} ${categoryLabels[cat] || cat}`,
        );

        const digestTitle = `Vous avez ${notifications.length} nouvelles notifications`;
        const digestBody = summaryParts.join(", ");

        // Create the digest notification
        const { error: digestError } = await supabase
          .from("notifications")
          .insert({
            recipient_id: pref.user_id,
            type: "digest",
            title: digestTitle,
            body: digestBody,
            category: "system",
            priority: "normal",
            data: {
              batch_id: batchId,
              count: notifications.length,
              by_category: byCategory,
              original_ids: notifications.map((n) => n.id),
            },
          });

        if (digestError) throw digestError;

        // ── 5. Mark originals as batched ──────────────────────
        const originalIds = notifications.map((n) => n.id);
        const { error: updateError } = await supabase
          .from("notifications")
          .update({
            batched_at: now.toISOString(),
            batch_id: batchId,
          })
          .in("id", originalIds);

        if (updateError) throw updateError;

        totalProcessed += notifications.length;
        totalDigests++;
      } catch (err) {
        errors.push(`user ${pref.user_id}: ${err}`);
      }
    }

    return NextResponse.json({
      processed: totalProcessed,
      digests_created: totalDigests,
      users_checked: preferences.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Notification batch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du batch de notifications" },
      { status: 500 },
    );
  }
}
