import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { message, channelId } = await request.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "Le champ message est requis" },
      { status: 400 },
    );
  }

  try {
    // 1. Fetch all FAQ entries with auto_answer enabled
    const { data: faqEntries, error: faqError } = await supabase
      .from("faq_entries")
      .select("id, question, answer, category, occurrence_count")
      .eq("auto_answer_enabled", true)
      .order("occurrence_count", { ascending: false });

    if (faqError) throw faqError;

    if (!faqEntries || faqEntries.length === 0) {
      return NextResponse.json({ match: null });
    }

    // 2. Use AI to find the best match
    const faqList = faqEntries
      .map(
        (e, i) =>
          `[${i}] Question: "${e.question}"\n    Reponse: "${e.answer.slice(0, 200)}${e.answer.length > 200 ? "..." : ""}"`,
      )
      .join("\n\n");

    const aiResult = await callOpenRouter({
      maxTokens: 512,
      system: `Tu es un systeme de matching de FAQ. On te donne un message utilisateur et une liste de questions FAQ existantes.

Tu dois :
1. Determiner si le message utilisateur correspond a l'une des questions FAQ
2. Retourner l'index de la meilleure correspondance et un score de similarite entre 0 et 1

Reponds UNIQUEMENT avec un JSON valide, sans markdown :
{"match_index": <number ou null>, "similarity": <number entre 0 et 1>, "reasoning": "<explication courte>"}

Si aucune question ne correspond (similarite < 0.7), retourne :
{"match_index": null, "similarity": 0, "reasoning": "Aucune correspondance trouvee"}`,
      messages: [
        {
          role: "user",
          content: `Message utilisateur : "${message}"

Questions FAQ disponibles :
${faqList}`,
        },
      ],
    });

    const rawText = aiResult.text || "{}";

    let result: {
      match_index: number | null;
      similarity: number;
      reasoning: string;
    };

    try {
      result = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ match: null });
    }

    if (
      result.match_index === null ||
      result.match_index === undefined ||
      result.similarity < 0.8
    ) {
      return NextResponse.json({
        match: null,
        similarity: result.similarity,
        reasoning: result.reasoning,
      });
    }

    const matchedEntry = faqEntries[result.match_index];
    if (!matchedEntry) {
      return NextResponse.json({ match: null });
    }

    // 3. Log this question occurrence
    await supabase.from("faq_question_logs").insert({
      faq_entry_id: matchedEntry.id,
      asked_by: user.id,
      channel_id: channelId ?? null,
      similarity_score: result.similarity,
    });

    // 4. Increment occurrence counter
    await supabase
      .from("faq_entries")
      .update({
        occurrence_count: matchedEntry.occurrence_count + 1,
        last_asked_at: new Date().toISOString(),
      })
      .eq("id", matchedEntry.id);

    return NextResponse.json({
      match: {
        id: matchedEntry.id,
        question: matchedEntry.question,
        answer: matchedEntry.answer,
        category: matchedEntry.category,
        occurrence_count: matchedEntry.occurrence_count + 1,
      },
      similarity: result.similarity,
      reasoning: result.reasoning,
    });
  } catch (error) {
    console.error("FAQ match error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche FAQ" },
      { status: 500 },
    );
  }
}
