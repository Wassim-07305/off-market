import { callOpenRouter } from "./openrouter";

const FREE_MODEL = "google/gemma-2-9b-it:free";
const JINA_EMBEDDING_URL = "https://api.jina.ai/v1/embeddings";

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const res = await fetch(JINA_EMBEDDING_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.JINA_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        model: "jina-embeddings-v3",
        input: [text],
        dimensions: 768,
      }),
    });

    if (!res.ok) {
      console.warn("[Embedding] Jina error:", res.status);
      return [];
    }

    const data = await res.json();
    return data.data?.[0]?.embedding ?? [];
  } catch (err) {
    console.warn("[Embedding] Error:", err);
    return [];
  }
}

export async function generateText(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const result = await callOpenRouter({
    model: FREE_MODEL,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    maxTokens: 2048,
  });
  return result.text;
}

export async function generateMemoryUpdate(
  existingMemory: string,
  conversation: string,
): Promise<string> {
  const prompt = `Tu es un assistant qui gere la memoire client. Voici la memoire existante de ce client:\n\n${existingMemory || "(Aucune memoire)"}\n\nVoici le dernier echange:\n${conversation}\n\nMets a jour la memoire en ajoutant les nouvelles informations apprises (objectifs, problemes, preferences, conseils donnes). Garde un format concis (max 500 mots). Retourne UNIQUEMENT le texte de la memoire mise a jour, rien d'autre.`;

  const result = await callOpenRouter({
    model: FREE_MODEL,
    messages: [{ role: "user", content: prompt }],
    maxTokens: 1024,
  });
  return result.text;
}
