/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Badge } from "@/types/gamification";

/**
 * Badge condition types supported by the evaluator.
 * The `condition` JSON field on the `badges` table should conform to one of:
 *   { type: "xp_total",      value: 500  }
 *   { type: "lesson_count",  value: 5    }
 *   { type: "streak_days",   value: 7    }
 *   { type: "journal_count", value: 10   }
 *   { type: "challenge_count", value: 3  }
 *   { type: "form_count",    value: 5    }
 */
interface BadgeCondition {
  type: string;
  value: number;
}

interface EvaluationResult {
  newBadgeIds: string[];
  newBadges: Badge[];
}

/**
 * Evaluates all unearned badges for a user and awards them when conditions are met.
 * Returns the list of newly awarded badge IDs.
 */
export async function evaluateBadges(
  supabase: any,
  userId: string,
): Promise<EvaluationResult> {
  // 1. Fetch all active badges
  const { data: allBadges, error: badgesError } = await supabase
    .from("badges")
    .select("*")
    .eq("is_active", true);
  if (badgesError) throw badgesError;

  // 2. Fetch user's already-earned badge IDs
  const { data: earnedRows, error: earnedError } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("profile_id", userId);
  if (earnedError) throw earnedError;

  const earnedIds = new Set((earnedRows ?? []).map((r: any) => r.badge_id));

  // 3. Filter to unearned badges
  const unearnedBadges = (allBadges as Badge[]).filter(
    (b) => !earnedIds.has(b.id),
  );
  if (unearnedBadges.length === 0) return { newBadgeIds: [], newBadges: [] };

  // 4. Gather the condition types we need to evaluate
  const conditionTypes = new Set(
    unearnedBadges
      .map((b) => (b.condition as unknown as BadgeCondition)?.type)
      .filter(Boolean),
  );

  // 5. Fetch user stats for each condition type (parallel)
  const stats: Record<string, number> = {};

  const fetchers: Promise<void>[] = [];

  if (conditionTypes.has("xp_total")) {
    fetchers.push(
      (async () => {
        const { data } = await supabase
          .from("xp_transactions")
          .select("xp_amount")
          .eq("profile_id", userId);
        stats.xp_total = (data ?? []).reduce(
          (sum: number, t: any) => sum + (t.xp_amount ?? 0),
          0,
        );
      })(),
    );
  }

  if (conditionTypes.has("lesson_count")) {
    fetchers.push(
      (async () => {
        const { data } = await supabase
          .from("lesson_progress")
          .select("id")
          .eq("student_id", userId)
          .eq("status", "completed");
        stats.lesson_count = (data ?? []).length;
      })(),
    );
  }

  if (conditionTypes.has("streak_days")) {
    fetchers.push(
      (async () => {
        const { data } = await supabase
          .from("streaks")
          .select("current_streak, longest_streak")
          .eq("profile_id", userId)
          .maybeSingle();
        stats.streak_days = data
          ? Math.max(data.current_streak, data.longest_streak)
          : 0;
      })(),
    );
  }

  if (conditionTypes.has("journal_count")) {
    fetchers.push(
      (async () => {
        const { data } = await supabase
          .from("journal_entries")
          .select("id")
          .eq("author_id", userId);
        stats.journal_count = (data ?? []).length;
      })(),
    );
  }

  if (conditionTypes.has("challenge_count")) {
    fetchers.push(
      (async () => {
        const { data } = await supabase
          .from("challenge_participants")
          .select("id")
          .eq("profile_id", userId)
          .eq("completed", true);
        stats.challenge_count = (data ?? []).length;
      })(),
    );
  }

  if (conditionTypes.has("form_count")) {
    fetchers.push(
      (async () => {
        const { data } = await supabase
          .from("form_submissions")
          .select("id")
          .eq("respondent_id", userId);
        stats.form_count = (data ?? []).length;
      })(),
    );
  }

  await Promise.all(fetchers);

  // 6. Evaluate each unearned badge
  const newBadges: Badge[] = [];

  for (const badge of unearnedBadges) {
    const condition = badge.condition as unknown as BadgeCondition;
    if (!condition?.type || condition.value === undefined) continue;

    const userValue = stats[condition.type] ?? 0;
    if (userValue >= condition.value) {
      newBadges.push(badge);
    }
  }

  if (newBadges.length === 0) return { newBadgeIds: [], newBadges: [] };

  // 7. Award badges
  const inserts = newBadges.map((b) => ({
    profile_id: userId,
    badge_id: b.id,
    earned_at: new Date().toISOString(),
  }));

  const { error: insertError } = await supabase
    .from("user_badges")
    .insert(inserts);
  if (insertError) throw insertError;

  // 8. Award XP rewards for each new badge (if any)
  const xpInserts = newBadges
    .filter((b) => b.xp_reward > 0)
    .map((b) => ({
      profile_id: userId,
      action: "badge_earned",
      xp_amount: b.xp_reward,
      metadata: { badge_id: b.id, badge_name: b.name },
    }));

  if (xpInserts.length > 0) {
    await supabase.from("xp_transactions").insert(xpInserts);
  }

  return {
    newBadgeIds: newBadges.map((b) => b.id),
    newBadges,
  };
}
