import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/openrouter";

const INSIGHTS_SYSTEM_PROMPT = `Tu es l'assistant IA de la plateforme Off Market specialise dans l'analyse de coaching.
Tu generes des insights detailles sur la progression d'un client ou d'un groupe de clients.

Regles strictes :
- Reponses en francais, tu tutoies.
- Pas d'emojis.
- Reponds UNIQUEMENT en JSON valide, sans markdown ni commentaires.
- Structure exacte attendue :
{
  "patterns": [{"title": "...", "description": "..."}],
  "strengths": [{"title": "...", "description": "..."}],
  "improvements": [{"title": "...", "description": "..."}],
  "recommendations": [{"title": "...", "description": "...", "priority": "high|medium|low"}]
}
- Chaque tableau doit contenir entre 2 et 5 elements.
- Base ton analyse uniquement sur les donnees fournies.
- Sois concis et actionnable.`;

export async function POST(request: NextRequest) {
  try {
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
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "coach"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Acces reserve aux coaches et admins" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { clientId, period = "month" } = body as {
      clientId?: string;
      period?: "week" | "month";
    };

    const daysBack = period === "week" ? 7 : 30;
    const since = new Date(
      Date.now() - daysBack * 86400000,
    ).toISOString();

    // Determine target user IDs
    let targetIds: string[] = [];

    if (clientId) {
      targetIds = [clientId];
    } else {
      // Get all assigned clients for the coach
      const { data: assignments } = await supabase
        .from("coach_assignments")
        .select("client_id")
        .eq("coach_id", user.id)
        .eq("status", "active");

      targetIds = (assignments ?? []).map(
        (a: { client_id: string }) => a.client_id,
      );
    }

    if (targetIds.length === 0) {
      return NextResponse.json({
        insights: {
          patterns: [],
          strengths: [],
          improvements: [],
          recommendations: [],
        },
        message: "Aucun client assigne",
      });
    }

    // Fetch data in parallel
    const [
      checkinsRes,
      journalRes,
      xpRes,
      formationsRes,
      sessionsRes,
      profilesRes,
    ] = await Promise.all([
      supabase
        .from("weekly_checkins")
        .select("user_id, mood, energy, goals_progress, blocker, win, created_at")
        .in("user_id", targetIds)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("journal_entries")
        .select("user_id, title, mood, tags, created_at")
        .in("user_id", targetIds)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("xp_transactions")
        .select("profile_id, xp_amount, action, created_at")
        .in("profile_id", targetIds)
        .gte("created_at", since)
        .limit(200),
      supabase
        .from("formation_enrollments")
        .select("user_id, completed, progress, updated_at")
        .in("user_id", targetIds),
      supabase
        .from("coaching_sessions")
        .select("client_id, status, notes, created_at")
        .in("client_id", targetIds)
        .gte("created_at", since)
        .limit(50),
      supabase
        .from("profiles")
        .select("id, full_name, last_seen_at")
        .in("id", targetIds),
    ]);

    const checkins = checkinsRes.data ?? [];
    const journal = journalRes.data ?? [];
    const xpTx = xpRes.data ?? [];
    const formations = formationsRes.data ?? [];
    const sessions = sessionsRes.data ?? [];
    const profiles = profilesRes.data ?? [];

    // Build context for AI
    let context = `## Donnees des ${daysBack} derniers jours\n\n`;
    context += `### Clients analyses : ${profiles.length}\n`;
    context += profiles
      .map((p: Record<string, unknown>) => `- ${p.full_name} (derniere connexion: ${p.last_seen_at ?? "inconnue"})`)
      .join("\n");

    // Check-ins analysis
    context += `\n\n### Check-ins (${checkins.length})\n`;
    if (checkins.length > 0) {
      const avgEnergy =
        checkins.reduce(
          (s: number, c: Record<string, unknown>) => s + (Number(c.energy) || 0),
          0,
        ) / checkins.length;
      const avgProgress =
        checkins.reduce(
          (s: number, c: Record<string, unknown>) =>
            s + (Number(c.goals_progress) || 0),
          0,
        ) / checkins.length;
      context += `Energie moyenne : ${avgEnergy.toFixed(1)}/10\n`;
      context += `Progression objectifs moyenne : ${avgProgress.toFixed(0)}%\n`;

      const moods: Record<string, number> = {};
      checkins.forEach((c: Record<string, unknown>) => {
        const mood = (c.mood as string) ?? "non_renseigne";
        moods[mood] = (moods[mood] ?? 0) + 1;
      });
      context += `Humeurs : ${Object.entries(moods).map(([m, c]) => `${m} (${c})`).join(", ")}\n`;

      const blockers = checkins
        .filter((c: Record<string, unknown>) => c.blockers)
        .map((c: Record<string, unknown>) => c.blockers as string);
      if (blockers.length > 0) {
        context += `Blocages mentionnes : ${blockers.slice(0, 5).join("; ")}\n`;
      }

      const wins = checkins
        .filter((c: Record<string, unknown>) => c.wins)
        .map((c: Record<string, unknown>) => c.wins as string);
      if (wins.length > 0) {
        context += `Victoires : ${wins.slice(0, 5).join("; ")}\n`;
      }
    }

    // Journal
    context += `\n### Journal (${journal.length} entrees)\n`;
    if (journal.length > 0) {
      const themes = [
        ...new Set(
          journal.flatMap(
            (e: Record<string, unknown>) => (e.tags as string[]) ?? [],
          ),
        ),
      ];
      context += `Themes : ${themes.join(", ") || "aucun"}\n`;

      const jMoods: Record<string, number> = {};
      journal.forEach((j: Record<string, unknown>) => {
        const mood = (j.mood as string) ?? "non_renseigne";
        jMoods[mood] = (jMoods[mood] ?? 0) + 1;
      });
      context += `Humeurs journal : ${Object.entries(jMoods).map(([m, c]) => `${m} (${c})`).join(", ")}\n`;
    }

    // XP
    const totalXp = xpTx.reduce(
      (s: number, t: Record<string, unknown>) => s + (Number(t.xp_amount) || 0),
      0,
    );
    const xpActions: Record<string, number> = {};
    xpTx.forEach((t: Record<string, unknown>) => {
      const action = (t.action as string) ?? "autre";
      xpActions[action] = (xpActions[action] ?? 0) + 1;
    });
    context += `\n### XP gagne : ${totalXp}\n`;
    context += `Actions XP : ${Object.entries(xpActions).map(([a, c]) => `${a} (${c}x)`).join(", ")}\n`;

    // Formations
    const completed = formations.filter(
      (f: Record<string, unknown>) => f.completed,
    ).length;
    context += `\n### Formations\n`;
    context += `En cours : ${formations.length - completed}\n`;
    context += `Completees : ${completed}\n`;

    // Sessions
    const completedSessions = sessions.filter(
      (s: Record<string, unknown>) => s.status === "completed",
    ).length;
    context += `\n### Sessions coaching : ${sessions.length} (completees : ${completedSessions})\n`;

    // Regularity: count days with activity
    const activeDays = new Set<string>();
    [...checkins, ...journal].forEach((item: Record<string, unknown>) => {
      if (item.created_at) {
        activeDays.add((item.created_at as string).split("T")[0]);
      }
    });
    const regularityPercent = Math.round((activeDays.size / daysBack) * 100);
    context += `\n### Regularite : ${activeDays.size}/${daysBack} jours avec activite (${regularityPercent}%)\n`;

    // Call AI
    const result = await callOpenRouter({
      system: INSIGHTS_SYSTEM_PROMPT,
      maxTokens: 1500,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: `Analyse les donnees suivantes et genere des insights de coaching.\n\n${context}`,
        },
      ],
    });

    // Parse JSON response
    let insights;
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result.text);
    } catch {
      // If parsing fails, return raw text with a default structure
      insights = {
        patterns: [{ title: "Analyse brute", description: result.text }],
        strengths: [],
        improvements: [],
        recommendations: [],
      };
    }

    return NextResponse.json({
      insights,
      meta: {
        period,
        daysBack,
        clientCount: targetIds.length,
        dataPoints: {
          checkins: checkins.length,
          journal: journal.length,
          xpTransactions: xpTx.length,
          formations: formations.length,
          sessions: sessions.length,
          regularity: regularityPercent,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI insights error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation des insights" },
      { status: 500 },
    );
  }
}
