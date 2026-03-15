import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/openrouter";

const REPORT_SYSTEM_PROMPT = `Tu es l'assistant IA de la plateforme Off Market. Tu generes un rapport periodique de coaching.

Regles strictes :
- Reponses en francais, tu tutoies.
- Pas d'emojis.
- Utilise le format Markdown : titres (##), listes (-), **gras**.
- Sois concis et actionnable. Maximum 400 mots.
- Structure : Resume general, Points forts, Points d'attention, Actions recommandees.
- Base ton analyse uniquement sur les donnees fournies.`;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Verify role
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

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    // Aggregate data from last 7 days in parallel
    const [
      journalRes,
      checkinsRes,
      messagesRes,
      sessionsRes,
      callsRes,
      studentsRes,
    ] = await Promise.all([
      // Journal entries
      supabase
        .from("journal_entries")
        .select("title, mood, tags, created_at")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(50),

      // Weekly check-ins
      supabase
        .from("weekly_checkins")
        .select("mood, energy, goals_progress, blockers, wins, created_at")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(30),

      // Messages activity
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),

      // Coaching sessions
      supabase
        .from("coaching_sessions")
        .select("title, status, created_at")
        .gte("created_at", sevenDaysAgo)
        .limit(20),

      // Calls
      supabase
        .from("call_calendar")
        .select("title, call_type, status, date")
        .gte("date", sevenDaysAgo.split("T")[0])
        .limit(20),

      // Active students/clients
      supabase
        .from("profiles")
        .select("full_name, last_active_at")
        .eq("role", "prospect")
        .order("last_active_at", { ascending: false })
        .limit(50),
    ]);

    // Build context for IA
    let context = `## Donnees des 7 derniers jours (${new Date(sevenDaysAgo).toLocaleDateString("fr-FR")} - ${now.toLocaleDateString("fr-FR")})\n\n`;

    // Journal
    const journalEntries = journalRes.data ?? [];
    context += `### Journal (${journalEntries.length} entrees)\n`;
    if (journalEntries.length > 0) {
      const moods: Record<string, number> = {};
      journalEntries.forEach((e) => {
        const mood = (e.mood as string) ?? "non_renseigne";
        moods[mood] = (moods[mood] ?? 0) + 1;
      });
      context += `Repartition des humeurs : ${Object.entries(moods)
        .map(([m, c]) => `${m} (${c})`)
        .join(", ")}\n`;
      context += `Themes abordes : ${
        [
          ...new Set(journalEntries.flatMap((e) => (e.tags as string[]) ?? [])),
        ].join(", ") || "aucun"
      }\n`;
    }

    // Check-ins
    const checkins = checkinsRes.data ?? [];
    context += `\n### Check-ins (${checkins.length})\n`;
    if (checkins.length > 0) {
      const avgEnergy =
        checkins.reduce((s, c) => s + (Number(c.energy) || 0), 0) /
        checkins.length;
      const avgProgress =
        checkins.reduce((s, c) => s + (Number(c.goals_progress) || 0), 0) /
        checkins.length;
      context += `Energie moyenne : ${avgEnergy.toFixed(1)}/10\n`;
      context += `Progression objectifs moyenne : ${avgProgress.toFixed(0)}%\n`;

      const allWins = checkins
        .filter((c) => c.wins)
        .map((c) => c.wins as string);
      if (allWins.length > 0) {
        context += `Victoires : ${allWins.slice(0, 5).join("; ")}\n`;
      }

      const allBlockers = checkins
        .filter((c) => c.blockers)
        .map((c) => c.blockers as string);
      if (allBlockers.length > 0) {
        context += `Blocages : ${allBlockers.slice(0, 5).join("; ")}\n`;
      }
    }

    // Messages
    context += `\n### Activite messagerie\n`;
    context += `Messages envoyes : ${messagesRes.count ?? 0}\n`;

    // Sessions
    const sessions = sessionsRes.data ?? [];
    context += `\n### Sessions coaching (${sessions.length})\n`;
    if (sessions.length > 0) {
      const completed = sessions.filter((s) => s.status === "completed").length;
      context += `Completees : ${completed}/${sessions.length}\n`;
    }

    // Calls
    const calls = callsRes.data ?? [];
    context += `\n### Appels (${calls.length})\n`;
    if (calls.length > 0) {
      const byType: Record<string, number> = {};
      calls.forEach((c) => {
        const t = c.call_type ?? "autre";
        byType[t] = (byType[t] ?? 0) + 1;
      });
      context += `Par type : ${Object.entries(byType)
        .map(([t, c]) => `${t} (${c})`)
        .join(", ")}\n`;
    }

    // Students activity
    const students = studentsRes.data ?? [];
    const activeStudents = students.filter((s) => {
      if (!s.last_active_at) return false;
      return (
        new Date(s.last_active_at).getTime() > now.getTime() - 7 * 86400000
      );
    });
    const inactiveStudents = students.filter((s) => {
      if (!s.last_active_at) return true;
      return (
        new Date(s.last_active_at).getTime() <= now.getTime() - 7 * 86400000
      );
    });

    context += `\n### Eleves\n`;
    context += `Actifs cette semaine : ${activeStudents.length}\n`;
    context += `Inactifs : ${inactiveStudents.length}\n`;
    if (inactiveStudents.length > 0) {
      context += `Inactifs notables : ${inactiveStudents
        .slice(0, 5)
        .map((s) => s.full_name)
        .join(", ")}\n`;
    }

    // Call IA
    const result = await callOpenRouter({
      system: REPORT_SYSTEM_PROMPT,
      maxTokens: 1024,
      messages: [
        {
          role: "user",
          content: `Genere un rapport hebdomadaire de coaching pour ${profile.full_name} (role: ${profile.role}).\n\n${context}`,
        },
      ],
    });

    return NextResponse.json({
      report: result.text,
      period: {
        start: sevenDaysAgo,
        end: now.toISOString(),
      },
      stats: {
        journalEntries: journalEntries.length,
        checkins: checkins.length,
        messages: messagesRes.count ?? 0,
        sessions: sessions.length,
        calls: calls.length,
        activeStudents: activeStudents.length,
        inactiveStudents: inactiveStudents.length,
      },
    });
  } catch (error) {
    console.error("AI periodic report error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du rapport IA" },
      { status: 500 },
    );
  }
}
