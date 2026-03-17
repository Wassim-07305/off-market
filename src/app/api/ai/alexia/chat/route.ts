import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateEmbedding,
  generateText,
  generateMemoryUpdate,
} from "@/lib/gemini";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { message, conversation_id } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    // 1. Get user profile
    const { data: userProfile } = await admin
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .single();

    // 2. Find the coach for this user
    // If user is admin/coach, they are their own coach. If client, find assigned coach.
    let coachId = user.id;
    if (userProfile?.role === "client" || userProfile?.role === "prospect") {
      const { data: assignment } = await admin
        .from("client_assignments")
        .select("coach_id")
        .eq("client_id", user.id)
        .limit(1)
        .single();
      if (assignment) coachId = assignment.coach_id;
      else {
        // Fallback: get first admin
        const { data: adminProfile } = await admin
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .limit(1)
          .single();
        if (adminProfile) coachId = adminProfile.id;
      }
    }

    // 3. Get coach profile & AI config
    const [coachResult, configResult] = await Promise.all([
      admin.from("profiles").select("full_name").eq("id", coachId).single(),
      admin
        .from("coach_ai_config")
        .select("*")
        .eq("coach_id", coachId)
        .single(),
    ]);
    const coachName = coachResult.data?.full_name ?? "ton coach";
    const config = configResult.data;
    const aiName = config?.ai_name ?? "AlexIA";

    // 4. Generate embedding for user question & search relevant chunks
    const queryEmbedding = await generateEmbedding(message);
    const { data: relevantChunks } = await admin.rpc("match_coach_chunks", {
      query_embedding: JSON.stringify(queryEmbedding),
      p_coach_id: coachId,
      match_threshold: 0.3,
      match_count: 5,
    });

    const context = (relevantChunks ?? [])
      .map((c: { content: string }) => c.content)
      .join("\n\n---\n\n");

    // 5. Get client memory
    const { data: memory } = await admin
      .from("client_ai_memory")
      .select("summary, key_facts, last_topics")
      .eq("client_id", user.id)
      .eq("coach_id", coachId)
      .single();

    const memoryText = memory?.summary ?? "";

    // 6. Get recent conversation history
    let history = "";
    if (conversation_id) {
      const { data: recentMessages } = await admin
        .from("ai_messages")
        .select("role, content")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (recentMessages && recentMessages.length > 0) {
        history = recentMessages
          .reverse()
          .map((m) => `${m.role === "user" ? "Client" : aiName}: ${m.content}`)
          .join("\n");
      }
    }

    // 7. Build system prompt
    const systemPrompt = `Tu es ${aiName}, l'assistant IA de ${coachName}. Tu accompagnes les clients de ${coachName} en te basant sur ses methodes, documents et son expertise.

REGLES ABSOLUES:
- Reponds UNIQUEMENT en te basant sur les documents et connaissances du coach fournis ci-dessous
- Si tu ne trouves pas la reponse dans les documents, dis-le honnetement et suggere de contacter ${coachName} directement
- Ne jamais inventer de conseils medicaux, juridiques ou financiers
- Garde le ton et le style de ${coachName}
- Reponds en francais

${config?.system_instructions ? `INSTRUCTIONS PERSONNALISEES DU COACH:\n${config.system_instructions}\n` : ""}
${config?.tone ? `TON A ADOPTER: ${config.tone}\n` : ""}

${context ? `DOCUMENTS DE REFERENCE DU COACH:\n${context}\n` : "AUCUN DOCUMENT DE REFERENCE DISPONIBLE. Reponds avec tes connaissances generales en coaching.\n"}
${memoryText ? `MEMOIRE CLIENT (ce que tu sais sur ce client):\n${memoryText}\n` : ""}
${history ? `HISTORIQUE RECENT:\n${history}\n` : ""}`;

    // 8. Generate AI response
    const response = await generateText(systemPrompt, message);

    // 9. Store messages
    if (conversation_id) {
      await admin.from("ai_messages").insert([
        { conversation_id, role: "user", content: message },
        { conversation_id, role: "assistant", content: response },
      ]);
    }

    // 10. Update client memory asynchronously (don't block response)
    updateMemoryInBackground(
      admin,
      user.id,
      coachId,
      memoryText,
      message,
      response,
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[AlexIA Chat] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation de la reponse" },
      { status: 500 },
    );
  }
}

// Fire-and-forget memory update
function updateMemoryInBackground(
  admin: ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>,
  clientId: string,
  coachId: string,
  existingMemory: string,
  userMessage: string,
  aiResponse: string,
) {
  const conversation = `Client: ${userMessage}\nAlexIA: ${aiResponse}`;
  generateMemoryUpdate(existingMemory, conversation)
    .then(async (updatedMemory) => {
      await admin.from("client_ai_memory").upsert(
        {
          client_id: clientId,
          coach_id: coachId,
          summary: updatedMemory,
          conversation_count: (existingMemory ? 1 : 0) + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id,coach_id" },
      );
    })
    .catch((err) => console.error("[AlexIA Memory] Update failed:", err));
}
