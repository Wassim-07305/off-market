import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Tu es un assistant specialise dans la synthese de documents de coaching pour la plateforme Off-Market.

Tu recois :
1. Les reponses d'un workbook rempli par un client (questions/reponses structurees)
2. La transcription d'un appel de coaching associe

Tu dois fusionner ces deux sources en un document structure et coherent en francais, au format Markdown, avec les sections suivantes :

1. **Profil client** — Synthese du positionnement, objectifs et situation actuelle du client (base sur le workbook)
2. **Points abordes en appel** — Resume des sujets discutes pendant l'appel
3. **Analyse croisee** — Mise en perspective des reponses du workbook avec ce qui a ete dit en appel (coherences, ecarts, nuances)
4. **Diagnostic** — Problematiques identifiees et forces du client
5. **Plan d'action recommande** — Actions concretes a mettre en place, avec priorites
6. **Suivi** — Indicateurs a surveiller et prochaines etapes

Regles :
- Sois factuel et base-toi uniquement sur les donnees fournies
- Utilise le format Markdown
- Sois concis mais complet
- Tutoie le client dans le document
- Si des informations manquent, ne les invente pas
- Mets en evidence les liens entre les reponses du workbook et les echanges de l'appel`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Only admin and coach can generate workbook fusions
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { submissionId, callId } = await request.json();

  if (!submissionId || !callId) {
    return NextResponse.json(
      { error: "submissionId et callId requis" },
      { status: 400 },
    );
  }

  try {
    // 1. Fetch workbook submission with workbook details
    const { data: submission, error: subError } = await supabase
      .from("workbook_submissions")
      .select("*, workbook:workbooks(*)")
      .eq("id", submissionId)
      .single();

    if (subError || !submission) {
      return NextResponse.json(
        { error: "Soumission introuvable" },
        { status: 404 },
      );
    }

    // 2. Fetch call info
    const { data: call, error: callError } = await supabase
      .from("call_calendar")
      .select(
        "*, client:profiles!call_calendar_client_id_fkey(id, full_name, email)",
      )
      .eq("id", callId)
      .single();

    if (callError || !call) {
      return NextResponse.json(
        { error: "Appel introuvable" },
        { status: 404 },
      );
    }

    // 3. Fetch transcript
    const { data: transcript } = await supabase
      .from("call_transcripts")
      .select("content, duration_seconds, language")
      .eq("call_id", callId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!transcript?.content) {
      return NextResponse.json(
        { error: "Aucune transcription disponible pour cet appel" },
        { status: 400 },
      );
    }

    // 4. Build prompt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workbook = submission.workbook as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = call.client as any;
    const fields = workbook?.fields ?? [];
    const answers = submission.answers as Record<string, unknown>;

    let userPrompt = `Fusionne les donnees suivantes en un document structure :\n\n`;

    // Workbook answers
    userPrompt += `## Workbook : ${workbook?.title ?? "Sans titre"}\n\n`;
    for (const field of fields) {
      const answer = answers[field.id];
      if (answer !== undefined && answer !== null && answer !== "") {
        userPrompt += `**${field.label}** : ${String(answer)}\n`;
      }
    }

    // Call info
    userPrompt += `\n## Informations de l'appel\n`;
    userPrompt += `- **Titre** : ${call.title}\n`;
    userPrompt += `- **Date** : ${call.date}\n`;
    if (client?.full_name) {
      userPrompt += `- **Client** : ${client.full_name}\n`;
    }

    // Transcript
    const entries =
      typeof transcript.content === "string"
        ? JSON.parse(transcript.content)
        : transcript.content;

    const formattedTranscript = entries
      .map(
        (e: { speaker_name: string; text: string }) =>
          `${e.speaker_name}: ${e.text}`,
      )
      .join("\n");

    // Truncate if too long
    const truncated =
      formattedTranscript.length > 50000
        ? formattedTranscript.slice(0, 50000) +
          "\n\n[... transcription tronquee pour longueur]"
        : formattedTranscript;

    userPrompt += `\n## Transcription de l'appel\n${truncated}\n`;

    // 5. Call AI
    const startTime = Date.now();

    const result = await callOpenRouter({
      system: SYSTEM_PROMPT,
      maxTokens: 4096,
      messages: [{ role: "user", content: userPrompt }],
    });

    const generationTime = Date.now() - startTime;
    const content = result.text;

    // 6. Save as call_document
    const { data: doc, error: saveError } = await supabase
      .from("call_documents")
      .upsert(
        {
          call_id: callId,
          type: "workbook_export" as const,
          title: `Fusion — ${workbook?.title ?? "Workbook"} + Appel ${call.title}`,
          content_markdown: content,
          content_html: "",
          generated_by: user.id,
          model: "openrouter",
          metadata: {
            submission_id: submissionId,
            workbook_id: submission.workbook_id,
            tokens_used:
              result.usage.input_tokens + result.usage.output_tokens,
            generation_time_ms: generationTime,
          },
        },
        { onConflict: "call_id,type" },
      )
      .select()
      .single();

    if (saveError) {
      console.error("Error saving workbook fusion document:", saveError);
      return NextResponse.json({
        content,
        saved: false,
      });
    }

    return NextResponse.json({
      id: doc.id,
      content: doc.content_markdown,
      title: doc.title,
      tokens_used: result.usage.input_tokens + result.usage.output_tokens,
      generation_time_ms: generationTime,
      saved: true,
    });
  } catch (error) {
    console.error("Workbook fusion error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation de la fusion" },
      { status: 500 },
    );
  }
}
