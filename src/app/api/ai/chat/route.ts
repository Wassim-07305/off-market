import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/openrouter";

const SYSTEM_PROMPT = `Tu es l'assistant IA de la plateforme Off Market (coaching business pour freelances/consultants). Tu parles en francais, tu tutoies.

Regles strictes :
- Reponses courtes et directes. Pas de bavardage, pas de formules de politesse inutiles.
- Pas d'emojis. Jamais.
- Utilise le format Markdown : titres (##), listes (-), **gras**, \`code\`. Pas de HTML.
- Quand on te donne des donnees clients/stats, analyse-les factuellement.
- Si tu n'as pas assez d'info, dis-le en une phrase et pose la question precise.
- Ne repete pas la question de l'utilisateur.`;

async function buildContext(supabase: ReturnType<typeof Object>, userId: string, role: string) {
  let context = "";

  if (role === "admin" || role === "coach") {
    // Fetch key stats
    const [
      { count: totalClients },
      { count: activeClients },
      { data: recentCalls },
      { data: atRiskClients },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "prospect"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "prospect").eq("is_active", true),
      supabase.from("call_calendar").select("id, title, date, call_type, client:profiles!call_calendar_client_id_fkey(full_name)").gte("date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]).order("date", { ascending: false }).limit(10),
      supabase.from("profiles").select("id, full_name, last_active_at").eq("role", "prospect").lt("last_active_at", new Date(Date.now() - 14 * 86400000).toISOString()).limit(20),
    ]);

    context += `\n## Contexte plateforme (donnees en temps reel)\n`;
    context += `- Clients total : ${totalClients ?? 0}\n`;
    context += `- Clients actifs : ${activeClients ?? 0}\n`;

    if (recentCalls && recentCalls.length > 0) {
      context += `\n### Derniers appels (7 jours)\n`;
      for (const c of recentCalls) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const client = c.client as any;
        context += `- ${c.date} : ${c.title} (${c.call_type}) — ${client?.full_name ?? "N/A"}\n`;
      }
    }

    if (atRiskClients && atRiskClients.length > 0) {
      context += `\n### Clients inactifs depuis 14+ jours\n`;
      for (const c of atRiskClients) {
        const daysAgo = c.last_active_at
          ? Math.round((Date.now() - new Date(c.last_active_at).getTime()) / 86400000)
          : "?";
        context += `- ${c.full_name} — inactif depuis ${daysAgo} jours\n`;
      }
    }

    // Fetch pipeline stats
    const { data: leads } = await supabase
      .from("leads")
      .select("status")
      .limit(500);

    if (leads && leads.length > 0) {
      const pipeline: Record<string, number> = {};
      for (const l of leads) {
        pipeline[l.status] = (pipeline[l.status] ?? 0) + 1;
      }
      context += `\n### Pipeline commercial\n`;
      for (const [status, count] of Object.entries(pipeline)) {
        context += `- ${status} : ${count}\n`;
      }
    }

    // Fetch past admin messages from channels (Alexia's answers) to train on patterns
    const { data: adminProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(5);

    if (adminProfiles && adminProfiles.length > 0) {
      const adminIds = adminProfiles.map((p: { id: string }) => p.id);
      const { data: adminMessages } = await supabase
        .from("messages")
        .select("content, created_at, channel:channels!messages_channel_id_fkey(name)")
        .in("sender_id", adminIds)
        .not("content", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (adminMessages && adminMessages.length > 0) {
        context += `\n### Reponses recentes d'Alexia (admin) dans les channels — inspire-toi de son ton et style\n`;
        for (const msg of adminMessages) {
          const content = (msg.content ?? "").slice(0, 300);
          if (content.length > 10) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const channel = msg.channel as any;
            context += `- [${channel?.name ?? "DM"}] ${content}\n`;
          }
        }
      }
    }
  }

  return context;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { messages } = await request.json();

  // Get user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "prospect";
  const userName = profile?.full_name ?? "Utilisateur";

  try {
    // Build real-time context from DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbContext = await buildContext(supabase as any, user.id, role);

    const systemWithContext = `${SYSTEM_PROMPT}\n\nUtilisateur connecte : ${userName} (role: ${role})${dbContext}`;

    const result = await callOpenRouter({
      system: systemWithContext,
      maxTokens: 2048,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    return NextResponse.json({ response: result.text });
  } catch (error) {
    console.error("AI chat error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors de la communication avec l'IA. Veuillez reessayer.";
    return NextResponse.json({ response: message }, { status: 200 });
  }
}
