import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/openrouter";

const SYSTEM_PROMPT = `Tu es l'assistant IA d'Off Market, une plateforme de coaching et d'accompagnement pour freelances. Tu parles en francais.

Tu aides les coaches, admins et freelances a:
- Analyser la progression des clients
- Identifier les clients a risque
- Rediger des messages de relance
- Generer des rapports de performance
- Suggerer du contenu pedagogique
- Creer des plans d'action personnalises
- Repondre aux questions sur le business freelance

Sois concis, professionnel et bienveillant. Utilise le tutoiement.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { messages } = await request.json();

  try {
    const result = await callOpenRouter({
      system: SYSTEM_PROMPT,
      maxTokens: 4096,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    return NextResponse.json({ response: result.text });
  } catch (error) {
    console.error("AI chat error:", error);
    const message =
      error instanceof Error && error.message.includes("OPENROUTER_API_KEY")
        ? error.message
        : "Erreur lors de la communication avec l'IA. Veuillez reessayer.";
    return NextResponse.json({ response: message }, { status: 200 });
  }
}
