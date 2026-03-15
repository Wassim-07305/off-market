import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/openrouter";

const SYSTEM_PROMPT = `Tu es un assistant CSM (Customer Success Manager) pour la plateforme Off-Market (coaching business).
Tu generes des briefings pre-session concis et actionables pour les coaches.

Format de sortie en Markdown :

## Statut actuel
- Drapeau, score engagement, tag, etape pipeline

## Problemes identifies
- Issues cles extraites des conversations et appels recents

## Axes de focus pour la prochaine session
- Recommandations basees sur les donnees

## Actions en cours
- Suivi des action items des sessions precedentes

## Progression des objectifs
- Resume de la progression sur les objectifs actifs
- Objectifs en retard ou a risque

## Signaux d'alerte
- Points d'attention (desengagement, retard paiement, objectif en retard, etc.)

Regles :
- Sois factuel, base-toi uniquement sur les donnees fournies
- Tutoie le coach dans le briefing
- Pas d'emojis
- Si une section manque de donnees, indique-le en une phrase
- Maximum 500 mots au total`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Only admin and coach can generate briefings
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { clientId } = await request.json();

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId requis" },
      { status: 400 },
    );
  }

  try {
    // Fetch all data in parallel
    const [
      profileRes,
      detailsRes,
      messagesRes,
      callsRes,
      flagHistoryRes,
      notesRes,
      tasksRes,
      goalsRes,
    ] = await Promise.all([
      // 1. Student profile
      supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, created_at, last_active_at")
        .eq("id", clientId)
        .single(),
      // 2. Student details
      supabase
        .from("student_details")
        .select(
          "flag, tag, health_score, engagement_score, pipeline_stage, program, goals, obstacles, niche, current_revenue, revenue_objective, last_engagement_at, coach_notes",
        )
        .eq("profile_id", clientId)
        .maybeSingle(),
      // 3. Recent messages (last 20)
      supabase
        .from("messages")
        .select("content, created_at, sender:profiles!messages_sender_id_fkey(full_name)")
        .or(`sender_id.eq.${clientId},receiver_id.eq.${clientId}`)
        .order("created_at", { ascending: false })
        .limit(20),
      // 4. Recent calls with notes
      supabase
        .from("call_calendar")
        .select(
          "id, title, date, call_type, status, actual_duration_seconds",
        )
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(5),
      // 5. Flag history
      supabase
        .from("flag_history")
        .select("old_flag, new_flag, reason, created_at")
        .eq("profile_id", clientId)
        .order("created_at", { ascending: false })
        .limit(10),
      // 6. Student notes
      supabase
        .from("student_notes")
        .select("content, is_pinned, created_at, author:profiles!student_notes_author_id_fkey(full_name)")
        .eq("student_id", clientId)
        .order("created_at", { ascending: false })
        .limit(10),
      // 7. Student tasks
      supabase
        .from("student_tasks")
        .select("title, status, priority, due_date")
        .eq("student_id", clientId)
        .order("created_at", { ascending: false })
        .limit(10),
      // 8. Active coaching goals
      supabase
        .from("coaching_goals")
        .select("title, description, target_value, current_value, unit, status, deadline")
        .eq("client_id", clientId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const profile = profileRes.data;
    if (!profile) {
      return NextResponse.json(
        { error: "Client introuvable" },
        { status: 404 },
      );
    }

    const details = detailsRes.data;
    const messages = messagesRes.data ?? [];
    const calls = callsRes.data ?? [];
    const flagHistory = flagHistoryRes.data ?? [];
    const notes = notesRes.data ?? [];
    const tasks = tasksRes.data ?? [];
    const activeGoals = goalsRes.data ?? [];

    // Fetch call notes for recent calls
    let callNotes: Array<{ call_id: string; summary: string | null; next_steps: string | null; action_items: unknown[] }> = [];
    if (calls.length > 0) {
      const callIds = calls.map((c) => c.id);
      const { data: cn } = await supabase
        .from("call_notes")
        .select("call_id, summary, next_steps, action_items")
        .in("call_id", callIds);
      callNotes = cn ?? [];
    }

    // Build prompt with all context
    let userPrompt = `Genere un briefing pre-session pour le client suivant :\n\n`;

    // Profile info
    userPrompt += `## Profil\n`;
    userPrompt += `- **Nom** : ${profile.full_name}\n`;
    userPrompt += `- **Email** : ${profile.email}\n`;
    userPrompt += `- **Inscription** : ${profile.created_at?.split("T")[0] ?? "?"}\n`;
    userPrompt += `- **Derniere activite** : ${profile.last_active_at ?? "Inconnue"}\n`;

    // Student details
    if (details) {
      userPrompt += `\n## Donnees etudiant\n`;
      userPrompt += `- **Drapeau** : ${details.flag ?? "green"}\n`;
      userPrompt += `- **Tag** : ${details.tag ?? "standard"}\n`;
      userPrompt += `- **Score sante** : ${details.health_score ?? 0}/100\n`;
      userPrompt += `- **Score engagement** : ${details.engagement_score ?? 0}/100\n`;
      userPrompt += `- **Etape** : ${details.pipeline_stage ?? "onboarding"}\n`;
      userPrompt += `- **Programme** : ${details.program ?? "Non defini"}\n`;
      userPrompt += `- **Objectifs** : ${details.goals ?? "Non definis"}\n`;
      userPrompt += `- **Obstacles** : ${details.obstacles ?? "Non definis"}\n`;
      userPrompt += `- **Niche** : ${details.niche ?? "Non definie"}\n`;
      userPrompt += `- **CA actuel** : ${details.current_revenue ?? 0} EUR\n`;
      userPrompt += `- **Objectif CA** : ${details.revenue_objective ?? 0} EUR\n`;
      if (details.coach_notes) {
        userPrompt += `- **Notes du coach** : ${details.coach_notes}\n`;
      }
    }

    // Recent messages
    if (messages.length > 0) {
      userPrompt += `\n## Derniers messages (${messages.length})\n`;
      for (const msg of messages.slice(0, 20)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sender = msg.sender as any;
        userPrompt += `- [${msg.created_at?.split("T")[0]}] ${sender?.full_name ?? "?"} : ${(msg.content ?? "").slice(0, 200)}\n`;
      }
    }

    // Recent calls
    if (calls.length > 0) {
      userPrompt += `\n## Derniers appels\n`;
      for (const call of calls) {
        const note = callNotes.find((n) => n.call_id === call.id);
        const duration = call.actual_duration_seconds
          ? `${Math.round(call.actual_duration_seconds / 60)} min`
          : "?";
        userPrompt += `- ${call.date} : ${call.title} (${call.call_type}, ${call.status}, ${duration})\n`;
        if (note?.summary) userPrompt += `  Resume : ${note.summary}\n`;
        if (note?.next_steps) userPrompt += `  Prochaines etapes : ${note.next_steps}\n`;
        if (note?.action_items && Array.isArray(note.action_items)) {
          const items = note.action_items as Array<{ title: string; done: boolean }>;
          for (const item of items) {
            userPrompt += `  - [${item.done ? "x" : " "}] ${item.title}\n`;
          }
        }
      }
    }

    // Flag history
    if (flagHistory.length > 0) {
      userPrompt += `\n## Historique des drapeaux\n`;
      for (const fh of flagHistory) {
        userPrompt += `- ${fh.created_at?.split("T")[0]} : ${fh.old_flag} -> ${fh.new_flag}${fh.reason ? ` (${fh.reason})` : ""}\n`;
      }
    }

    // Student notes
    if (notes.length > 0) {
      userPrompt += `\n## Notes du coach\n`;
      for (const note of notes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const author = note.author as any;
        userPrompt += `- [${note.created_at?.split("T")[0]}${note.is_pinned ? " *epinglee*" : ""}] ${author?.full_name ?? "?"} : ${(note.content ?? "").slice(0, 300)}\n`;
      }
    }

    // Tasks
    if (tasks.length > 0) {
      userPrompt += `\n## Taches en cours\n`;
      for (const task of tasks) {
        userPrompt += `- [${task.status}] ${task.title} (priorite: ${task.priority}${task.due_date ? `, echeance: ${task.due_date}` : ""})\n`;
      }
    }

    // Active coaching goals
    if (activeGoals.length > 0) {
      userPrompt += `\n## Objectifs de coaching actifs (${activeGoals.length})\n`;
      for (const goal of activeGoals) {
        const progress =
          goal.target_value && goal.target_value > 0
            ? Math.round((goal.current_value / goal.target_value) * 100)
            : null;
        const deadlineStr = goal.deadline
          ? `, echeance: ${goal.deadline.split("T")[0]}`
          : "";
        const progressStr =
          progress !== null
            ? ` — ${goal.current_value}/${goal.target_value} ${goal.unit ?? ""} (${progress}%)`
            : "";
        userPrompt += `- **${goal.title}**${progressStr}${deadlineStr}\n`;
        if (goal.description) {
          userPrompt += `  ${goal.description}\n`;
        }
      }
    }

    // Call AI
    const startTime = Date.now();

    const result = await callOpenRouter({
      system: SYSTEM_PROMPT,
      maxTokens: 2048,
      messages: [{ role: "user", content: userPrompt }],
    });

    const generationTime = Date.now() - startTime;

    return NextResponse.json({
      clientId,
      clientName: profile.full_name,
      briefing: result.text,
      tokensUsed: result.usage.input_tokens + result.usage.output_tokens,
      generationTimeMs: generationTime,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Client briefing generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du briefing" },
      { status: 500 },
    );
  }
}
