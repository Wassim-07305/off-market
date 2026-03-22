import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateEmbedding,
  generateText,
  generateMemoryUpdate,
} from "@/lib/gemini";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { message, conversation_id } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Create conversation server-side if not provided
  let activeConvId = conversation_id;
  if (!activeConvId) {
    const title =
      message.length > 50 ? message.slice(0, 50) + "..." : message;
    const { data: newConv } = await admin
      .from("ai_conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();
    activeConvId = newConv?.id ?? null;
  }

  // Check AI keys upfront
  if (!process.env.GROQ_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "L'IA n'est pas configuree. Ajoutez GROQ_API_KEY ou OPENROUTER_API_KEY dans les variables d'environnement." },
      { status: 503 },
    );
  }

  try {
    // 1. Get user profile
    const { data: userProfile } = await admin
      .from("profiles")
      .select("id, full_name, role, specialties")
      .eq("id", user.id)
      .single();

    const role = userProfile?.role ?? "client";
    const userName = userProfile?.full_name ?? "Utilisateur";

    // 2. Find coach context
    let coachId = user.id;
    let coachName = userName;
    if (role === "client" || role === "prospect") {
      const { data: assignment } = await admin
        .from("coach_assignments")
        .select("coach_id")
        .eq("client_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (assignment) coachId = assignment.coach_id;
      const { data: cp } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", coachId)
        .single();
      coachName = cp?.full_name ?? "ton coach";
    }

    // 3. Get AI config
    const { data: config } = await admin
      .from("coach_ai_config")
      .select("*")
      .eq("coach_id", coachId)
      .maybeSingle();
    const aiName = config?.ai_name ?? "AlexIA";

    // 4. Fetch REAL platform data based on role
    const platformData = await fetchPlatformData(admin, user.id, role, coachId);

    // 5. Search relevant document chunks (RAG)
    let ragContext = "";
    try {
      const queryEmbedding = await generateEmbedding(message);
      if (queryEmbedding.length > 0) {
        const { data: relevantChunks } = await admin.rpc(
          "match_coach_chunks",
          {
            query_embedding: JSON.stringify(queryEmbedding),
            p_coach_id: coachId,
            match_threshold: 0.3,
            match_count: 5,
          },
        );
        ragContext = (relevantChunks ?? [])
          .map((c: { content: string }) => c.content)
          .join("\n\n---\n\n");
      }
    } catch {
      // RAG not available
    }

    // 6. Get client memory
    const { data: memory } = await admin
      .from("client_ai_memory")
      .select("summary")
      .eq("client_id", user.id)
      .eq("coach_id", coachId)
      .maybeSingle();

    // 7. Get recent conversation history
    let history = "";
    if (activeConvId) {
      const { data: recentMessages } = await admin
        .from("ai_messages")
        .select("role, content")
        .eq("conversation_id", activeConvId)
        .order("created_at", { ascending: false })
        .limit(6);
      if (recentMessages?.length) {
        history = recentMessages
          .reverse()
          .map(
            (m) =>
              `${m.role === "user" ? userName : aiName}: ${m.content}`,
          )
          .join("\n");
      }
    }

    // 8. Build role-specific system prompt
    const systemPrompt = buildSystemPrompt({
      aiName,
      role,
      userName,
      coachName,
      platformData,
      ragContext,
      memory: memory?.summary ?? "",
      history,
      config,
    });

    // 9. Generate AI response
    const response = await generateText(systemPrompt, message);

    // 10. Store messages
    if (activeConvId) {
      await admin.from("ai_messages").insert([
        { conversation_id: activeConvId, role: "user", content: message },
        {
          conversation_id: activeConvId,
          role: "assistant",
          content: response,
        },
      ]);
    }

    // 11. Update memory in background
    updateMemoryInBackground(
      admin,
      user.id,
      coachId,
      memory?.summary ?? "",
      message,
      response,
    );

    return NextResponse.json({ response, conversation_id: activeConvId });
  } catch (error) {
    console.error("[AlexIA Chat] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation de la reponse" },
      { status: 500 },
    );
  }
}

// ─── Fetch real platform data per role ────────────────────────

