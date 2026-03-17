import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export async function generateText(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const chat = model.startChat({
    history: [],
    generationConfig: { maxOutputTokens: 2048 },
  });
  // Prepend system instructions
  const fullPrompt = `${systemPrompt}\n\n---\nMessage du client:\n${userMessage}`;
  const result = await chat.sendMessage(fullPrompt);
  return result.response.text();
}

export async function generateMemoryUpdate(
  existingMemory: string,
  conversation: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Tu es un assistant qui gere la memoire client. Voici la memoire existante de ce client:\n\n${existingMemory || "(Aucune memoire)"}\n\nVoici le dernier echange:\n${conversation}\n\nMets a jour la memoire en ajoutant les nouvelles informations apprises (objectifs, problemes, preferences, conseils donnes). Garde un format concis (max 500 mots). Retourne UNIQUEMENT le texte de la memoire mise a jour, rien d'autre.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
