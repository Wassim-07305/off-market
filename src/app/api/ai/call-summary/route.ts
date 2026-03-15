import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Tu es un assistant specialise dans la synthese d'appels de coaching pour la plateforme Off-Market.

Tu recois les donnees suivantes d'un appel de coaching :
- Les questions pre-appel du client (objectif + solutions deja essayees)
- La transcription complete de l'appel
- Les notes de session du coach (si disponibles)
- Les notes post-appel du coach (si disponibles)

Tu dois generer un document de synthese structure en francais avec les sections suivantes :

1. **Resume executif** — 3-5 phrases resumant l'essentiel de l'appel
2. **Contexte client** — Objectif du client et solutions deja tentees (base sur les questions pre-appel)
3. **Points cles abordes** — Les sujets principaux discutes pendant l'appel (liste a puces)
4. **Diagnostics et observations** — Analyse des problematiques identifiees
5. **Recommandations et plan d'action** — Actions concretes a mettre en place, avec responsable et deadline si possible
6. **Prochaines etapes** — Ce qui doit se passer avant le prochain appel
7. **Indicateurs de suivi** — Metriques ou signaux a surveiller

Regles :
- Sois factuel et base-toi uniquement sur les donnees fournies
- Utilise le format Markdown
- Sois concis mais complet
- Mets en avant les engagements pris par le client
- Si des informations manquent, ne les invente pas
- Tutoie le client dans le document`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Only admin and coach can generate call summaries
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { callId } = await request.json();

  if (!callId) {
    return NextResponse.json(
      { error: "callId requis" },
      { status: 400 },
    );
  }

  try {
    // 1. Fetch call info
    const { data: call, error: callError } = await supabase
      .from("call_calendar")
      .select(
        "*, client:profiles!call_calendar_client_id_fkey(id, full_name, email), assigned_profile:profiles!call_calendar_assigned_to_fkey(id, full_name)",
      )
      .eq("id", callId)
      .single();

    if (callError || !call) {
      return NextResponse.json(
        { error: "Appel introuvable" },
        { status: 404 },
      );
    }

    // 2. Fetch transcript
    const { data: transcript } = await supabase
      .from("call_transcripts")
      .select("content, duration_seconds, language")
      .eq("call_id", callId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Fetch pre-call answers
    const { data: preCallAnswers } = await supabase
      .from("pre_call_answers")
      .select("objective, tried_solutions")
      .eq("call_id", callId)
      .maybeSingle();

    // 4. Fetch session notes
    const { data: sessionNotes } = await supabase
      .from("call_session_notes")
      .select("content, action_items, is_shared_with_client")
      .eq("call_id", callId)
      .maybeSingle();

    // 5. Fetch call notes (post-call debrief)
    const { data: callNotes } = await supabase
      .from("call_notes")
      .select("summary, client_mood, outcome, next_steps, action_items")
      .eq("call_id", callId)
      .maybeSingle();

    // Build sources tracking
    const sources = {
      has_transcript: !!transcript?.content,
      has_pre_call: !!preCallAnswers,
      has_session_notes: !!sessionNotes?.content,
      has_call_notes: !!callNotes?.summary,
    };

    // Check we have at least some data
    if (!sources.has_transcript && !sources.has_pre_call && !sources.has_session_notes && !sources.has_call_notes) {
      return NextResponse.json(
        { error: "Aucune donnee disponible pour generer la synthese (pas de transcription, pas de questions pre-appel, pas de notes)" },
        { status: 400 },
      );
    }

    // Build the prompt with all available data
    let userPrompt = `Genere la synthese de l'appel suivant :\n\n`;
    userPrompt += `## Informations de l'appel\n`;
    userPrompt += `- **Titre** : ${call.title}\n`;
    userPrompt += `- **Date** : ${call.date}\n`;
    userPrompt += `- **Type** : ${call.call_type}\n`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = call.client as any;
    if (client?.full_name) {
      userPrompt += `- **Client** : ${client.full_name}\n`;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coach = call.assigned_profile as any;
    if (coach?.full_name) {
      userPrompt += `- **Coach** : ${coach.full_name}\n`;
    }
    if (call.actual_duration_seconds) {
      const mins = Math.round(call.actual_duration_seconds / 60);
      userPrompt += `- **Duree** : ${mins} minutes\n`;
    }

    if (preCallAnswers) {
      userPrompt += `\n## Questions pre-appel (remplies par le client)\n`;
      userPrompt += `**Objectif de l'appel :** ${preCallAnswers.objective}\n`;
      userPrompt += `**Solutions deja essayees :** ${preCallAnswers.tried_solutions}\n`;
    }

    if (transcript?.content) {
      const entries = typeof transcript.content === "string"
        ? JSON.parse(transcript.content)
        : transcript.content;

      // Format transcript entries
      const formattedTranscript = entries
        .map((e: { speaker_name: string; text: string }) => `${e.speaker_name}: ${e.text}`)
        .join("\n");

      // Truncate if too long (keep ~50k chars to stay within token limits)
      const truncated = formattedTranscript.length > 50000
        ? formattedTranscript.slice(0, 50000) + "\n\n[... transcription tronquee pour longueur]"
        : formattedTranscript;

      userPrompt += `\n## Transcription de l'appel\n${truncated}\n`;
    }

    if (sessionNotes?.content) {
      userPrompt += `\n## Notes de session (pendant l'appel)\n${sessionNotes.content}\n`;
      if (sessionNotes.action_items && Array.isArray(sessionNotes.action_items)) {
        const items = sessionNotes.action_items as Array<{ title: string; done: boolean }>;
        if (items.length > 0) {
          userPrompt += `\n**Actions notees pendant l'appel :**\n`;
          items.forEach((item) => {
            userPrompt += `- [${item.done ? "x" : " "}] ${item.title}\n`;
          });
        }
      }
    }

    if (callNotes) {
      userPrompt += `\n## Notes post-appel (debrief coach)\n`;
      if (callNotes.summary) userPrompt += `**Resume :** ${callNotes.summary}\n`;
      if (callNotes.client_mood) userPrompt += `**Humeur client :** ${callNotes.client_mood}\n`;
      if (callNotes.outcome) userPrompt += `**Issue :** ${callNotes.outcome}\n`;
      if (callNotes.next_steps) userPrompt += `**Prochaines etapes :** ${callNotes.next_steps}\n`;
      if (callNotes.action_items && Array.isArray(callNotes.action_items)) {
        const items = callNotes.action_items as Array<{ title: string; done: boolean }>;
        if (items.length > 0) {
          userPrompt += `**Actions :**\n`;
          items.forEach((item) => {
            userPrompt += `- [${item.done ? "x" : " "}] ${item.title}\n`;
          });
        }
      }
    }

    // Call AI
    const startTime = Date.now();

    const result = await callOpenRouter({
      system: SYSTEM_PROMPT,
      maxTokens: 4096,
      messages: [{ role: "user", content: userPrompt }],
    });

    const generationTime = Date.now() - startTime;
    const content = result.text;

    // Parse sections from markdown content
    const sections: Record<string, string> = {};
    const sectionRegex = /^## (.+)$/gm;
    let match;
    const matches: { title: string; index: number }[] = [];
    while ((match = sectionRegex.exec(content)) !== null) {
      matches.push({ title: match[1], index: match.index + match[0].length });
    }
    for (let i = 0; i < matches.length; i++) {
      const end = i + 1 < matches.length ? matches[i + 1].index - matches[i + 1].title.length - 3 : content.length;
      sections[matches[i].title.toLowerCase().replace(/[^a-z0-9]+/g, "_")] = content.slice(matches[i].index, end).trim();
    }

    // Save to DB
    const { data: summary, error: saveError } = await supabase
      .from("call_summaries")
      .upsert(
        {
          call_id: callId,
          author_id: user.id,
          content,
          sections,
          model: "openrouter",
          tokens_used: result.usage.input_tokens + result.usage.output_tokens,
          generation_time_ms: generationTime,
          sources,
        },
        { onConflict: "call_id" },
      )
      .select()
      .single();

    if (saveError) {
      console.error("Error saving call summary:", saveError);
      // Return the content anyway even if save fails
      return NextResponse.json({
        content,
        sections,
        sources,
        saved: false,
      });
    }

    return NextResponse.json({
      id: summary.id,
      content: summary.content,
      sections: summary.sections,
      sources,
      tokens_used: result.usage.input_tokens + result.usage.output_tokens,
      generation_time_ms: generationTime,
      saved: true,
    });
  } catch (error) {
    console.error("Call summary generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation de la synthese" },
      { status: 500 },
    );
  }
}
