/**
 * OpenRouter API helper — drop-in replacement for Anthropic SDK calls.
 * Uses the OpenAI-compatible chat completions endpoint.
 */

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-sonnet-4-5-20250514";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterOptions {
  model?: string;
  maxTokens?: number;
  system?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

interface OpenRouterResult {
  text: string;
  usage: { input_tokens: number; output_tokens: number };
}

export async function callOpenRouter(
  options: OpenRouterOptions,
): Promise<OpenRouterResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY non configuree dans les variables d'environnement.",
    );
  }

  const allMessages: OpenRouterMessage[] = [];

  if (options.system) {
    allMessages.push({ role: "system", content: options.system });
  }

  for (const m of options.messages) {
    allMessages.push({ role: m.role, content: m.content });
  }

  const res = await fetch(OPENROUTER_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model ?? DEFAULT_MODEL,
      max_tokens: options.maxTokens ?? 4096,
      messages: allMessages,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("OpenRouter API error:", res.status, errorData);
    throw new Error(
      `OpenRouter API error: ${res.status} — ${JSON.stringify(errorData)}`,
    );
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const usage = {
    input_tokens: data.usage?.prompt_tokens ?? 0,
    output_tokens: data.usage?.completion_tokens ?? 0,
  };

  return { text, usage };
}
