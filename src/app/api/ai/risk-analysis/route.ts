import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── Risk Factor Weights ─────────────────────────────────────
const WEIGHTS = {
  inactivity: 30,    // max penalty for no engagement
  checkin_mood: 20,  // low mood trend
  checkin_energy: 10, // low energy trend
  revenue_drop: 20,  // revenue decline
  no_checkin: 10,    // missing checkins
  course_stall: 10,  // no course progress
};

interface RiskResult {
  profile_id: string;
  full_name: string;
  previous_score: number;
  new_score: number;
  risk_factors: string[];
  severity: "low" | "medium" | "high" | "critical";
  recommendation: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  try {
    // 1. Fetch all students with details
    const { data: students, error: studentsError } = await supabase
      .from("profiles")
      .select("id, full_name, last_seen_at, student_details(*)")
      .eq("role", "client");

    if (studentsError) throw studentsError;
    if (!students || students.length === 0) {
      return NextResponse.json({ results: [], summary: { total: 0, at_risk: 0, critical: 0 } });
    }

    const now = new Date();
    const results: RiskResult[] = [];

    for (const student of students) {
      const details = (student.student_details as { health_score: number; tag: string; revenue: number }[])?.[0];
      const previousScore = details?.health_score ?? 50;
      const riskFactors: string[] = [];
      let penalty = 0;

      // ── Factor 1: Inactivity ──────────────────────────────
      const lastSeen = student.last_seen_at ? new Date(student.last_seen_at) : null;
      const daysSinceLastSeen = lastSeen
        ? Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (daysSinceLastSeen >= 14) {
        penalty += WEIGHTS.inactivity;
        riskFactors.push(`Inactif depuis ${daysSinceLastSeen} jours`);
      } else if (daysSinceLastSeen >= 7) {
        penalty += WEIGHTS.inactivity * 0.6;
        riskFactors.push(`Inactif depuis ${daysSinceLastSeen} jours`);
      } else if (daysSinceLastSeen >= 3) {
        penalty += WEIGHTS.inactivity * 0.2;
      }

      // ── Factor 2: Check-in mood trend ──────────────────────
      const fourWeeksAgo = new Date(now);
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const { data: checkins } = await supabase
        .from("weekly_checkins")
        .select("mood, energy, revenue, week_start")
        .eq("client_id", student.id)
        .gte("week_start", fourWeeksAgo.toISOString().slice(0, 10))
        .order("week_start", { ascending: false })
        .limit(4);

      if (checkins && checkins.length >= 2) {
        const moods = checkins.map((c) => c.mood).filter((m): m is number => m !== null);
        if (moods.length >= 2) {
          const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
          if (avgMood <= 2) {
            penalty += WEIGHTS.checkin_mood;
            riskFactors.push(`Moral bas (moyenne: ${avgMood.toFixed(1)}/5)`);
          } else if (avgMood <= 3) {
            penalty += WEIGHTS.checkin_mood * 0.4;
          }
          // Check declining trend
          if (moods.length >= 3 && moods[0] < moods[moods.length - 1]) {
            penalty += WEIGHTS.checkin_mood * 0.3;
            riskFactors.push("Tendance du moral en baisse");
          }
        }

        const energies = checkins.map((c) => c.energy).filter((e): e is number => e !== null);
        if (energies.length >= 2) {
          const avgEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
          if (avgEnergy <= 2) {
            penalty += WEIGHTS.checkin_energy;
            riskFactors.push(`Energie basse (moyenne: ${avgEnergy.toFixed(1)}/5)`);
          }
        }

        // ── Factor 3: Revenue drop ──────────────────────────
        const revenues = checkins.map((c) => c.revenue).filter((r): r is number => r !== null && r > 0);
        if (revenues.length >= 2) {
          const recent = revenues[0];
          const older = revenues[revenues.length - 1];
          if (older > 0 && recent < older * 0.7) {
            penalty += WEIGHTS.revenue_drop;
            riskFactors.push(`Baisse de CA de ${Math.round((1 - recent / older) * 100)}%`);
          } else if (older > 0 && recent < older * 0.85) {
            penalty += WEIGHTS.revenue_drop * 0.4;
          }
        }
      }

      // ── Factor 4: Missing check-ins ──────────────────────
      if (!checkins || checkins.length === 0) {
        penalty += WEIGHTS.no_checkin;
        riskFactors.push("Aucun check-in sur les 4 dernieres semaines");
      } else if (checkins.length === 1) {
        penalty += WEIGHTS.no_checkin * 0.5;
        riskFactors.push("1 seul check-in sur 4 semaines");
      }

      // ── Factor 5: Course progress stall ──────────────────
      const { data: recentProgress } = await supabase
        .from("lesson_progress")
        .select("completed_at")
        .eq("student_id", student.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1);

      if (recentProgress && recentProgress.length > 0) {
        const lastCompletion = new Date(recentProgress[0].completed_at!);
        const daysSinceCompletion = Math.floor(
          (now.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCompletion >= 14) {
          penalty += WEIGHTS.course_stall;
          riskFactors.push(`Aucune lecon terminee depuis ${daysSinceCompletion} jours`);
        } else if (daysSinceCompletion >= 7) {
          penalty += WEIGHTS.course_stall * 0.4;
        }
      } else {
        // No completed lesson at all — check if enrolled
        const { count } = await supabase
          .from("lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("student_id", student.id);
        if (count === 0) {
          penalty += WEIGHTS.course_stall * 0.6;
          riskFactors.push("Aucune lecon commencee");
        }
      }

      // ── Compute new health score ──────────────────────────
      // Start from 100, subtract penalties, floor at 0
      const rawScore = Math.max(0, Math.min(100, 100 - penalty));
      // Smooth: blend 60% new score + 40% previous to avoid wild swings
      const newScore = Math.round(rawScore * 0.6 + previousScore * 0.4);

      const severity: RiskResult["severity"] =
        newScore <= 25 ? "critical" :
        newScore <= 45 ? "high" :
        newScore <= 65 ? "medium" : "low";

      // ── Generate recommendation ──────────────────────────
      let recommendation = "";
      if (severity === "critical") {
        recommendation = "Appel urgent recommande. Ce client risque de decrocher completement.";
      } else if (severity === "high") {
        recommendation = "Planifie un point individuel rapidement pour remotiver ce client.";
      } else if (severity === "medium") {
        recommendation = "Envoie un message de suivi et verifie ses objectifs.";
      } else {
        recommendation = "Tout va bien. Continue le suivi habituel.";
      }

      results.push({
        profile_id: student.id,
        full_name: student.full_name,
        previous_score: previousScore,
        new_score: newScore,
        risk_factors: riskFactors,
        severity,
        recommendation,
      });

      // ── Update health_score in DB ──────────────────────────
      if (details && newScore !== previousScore) {
        await supabase
          .from("student_details")
          .update({ health_score: newScore })
          .eq("profile_id", student.id);
      }

      // ── Auto-tag at_risk / churned ──────────────────────────
      if (details) {
        const currentTag = details.tag;
        let newTag = currentTag;

        if (newScore <= 25 && currentTag !== "churned") {
          newTag = "churned";
        } else if (newScore <= 45 && currentTag !== "at_risk" && currentTag !== "churned") {
          newTag = "at_risk";
        } else if (newScore > 65 && (currentTag === "at_risk" || currentTag === "churned")) {
          newTag = "standard";
        }

        if (newTag !== currentTag) {
          await supabase
            .from("student_details")
            .update({ tag: newTag })
            .eq("profile_id", student.id);
        }
      }

      // ── Create alerts for high/critical ──────────────────
      if (severity === "critical" || severity === "high") {
        // Check if active alert already exists for this student
        const { data: existingAlert } = await supabase
          .from("coach_alerts")
          .select("id")
          .eq("client_id", student.id)
          .eq("is_resolved", false)
          .eq("alert_type", daysSinceLastSeen >= 14 ? "inactive_14d" : daysSinceLastSeen >= 7 ? "inactive_7d" : "goal_at_risk")
          .limit(1);

        if (!existingAlert || existingAlert.length === 0) {
          const alertType = daysSinceLastSeen >= 14 ? "inactive_14d" :
            daysSinceLastSeen >= 7 ? "inactive_7d" :
            riskFactors.some((f) => f.includes("Moral")) ? "low_mood" :
            riskFactors.some((f) => f.includes("CA")) ? "revenue_drop" :
            "goal_at_risk";

          await supabase.from("coach_alerts").insert({
            client_id: student.id,
            coach_id: user.id,
            alert_type: alertType,
            title: `${student.full_name} — Score sante: ${newScore}/100`,
            description: riskFactors.slice(0, 3).join(". "),
            severity,
            is_resolved: false,
          });
        }
      }
    }

    // Sort by score ascending (most at-risk first)
    results.sort((a, b) => a.new_score - b.new_score);

    const summary = {
      total: results.length,
      critical: results.filter((r) => r.severity === "critical").length,
      high: results.filter((r) => r.severity === "high").length,
      medium: results.filter((r) => r.severity === "medium").length,
      low: results.filter((r) => r.severity === "low").length,
      avg_score: Math.round(results.reduce((sum, r) => sum + r.new_score, 0) / results.length),
    };

    return NextResponse.json({ results, summary });
  } catch (error) {
    console.error("Risk analysis error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse de risque" },
      { status: 500 }
    );
  }
}
