import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Tu es un assistant specialise dans la generation de documents de coaching pour la plateforme Off-Market.

Tu recois les donnees suivantes :
- La transcription d'un appel de coaching
- Les reponses du client aux workbooks (questionnaires pre-remplis par module)
- Les questions pre-appel du client
- Les informations sur l'appel (client, coach, date, type)

Tu dois generer un document de fusion complet en francais qui synthetise toutes ces informations en un document coherent et actionnable.

Structure du document :

1. **Profil et situation du client** — Resume du contexte client base sur les reponses workbook et les questions pre-appel
2. **Synthese de l'appel** — Les points essentiels discutes pendant l'appel (5-8 points cles)
3. **Analyse croisee** — Mise en perspective des reponses workbook avec ce qui a ete dit en appel (coherences, ecarts, evolutions)
4. **Diagnostics** — Problematiques identifiees, blocages, opportunites
5. **Plan d'action personnalise** — Actions concretes avec priorite (haute/moyenne/basse), responsable et deadline suggeree
6. **Metriques et indicateurs** — KPIs a suivre pour mesurer la progression
7. **Notes pour le prochain appel** — Points a reprendre, questions de suivi

Regles :
- Sois factuel, base-toi uniquement sur les donnees fournies
- Utilise le format HTML pour le document (balises h2, h3, p, ul, li, strong, em)
- Genere aussi une version Markdown du meme contenu
- Sois concis mais complet
- Mets en avant les engagements du client
- Si des informations manquent, ne les invente pas
- Tutoie le client
- Utilise des classes CSS simples pour la mise en forme`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Check staff role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json(
      { error: "Acces reserve aux coachs et admins" },
      { status: 403 },
    );
  }

  const { callId } = await request.json();

  if (!callId) {
    return NextResponse.json({ error: "callId requis" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY non configuree" },
      { status: 500 },
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

    // 4. Fetch workbook submissions for this client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientData = call.client as any;
    const clientId = clientData?.id;
    let workbookSubmissions: Array<{
      answers: Record<string, unknown>;
      status: string;
      workbook: { title: string; module_type: string; fields: unknown[] } | null;
    }> = [];

    if (clientId) {
      const { data: submissions } = await supabase
        .from("workbook_submissions")
        .select("answers, status, workbook:workbooks(title, module_type, fields)")
        .eq("client_id", clientId)
        .in("status", ["submitted", "reviewed"])
        .order("created_at", { ascending: false });

      if (submissions) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workbookSubmissions = submissions as any;
      }
    }

    // 5. Fetch session notes
    const { data: sessionNotes } = await supabase
      .from("call_session_notes")
      .select("content, action_items")
      .eq("call_id", callId)
      .maybeSingle();

    // Check we have at least some data
    const hasData =
      !!transcript?.content ||
      !!preCallAnswers ||
      workbookSubmissions.length > 0 ||
      !!sessionNotes?.content;

    if (!hasData) {
      return NextResponse.json(
        {
          error:
            "Aucune donnee disponible pour generer le document (pas de transcription, pas de workbook, pas de questions pre-appel)",
        },
        { status: 400 },
      );
    }

    // Build prompt
    let userPrompt = `Genere le document de fusion pour l'appel suivant :\n\n`;
    userPrompt += `## Informations de l'appel\n`;
    userPrompt += `- **Titre** : ${call.title}\n`;
    userPrompt += `- **Date** : ${call.date}\n`;
    userPrompt += `- **Type** : ${call.call_type}\n`;

    if (clientData?.full_name) {
      userPrompt += `- **Client** : ${clientData.full_name}\n`;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coach = call.assigned_profile as any;
    if (coach?.full_name) {
      userPrompt += `- **Coach** : ${coach.full_name}\n`;
    }

    // Workbook answers
    if (workbookSubmissions.length > 0) {
      userPrompt += `\n## Reponses aux workbooks\n`;
      for (const sub of workbookSubmissions) {
        const wb = sub.workbook;
        if (!wb) continue;
        userPrompt += `\n### ${wb.title} (${wb.module_type ?? "general"})\n`;

        const fields = wb.fields as Array<{
          id: string;
          label: string;
          type: string;
        }>;
        for (const field of fields) {
          const answer = sub.answers[field.id];
          if (answer !== undefined && answer !== null && answer !== "") {
            userPrompt += `- **${field.label}** : ${answer}\n`;
          }
        }
      }
    }

    // Pre-call answers
    if (preCallAnswers) {
      userPrompt += `\n## Questions pre-appel\n`;
      userPrompt += `**Objectif :** ${preCallAnswers.objective}\n`;
      userPrompt += `**Solutions essayees :** ${preCallAnswers.tried_solutions}\n`;
    }

    // Transcript
    if (transcript?.content) {
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

      const truncated =
        formattedTranscript.length > 50000
          ? formattedTranscript.slice(0, 50000) +
            "\n\n[... transcription tronquee]"
          : formattedTranscript;

      userPrompt += `\n## Transcription de l'appel\n${truncated}\n`;
    }

    // Session notes
    if (sessionNotes?.content) {
      userPrompt += `\n## Notes de session\n${sessionNotes.content}\n`;
    }

    userPrompt += `\n---\nGenere le document en deux formats : d'abord le HTML complet (entre les balises <html_output> et </html_output>), puis le Markdown (entre <markdown_output> et </markdown_output>).`;

    // Call Claude
    const startTime = Date.now();
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const generationTime = Date.now() - startTime;
    const textContent = response.content.find((c) => c.type === "text");
    const fullText = textContent?.text ?? "";

    // Parse HTML and Markdown from response
    const htmlMatch = fullText.match(
      /<html_output>([\s\S]*?)<\/html_output>/,
    );
    const mdMatch = fullText.match(
      /<markdown_output>([\s\S]*?)<\/markdown_output>/,
    );

    const contentHtml = htmlMatch?.[1]?.trim() ?? fullText;
    const contentMarkdown = mdMatch?.[1]?.trim() ?? null;

    const title = `Document de fusion — ${call.title} — ${call.date}`;

    // Save to DB
    const { data: doc, error: saveError } = await supabase
      .from("call_documents")
      .insert({
        call_id: callId,
        type: "transcript_fusion",
        title,
        content_html: contentHtml,
        content_markdown: contentMarkdown,
        generated_by: "ai",
        model: "claude-sonnet-4-5-20250514",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving call document:", saveError);
      return NextResponse.json({
        call_id: callId,
        type: "transcript_fusion",
        title,
        content_html: contentHtml,
        content_markdown: contentMarkdown,
        generation_time_ms: generationTime,
        saved: false,
      });
    }

    return NextResponse.json({
      ...doc,
      generation_time_ms: generationTime,
      tokens_used:
        response.usage.input_tokens + response.usage.output_tokens,
      saved: true,
    });
  } catch (error) {
    console.error("Transcript fusion generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du document de fusion" },
      { status: 500 },
    );
  }
}
