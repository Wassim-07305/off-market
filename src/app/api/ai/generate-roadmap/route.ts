import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Tu es un expert en coaching business pour freelances et consultants ciblant 10k+ EUR/mois.

Tu dois generer une roadmap personnalisee pour un client, basee sur l'analyse de son appel de decouverte/kickoff.

La roadmap doit couvrir 5 piliers fondamentaux, avec des jalons concrets et des criteres de validation explicites :

1. **Marche** — Positionnement off-market, niche, ICP (Ideal Client Profile)
2. **Offre** — Structure de l'offre, pricing, packaging
3. **Communication** — Personal branding, contenu, visibilite
4. **Acquisition** — Prospection, inbound/outbound, systeme d'acquisition
5. **Conversion** — Process de vente, closing, suivi pipeline

Regles :
- Chaque jalon DOIT avoir des criteres de validation clairs et mesurables
- Adapte le rythme au profil du client (debutant = plus de jalons intermediaires)
- Sois specifique : pas de conseils generiques
- Les criteres doivent etre binaires (fait/pas fait)
- Ordonne les jalons de facon logique (du plus fondamental au plus avance)
- Maximum 8-12 jalons au total
- Reponds UNIQUEMENT en JSON valide, sans markdown ni commentaires

Format de reponse attendu :
{
  "title": "Roadmap [prenom] — [objectif principal]",
  "description": "Description courte de la roadmap",
  "milestones": [
    {
      "title": "Titre du jalon",
      "description": "Description detaillee",
      "validation_criteria": ["Critere 1 valide", "Critere 2 valide"],
      "order_index": 0
    }
  ]
}`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Verify user is staff
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const { clientId, callTranscript, context, callId } = await request.json();

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId requis" },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY non configuree" },
      { status: 500 },
    );
  }

  try {
    // Fetch client info
    const { data: client, error: clientError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Client introuvable" },
        { status: 404 },
      );
    }

    // Build prompt
    let userPrompt = `Genere une roadmap personnalisee pour ce client :\n\n`;
    userPrompt += `**Client** : ${client.full_name}\n`;

    // If we have a call ID, fetch transcript and notes
    if (callId) {
      const { data: transcript } = await supabase
        .from("call_transcripts")
        .select("content")
        .eq("call_id", callId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

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
          formattedTranscript.length > 40000
            ? formattedTranscript.slice(0, 40000) +
              "\n\n[... transcription tronquee]"
            : formattedTranscript;

        userPrompt += `\n## Transcription de l'appel\n${truncated}\n`;
      }

      const { data: callNotes } = await supabase
        .from("call_notes")
        .select("summary, next_steps, action_items")
        .eq("call_id", callId)
        .maybeSingle();

      if (callNotes?.summary) {
        userPrompt += `\n## Notes de l'appel\n${callNotes.summary}\n`;
        if (callNotes.next_steps) {
          userPrompt += `**Prochaines etapes notees** : ${callNotes.next_steps}\n`;
        }
      }

      const { data: preCall } = await supabase
        .from("pre_call_answers")
        .select("objective, tried_solutions")
        .eq("call_id", callId)
        .maybeSingle();

      if (preCall) {
        userPrompt += `\n## Questions pre-appel\n`;
        userPrompt += `**Objectif** : ${preCall.objective}\n`;
        userPrompt += `**Solutions essayees** : ${preCall.tried_solutions}\n`;
      }
    }

    // Use provided transcript if no callId
    if (callTranscript && !callId) {
      const truncated =
        callTranscript.length > 40000
          ? callTranscript.slice(0, 40000) + "\n\n[... transcription tronquee]"
          : callTranscript;
      userPrompt += `\n## Transcription\n${truncated}\n`;
    }

    if (context) {
      userPrompt += `\n## Contexte supplementaire\n${context}\n`;
    }

    // Fetch existing coaching goals for extra context
    const { data: goals } = await supabase
      .from("coaching_goals")
      .select("title, description, status")
      .eq("client_id", clientId)
      .eq("status", "active")
      .limit(10);

    if (goals && goals.length > 0) {
      userPrompt += `\n## Objectifs de coaching actuels\n`;
      goals.forEach((g) => {
        userPrompt += `- ${g.title}${g.description ? ` : ${g.description}` : ""}\n`;
      });
    }

    // Fetch student details for niche/revenue context
    const { data: studentDetail } = await supabase
      .from("student_details")
      .select("niche, current_revenue, revenue_objective, pipeline_stage")
      .eq("profile_id", clientId)
      .maybeSingle();

    if (studentDetail) {
      userPrompt += `\n## Profil business\n`;
      if (studentDetail.niche)
        userPrompt += `- **Niche** : ${studentDetail.niche}\n`;
      if (studentDetail.current_revenue)
        userPrompt += `- **CA actuel** : ${studentDetail.current_revenue} EUR/mois\n`;
      if (studentDetail.revenue_objective)
        userPrompt += `- **Objectif CA** : ${studentDetail.revenue_objective} EUR/mois\n`;
      if (studentDetail.pipeline_stage)
        userPrompt += `- **Etape pipeline** : ${studentDetail.pipeline_stage}\n`;
    }

    // Call Claude
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    const rawText = textContent?.text ?? "";

    // Parse JSON response
    let parsed;
    try {
      // Try to extract JSON from potential markdown code block
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "Erreur de parsing de la reponse IA", raw: rawText },
        { status: 500 },
      );
    }

    // Validate structure
    if (!parsed.title || !parsed.milestones || !Array.isArray(parsed.milestones)) {
      return NextResponse.json(
        { error: "Format de reponse invalide", raw: rawText },
        { status: 500 },
      );
    }

    return NextResponse.json({
      title: parsed.title,
      description: parsed.description ?? "",
      milestones: parsed.milestones.map(
        (
          m: {
            title: string;
            description: string;
            validation_criteria: string[];
            order_index: number;
          },
          i: number,
        ) => ({
          title: m.title,
          description: m.description ?? "",
          validation_criteria: m.validation_criteria ?? [],
          order_index: m.order_index ?? i,
        }),
      ),
      tokens_used:
        response.usage.input_tokens + response.usage.output_tokens,
    });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation de la roadmap" },
      { status: 500 },
    );
  }
}
