/**
 * Groq API helper — OpenAI-compatible chat completions.
 * Modèles recommandés : llama-3.3-70b-versatile (qualité), llama-3.1-8b-instant (vitesse)
 */

const GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqOptions {
  model?: string;
  maxTokens?: number;
  system?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  temperature?: number;
}

interface GroqResult {
  text: string;
  usage: { input_tokens: number; output_tokens: number };
}

export async function callGroq(options: GroqOptions): Promise<GroqResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY non configurée dans les variables d'environnement.");
  }

  const allMessages: GroqMessage[] = [];

  if (options.system) {
    allMessages.push({ role: "system", content: options.system });
  }

  for (const m of options.messages) {
    allMessages.push({ role: m.role, content: m.content });
  }

  const res = await fetch(GROQ_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model ?? GROQ_DEFAULT_MODEL,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      messages: allMessages,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("[Groq] API error:", res.status, errorData);
    throw new Error(`Groq API error: ${res.status} — ${JSON.stringify(errorData)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const usage = {
    input_tokens: data.usage?.prompt_tokens ?? 0,
    output_tokens: data.usage?.completion_tokens ?? 0,
  };

  return { text, usage };
}
