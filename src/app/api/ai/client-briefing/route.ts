import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/openrouter";

const SYSTEM_PROMPT = `Tu es un assistant CSM (Customer Success Manager) pour la plateforme Off-Market (coaching business).
Tu generes des briefings pre-session concis et actionables pour les coaches.

Format de sortie en Markdown :

## Statut actuel
- Drapeau, score engagement, tag, étape pipeline

## Problèmes identifies
- Issues cles extraites des conversations et appels recents

## Axes de focus pour la prochaine session
- Recommandations basees sur les donnees

## Actions en cours
- Suivi des action items des sessions precedentes

## Progression des objectifs
- Résumé de la progression sur les objectifs actifs
- Objectifs en retard ou à risque

## Signaux d'alerte
- Points d'attention (desengagement, retard paiement, objectif en retard, etc.)

## Contexte enrichi (si disponible)
- Utilise les donnees d'enrichissement (LinkedIn, Instagram, TikTok, Facebook, site web) pour personnaliser le briefing
- Mentionne des elements pertinents (niche, audience, positionnement) qui pourraient orienter le coaching

Regles :
- Sois factuel, base-toi uniquement sur les donnees fournies
- Tutoie le coach dans le briefing
- Pas d'emojis
- Si une section manque de donnees, indique-le en une phrase
- Maximum 500 mots au total`;

interface EnrichmentLinkedIn {
  headline?: string;
  summary?: string;
  company?: string;
  position?: string;
  location?: string;
  connections?: number;
  followers?: number;
  experience?: Array<{ title?: string; company?: string }>;
  skills?: string[];
  email?: string;
  phone?: string;
}

interface EnrichmentInstagram {
  fullName?: string;
  biography?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  isBusinessAccount?: boolean;
  businessCategory?: string;
  externalUrl?: string;
}

interface EnrichmentTikTok {
  fullName?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  heartsCount?: number;
  videoCount?: number;
}

interface EnrichmentFacebook {
  name?: string;
  about?: string;
  followers?: number;
  likes?: number;
  catégories?: string[];
  email?: string;
  phone?: string;
  website?: string;
}

interface EnrichmentWebsite {
  emails?: string[];
  phones?: string[];
  socialLinks?: string[];
  companyName?: string;
}

interface EnrichmentData {
  linkedin?: EnrichmentLinkedIn;
  instagram?: EnrichmentInstagram;
  tiktok?: EnrichmentTikTok;
  facebook?: EnrichmentFacebook;
  website?: EnrichmentWebsite;
}