async function fetchPlatformData(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  role: string,
  coachId: string,
): Promise<string> {
  const sections: string[] = [];

  try {
    if (role === "admin") {
      // Admin: global platform stats
      const [clientsRes, revenueRes, atRiskRes, recentClientsRes] =
        await Promise.all([
          admin
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "client"),
          admin
            .from("financial_entries")
            .select("amount, type, date")
            .gte(
              "date",
              new Date(new Date().setDate(1)).toISOString().split("T")[0],
            ),
          admin
            .from("student_details")
            .select("profile_id, tag, health_score, flag")
            .or("tag.eq.at_risk,flag.eq.red,flag.eq.orange"),
          admin
            .from("profiles")
            .select("full_name, created_at, role")
            .eq("role", "client")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

      const totalClients = clientsRes.count ?? 0;
      const entries = (revenueRes.data ?? []) as {
        amount: number;
        type: string;
      }[];
      const ca = entries
        .filter((e) => e.type === "ca")
        .reduce((s, e) => s + Number(e.amount), 0);
      const charges = entries
        .filter((e) => e.type === "charge")
        .reduce((s, e) => s + Number(e.amount), 0);
      const atRisk = (atRiskRes.data ?? []) as {
        profile_id: string;
        health_score: number;
      }[];
      const recent = (recentClientsRes.data ?? []) as {
        full_name: string;
        created_at: string;
      }[];

      sections.push(`## Donnees plateforme (temps reel)
- **${totalClients} clients** actifs
- **CA ce mois** : ${ca} EUR
- **Charges ce mois** : ${charges} EUR
- **Marge** : ${ca - charges} EUR
- **${atRisk.length} eleves a risque** (flag rouge/orange ou tag at_risk)
- **Derniers inscrits** : ${recent.map((r) => r.full_name).join(", ") || "Aucun"}
- **Score sante moyen des eleves a risque** : ${atRisk.length > 0 ? Math.round(atRisk.reduce((s, a) => s + (a.health_score ?? 0), 0) / atRisk.length) : "N/A"}%`);
    }

    if (role === "coach") {
      // Coach: their assigned students
      const { data: assignments } = await admin
        .from("coach_assignments")
        .select("client_id")
        .eq("coach_id", userId)
        .eq("status", "active");

      const clientIds = (assignments ?? []).map(
        (a: { client_id: string }) => a.client_id,
      );

      if (clientIds.length > 0) {
        const [studentsRes, detailsRes, sessionsRes] = await Promise.all([
          admin
            .from("profiles")
            .select("id, full_name, last_seen_at")
            .in("id", clientIds),
          admin
            .from("student_details")
            .select(
              "profile_id, health_score, tag, flag, pipeline_stage, goals, niche",
            )
            .in("profile_id", clientIds),
          admin
            .from("coaching_sessions")
            .select("id, status")
            .eq("coach_id", userId)
            .gte(
              "created_at",
              new Date(new Date().setDate(1)).toISOString(),
            ),
        ]);

        const students = (studentsRes.data ?? []) as {
          id: string;
          full_name: string;
          last_seen_at: string | null;
        }[];
        const details = (detailsRes.data ?? []) as {
          profile_id: string;
          health_score: number;
          tag: string;
          flag: string;
          pipeline_stage: string;
          goals: string;
          niche: string;
        }[];
        const detailMap = new Map(details.map((d) => [d.profile_id, d]));
        const sessions = sessionsRes.data ?? [];

        const atRisk = details.filter(
          (d) =>
            d.tag === "at_risk" || d.flag === "red" || d.flag === "orange",
        );

        sections.push(`## Tes eleves (${students.length} actifs)
${students
  .map((s) => {
    const d = detailMap.get(s.id);
    return `- **${s.full_name}** : sante ${d?.health_score ?? "?"}%, etape ${d?.pipeline_stage ?? "?"}, tag ${d?.tag ?? "standard"}, flag ${d?.flag ?? "vert"}${d?.goals ? `, objectif: "${d.goals}"` : ""}${d?.niche ? `, niche: ${d.niche}` : ""}`;
  })
  .join("\n")}

- **${atRisk.length} a risque** sur ${students.length}
- **${sessions.length} sessions** ce mois
- **Sante moyenne** : ${students.length > 0 ? Math.round(details.reduce((s, d) => s + (d.health_score ?? 0), 0) / details.length) : 0}%`);
      } else {
        sections.push(
          "## Tes eleves\nAucun eleve assigne actuellement.",
        );
      }
    }

    if (role === "setter" || role === "closer") {
      // Sales: pipeline data
      const { data: contacts } = await admin
        .from("crm_contacts")
        .select("full_name, stage, estimated_value, last_contact_at")
        .eq("assigned_to", userId)
        .order("updated_at", { ascending: false })
        .limit(15);

      const pipeline = (contacts ?? []) as {
        full_name: string;
        stage: string;
        estimated_value: number;
        last_contact_at: string | null;
      }[];

      const byStage: Record<string, number> = {};
      let totalValue = 0;
      for (const c of pipeline) {
        byStage[c.stage] = (byStage[c.stage] ?? 0) + 1;
        totalValue += Number(c.estimated_value ?? 0);
      }

      sections.push(`## Ton pipeline (${pipeline.length} prospects)
${Object.entries(byStage)
  .map(([stage, count]) => `- **${stage}** : ${count}`)
  .join("\n")}
- **Valeur totale** : ${totalValue} EUR
- **Derniers contacts** : ${pipeline
        .slice(0, 5)
        .map((c) => `${c.full_name} (${c.stage})`)
        .join(", ")}`);
    }

    if (role === "client" || role === "prospect") {
      // Client: their own progress
      const [detailRes, progressRes, journalRes] = await Promise.all([
        admin
          .from("student_details")
          .select("*")
          .eq("profile_id", userId)
          .maybeSingle(),
        admin
          .from("lesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        admin
          .from("journal_entries")
          .select("title, mood, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const d = detailRes.data as {
        health_score?: number;
        pipeline_stage?: string;
        goals?: string;
        niche?: string;
        current_revenue?: number;
        revenue_objective?: number;
      } | null;
      const completedLessons = progressRes.count ?? 0;
      const journal = (journalRes.data ?? []) as {
        title: string;
        mood: string;
        created_at: string;
      }[];

      sections.push(`## Ton profil
- **Score sante** : ${d?.health_score ?? 50}%
- **Etape** : ${d?.pipeline_stage ?? "onboarding"}
- **Niche** : ${d?.niche ?? "Non definie"}
- **Objectifs** : ${d?.goals ?? "Non definis"}
- **Revenus actuels** : ${d?.current_revenue ?? 0} EUR/mois
- **Objectif revenus** : ${d?.revenue_objective ?? "Non defini"}
- **Lecons completees** : ${completedLessons}
- **Coach** : ${coachId !== userId ? "Assigne" : "Non assigne"}
${
  journal.length > 0
    ? `\n### Derniers journaux\n${journal.map((j) => `- ${j.title} (humeur: ${j.mood})`).join("\n")}`
    : ""
}`);
    }
  } catch (err) {
    console.warn("[AlexIA] Platform data fetch error:", err);
    sections.push(
      "## Donnees plateforme\nErreur lors de la recuperation des donnees.",
    );
  }

  return sections.join("\n\n");
}

// ─── Build role-specific system prompt ────────────────────────

function buildSystemPrompt({
  aiName,
  role,
  userName,
  coachName,
  platformData,
  ragContext,
  memory,
  history,
  config,
}: {
  aiName: string;
  role: string;
  userName: string;
  coachName: string;
  platformData: string;
  ragContext: string;
  memory: string;
  history: string;
  config: { system_instructions?: string; tone?: string } | null;
}) {
  const roleDescriptions: Record<string, string> = {
    admin: `Tu es ${aiName}, l'assistant IA de la plateforme Off Market. Tu aides ${userName} (admin) a piloter son business de coaching. Tu as acces aux donnees reelles de la plateforme ci-dessous. Base TOUTES tes reponses sur ces donnees concretes.`,
    coach: `Tu es ${aiName}, l'assistant IA de ${userName} (coach). Tu l'aides a gerer ses eleves, preparer ses sessions, et analyser la progression de son portefeuille. Tu as acces aux donnees reelles de ses eleves ci-dessous.`,
    setter: `Tu es ${aiName}, l'assistant IA de ${userName} (setter). Tu l'aides a qualifier ses prospects, rediger des messages d'approche, et optimiser son pipeline. Tu as acces a son pipeline reel ci-dessous.`,
    closer: `Tu es ${aiName}, l'assistant IA de ${userName} (closer). Tu l'aides a preparer ses appels de closing, traiter les objections, et ameliorer son taux de conversion. Tu as acces a son pipeline reel ci-dessous.`,
    client: `Tu es ${aiName}, l'assistant personnel de ${userName}. Tu l'accompagnes dans son parcours de coaching avec ${coachName}. Tu as acces a son profil et sa progression ci-dessous.`,
    prospect: `Tu es ${aiName}, l'assistant personnel de ${userName}. Tu l'aides a definir ses objectifs et a demarrer son parcours. Tu as acces a son profil ci-dessous.`,
  };

  return `${roleDescriptions[role] ?? roleDescriptions.client}

REGLES ABSOLUES:
- Reponds en francais, tutoie l'utilisateur
- Base tes reponses sur les DONNEES REELLES fournies ci-dessous, pas sur des generalites
- Cite des noms, chiffres et faits concrets issus des donnees
- Si tu n'as pas assez de donnees pour repondre, dis-le et suggere ce qu'il faudrait verifier
- Sois concis et actionnable
- Ne jamais inventer de donnees

${config?.system_instructions ? `INSTRUCTIONS PERSONNALISEES:\n${config.system_instructions}\n` : ""}
${config?.tone ? `TON: ${config.tone}\n` : ""}

${platformData}

${ragContext ? `## Documents de reference\n${ragContext}\n` : ""}
${memory ? `## Memoire (ce que tu sais de cet utilisateur)\n${memory}\n` : ""}
${history ? `## Historique recent\n${history}\n` : ""}`;
}

// ─── Fire-and-forget memory update ────────────────────────────

function updateMemoryInBackground(
  admin: ReturnType<typeof createAdminClient>,
  clientId: string,
  coachId: string,
  existingMemory: string,
  userMessage: string,
  aiResponse: string,
) {
  const conversation = `Client: ${userMessage}\nAlexIA: ${aiResponse}`;
  generateMemoryUpdate(existingMemory, conversation)
    .then(async (updatedMemory) => {
      await admin.from("client_ai_memory").upsert(
        {
          client_id: clientId,
          coach_id: coachId,
          summary: updatedMemory,
          conversation_count: (existingMemory ? 1 : 0) + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id,coach_id" },
      );
    })
    .catch((err) => console.error("[AlexIA Memory] Update failed:", err));
}
