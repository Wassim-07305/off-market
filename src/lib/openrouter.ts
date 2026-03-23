/**
 * Unified AI API helper.
 * Priorité : Groq (si GROQ_API_KEY défini) → OpenRouter (si OPENROUTER_API_KEY défini)
 * Interface identique pour les deux, drop-in replacement.
 */

import { callGroq, GROQ_DEFAULT_MODEL } from "./groq";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_DEFAULT_MODEL = "anthropic/claude-sonnet-4.6";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterOptions {
  model?: string;
  maxTokens?: number;
  system?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  temperature?: number;
}

export interface OpenRouterResult {
  text: string;
  usage: { input_tokens: number; output_tokens: number };
}

export async function callOpenRouter(
  options: OpenRouterOptions,
): Promise<OpenRouterResult> {
  // ── Groq en priorité ──────────────────────────────────────────────
  if (process.env.GROQ_API_KEY) {
    return callGroq({
      model: options.model?.startsWith("groq/")
        ? options.model.replace("groq/", "")
        : GROQ_DEFAULT_MODEL,
      maxTokens: options.maxTokens,
      system: options.system,
      messages: options.messages,
      temperature: options.temperature,
    });
  }

  // ── Anthropic direct (si ANTHROPIC_API_KEY) ──────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    const allMessages = options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: options.maxTokens ?? 4096,
        system: options.system ?? undefined,
        messages: allMessages,
        temperature: options.temperature,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("[Anthropic] API error:", res.status, errorData);
      throw new Error(
        `Anthropic API error: ${res.status} — ${JSON.stringify(errorData)}`,
      );
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";
    const usage = {
      input_tokens: data.usage?.input_tokens ?? 0,
      output_tokens: data.usage?.output_tokens ?? 0,
    };

    return { text, usage };
  }

  // ── Fallback : OpenRouter ─────────────────────────────────────────
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Aucune clé IA configurée. Ajoutez GROQ_API_KEY, ANTHROPIC_API_KEY ou OPENROUTER_API_KEY dans votre .env.local",
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
      model: options.model ?? OPENROUTER_DEFAULT_MODEL,
      max_tokens: options.maxTokens ?? 4096,
      messages: allMessages,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("[OpenRouter] API error:", res.status, errorData);
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