function formatEnrichmentContext(data: EnrichmentData): string {
  const sections: string[] = [];

  if (data.linkedin) {
    const li = data.linkedin;
    const lines: string[] = [];
    if (li.position || li.company) {
      lines.push(`- Poste: ${li.position ?? "?"} chez ${li.company ?? "?"}`);
    }
    if (li.headline) lines.push(`- Headline: ${li.headline}`);
    if (li.location) lines.push(`- Localisation: ${li.location}`);
    if (li.connections) lines.push(`- Connexions: ${li.connections}`);
    if (li.followers) lines.push(`- Followers: ${li.followers}`);
    if (li.skills && li.skills.length > 0) {
      lines.push(`- Competences: ${li.skills.join(", ")}`);
    }
    if (li.summary) lines.push(`- Resume: ${li.summary.slice(0, 300)}`);
    if (lines.length > 0) {
      sections.push(`### LinkedIn\n${lines.join("\n")}`);
    }
  }

  if (data.instagram) {
    const ig = data.instagram;
    const lines: string[] = [];
    if (ig.followersCount != null || ig.postsCount != null) {
      lines.push(
        `- ${ig.followersCount ?? 0} abonnes, ${ig.postsCount ?? 0} posts`,
      );
    }
    if (ig.biography) lines.push(`- Bio: ${ig.biography}`);
    if (ig.isBusinessAccount != null) {
      lines.push(
        `- Compte business: ${ig.isBusinessAccount ? "Oui" : "Non"}${ig.businessCategory ? ` (${ig.businessCategory})` : ""}`,
      );
    }
    if (ig.externalUrl) lines.push(`- Site externe: ${ig.externalUrl}`);
    if (lines.length > 0) {
      sections.push(`### Instagram\n${lines.join("\n")}`);
    }
  }

  if (data.tiktok) {
    const tt = data.tiktok;
    const lines: string[] = [];
    if (tt.followersCount != null || tt.heartsCount != null) {
      lines.push(
        `- ${tt.followersCount ?? 0} abonnes, ${tt.heartsCount ?? 0} likes`,
      );
    }
    if (tt.bio) lines.push(`- Bio: ${tt.bio}`);
    if (tt.videoCount != null) lines.push(`- Videos: ${tt.videoCount}`);
    if (lines.length > 0) {
      sections.push(`### TikTok\n${lines.join("\n")}`);
    }
  }

  if (data.facebook) {
    const fb = data.facebook;
    const lines: string[] = [];
    if (fb.followers != null || fb.likes != null) {
      lines.push(`- ${fb.followers ?? 0} abonnes, ${fb.likes ?? 0} likes`);
    }
    if (fb.catégories && fb.catégories.length > 0) {
      lines.push(`- Catégories: ${fb.catégories.join(", ")}`);
    }
    if (fb.about) lines.push(`- A propos: ${fb.about.slice(0, 300)}`);
    if (fb.website) lines.push(`- Site: ${fb.website}`);
    if (lines.length > 0) {
      sections.push(`### Facebook\n${lines.join("\n")}`);
    }
  }

  if (data.website) {
    const ws = data.website;
    const lines: string[] = [];
    if (ws.companyName) lines.push(`- Entreprise: ${ws.companyName}`);
    if (ws.emails && ws.emails.length > 0) {
      lines.push(`- Emails: ${ws.emails.join(", ")}`);
    }
    if (ws.phones && ws.phones.length > 0) {
      lines.push(`- Telephones: ${ws.phones.join(", ")}`);
    }
    if (ws.socialLinks && ws.socialLinks.length > 0) {
      lines.push(`- Liens sociaux: ${ws.socialLinks.join(", ")}`);
    }
    if (lines.length > 0) {
      sections.push(`### Site web\n${lines.join("\n")}`);
    }
  }

  if (sections.length === 0) return "";

  return `\n## Donnees d'enrichissement (profils publics du client)\n\n${sections.join("\n\n")}\n`;
}

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
    return NextResponse.json({ error: "clientId requis" }, { status: 400 });
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
        .select(
          "content, created_at, sender:profiles!messages_sender_id_fkey(full_name)",
        )
        .or(`sender_id.eq.${clientId},receiver_id.eq.${clientId}`)
        .order("created_at", { ascending: false })
        .limit(20),
      // 4. Recent calls with notes
      supabase
        .from("call_calendar")
        .select("id, title, date, call_type, status, actual_duration_seconds")
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(5),
      // 5. Flag history
      supabase
        .from("client_flag_history")
        .select("previous_flag, new_flag, reason, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(10),
      // 6. Student notes
      supabase
        .from("student_notes")
        .select(
          "content, is_pinned, created_at, author:profiles!student_notes_author_id_fkey(full_name)",
        )
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
        .select(
          "title, description, target_value, current_value, unit, status, deadline",
        )
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

    // Fetch enrichment data from crm_contacts (match by converted_profile_id or email)
    let enrichmentData: Record<string, unknown> | null = null;
    {
      // Try by converted_profile_id first
      const { data: contactByProfile } = await (supabase as any)
        .from("crm_contacts")
        .select("enrichment_data")
        .eq("converted_profile_id", clientId)
        .not("enrichment_data", "is", null)
        .maybeSingle();

      if (contactByProfile?.enrichment_data) {
        enrichmentData = contactByProfile.enrichment_data;
      } else if (profile.email) {
        // Fallback: match by email
        const { data: contactByEmail } = await (supabase as any)
          .from("crm_contacts")
          .select("enrichment_data")
          .eq("email", profile.email)
          .not("enrichment_data", "is", null)
          .maybeSingle();

        if (contactByEmail?.enrichment_data) {
          enrichmentData = contactByEmail.enrichment_data;
        }
      }
    }

    // Fetch call notes for recent calls
    let callNotes: Array<{
      call_id: string;
      summary: string | null;
      next_steps: string | null;
      action_items: unknown[];
    }> = [];
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
    userPrompt += `- **Dernière activité** : ${profile.last_active_at ?? "Inconnue"}\n`;

    // Student details
    if (details) {
      userPrompt += `\n## Donnees etudiant\n`;
      userPrompt += `- **Drapeau** : ${details.flag ?? "green"}\n`;
      userPrompt += `- **Tag** : ${details.tag ?? "standard"}\n`;
      userPrompt += `- **Score sante** : ${details.health_score ?? 0}/100\n`;
      userPrompt += `- **Score engagement** : ${details.engagement_score ?? 0}/100\n`;
      userPrompt += `- **Étape** : ${details.pipeline_stage ?? "onboarding"}\n`;
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
        if (note?.next_steps)
          userPrompt += `  Prochaines étapes : ${note.next_steps}\n`;
        if (note?.action_items && Array.isArray(note.action_items)) {
          const items = note.action_items as Array<{
            title: string;
            done: boolean;
          }>;
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
        userPrompt += `- ${fh.created_at?.split("T")[0]} : ${fh.previous_flag} -> ${fh.new_flag}${fh.reason ? ` (${fh.reason})` : ""}\n`;
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

    // Enrichment data from Apify scraping (crm_contacts)
    if (enrichmentData && typeof enrichmentData === "object") {
      const enrichmentBlock = formatEnrichmentContext(
        enrichmentData as EnrichmentData,
      );
      if (enrichmentBlock) {
        userPrompt += enrichmentBlock;
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
