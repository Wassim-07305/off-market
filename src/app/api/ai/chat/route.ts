import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { response: "L'API Claude n'est pas encore configuree. Ajoute ANTHROPIC_API_KEY dans les variables d'environnement." },
      { status: 200 }
    );
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textContent = response.content.find((c) => c.type === "text");
    const text = textContent ? textContent.text : "Pas de reponse";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { response: "Erreur lors de la communication avec l'IA. Verifie ta cle API." },
      { status: 200 }
    );
  }
}
