import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Cron job : met à jour les scores des compétitions actives.
 * Calcule le score de chaque participant en fonction de la métrique choisie.
 * Appelé toutes les heures via Vercel Cron.
 */

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Metric → table/column mapping
const METRIC_QUERIES: Record<
  string,
  {
    table: string;
    countColumn?: string;
    sumColumn?: string;
    dateColumn: string;
  }
> = {
  prospects_contacted: {
    table: "contact_interactions",
    dateColumn: "created_at",
  },
  calls_completed: {
    table: "call_calendar",
    dateColumn: "date",
  },
  xp_earned: {
    table: "xp_transactions",
    sumColumn: "points",
    dateColumn: "created_at",
  },
  lessons_completed: {
    table: "lesson_progress",
    dateColumn: "completed_at",
  },
  checkins_done: {
    table: "weekly_checkins",
    dateColumn: "created_at",
  },
  messages_sent: {
    table: "messages",
    dateColumn: "created_at",
  },
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const now = new Date().toISOString();
  let updated = 0;

  try {
    // Get active competitions
    const { data: competitions, error: compError } = await supabase
      .from("competitions")
      .select("*")
      .lte("start_date", now)
      .gte("end_date", now);

    if (compError) throw compError;
    if (!competitions || competitions.length === 0) {
      return NextResponse.json({
        message: "Aucune competition active",
        updated: 0,
      });
    }

    for (const comp of competitions) {
      const metricConfig = METRIC_QUERIES[comp.metric];
      if (!metricConfig) continue;

      // Get participants
      const { data: participants } = await supabase
        .from("competition_participants")
        .select("id, user_id, team_id")
        .eq("competition_id", comp.id);

      if (!participants || participants.length === 0) continue;

      for (const participant of participants) {
        const userId = participant.user_id;
        if (!userId) continue;

        // Count/sum the metric for this user within the competition period
        let score = 0;

        if (metricConfig.sumColumn) {
          const { data } = await supabase
            .from(metricConfig.table)
            .select(metricConfig.sumColumn)
            .eq("user_id", userId)
            .gte(metricConfig.dateColumn, comp.start_date)
            .lte(metricConfig.dateColumn, comp.end_date);

          score = ((data ?? []) as unknown as Record<string, number>[]).reduce(
            (sum: number, row: Record<string, number>) =>
              sum + (Number(row[metricConfig.sumColumn!]) || 0),
            0,
          );
        } else {
          const { count } = await supabase
            .from(metricConfig.table)
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte(metricConfig.dateColumn, comp.start_date)
            .lte(metricConfig.dateColumn, comp.end_date);

          score = (count as number | null) ?? 0;
        }

        // Update participant score
        await supabase
          .from("competition_participants")
          .update({ score, updated_at: now })
          .eq("id", participant.id);

        updated++;
      }
    }

    return NextResponse.json({
      message: `Scores mis à jour pour ${competitions.length} competition(s)`,
      updated,
    });
  } catch (error) {
    console.error("Competition score update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des scores" },
      { status: 500 },
    );
  }
}
