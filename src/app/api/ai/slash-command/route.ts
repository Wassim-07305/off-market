import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/openrouter";

const ALLOWED_COMMANDS = ["resume", "translate", "suggest"] as const;
type SlashCommand = (typeof ALLOWED_COMMANDS)[number];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Check role — admin/coach only
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "prospect";
  if (role !== "admin" && role !== "coach") {
    return NextResponse.json(
      { error: "Acces reserve aux admins et coaches" },
      { status: 403 },
    );
  }

  const { command, channelId, params } = (await request.json()) as {
    command: string;
    channelId: string;
    params?: Record<string, string>;
  };

  if (!ALLOWED_COMMANDS.includes(command as SlashCommand)) {
    return NextResponse.json(
      { error: `Commande inconnue: ${command}` },
      { status: 400 },
    );
  }

  if (!channelId) {
    return NextResponse.json(
      { error: "channelId requis" },
      { status: 400 },
    );
  }

  try {
    let result = "";

    if (command === "resume") {
      const count = parseInt(params?.count ?? "20", 10);
      const limit = Math.min(Math.max(count, 1), 100);

      const { data: messages } = await supabase
        .from("messages")
        .select(
          "content, created_at, sender:profiles!messages_sender_id_fkey(full_name)",
        )
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!messages || messages.length === 0) {
        return NextResponse.json({
          result: "Aucun message a resumer dans ce canal.",
          command,
        });
      }

      const messagesText = messages
        .reverse()
        .map((m) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sender = m.sender as any;
          return `[${sender?.full_name ?? "Inconnu"}]: ${m.content}`;
        })
        .join("\n");

      const aiResult = await callOpenRouter({
        system: `Tu es un assistant IA. Fais un resume concis et structure en francais de la conversation suivante. Utilise des bullet points. Pas d'emojis. Identifie les points cles, decisions prises et actions a suivre.`,
        messages: [
          {
            role: "user",
            content: `Resume les ${messages.length} derniers messages de cette conversation :\n\n${messagesText}`,
          },
        ],
        maxTokens: 1024,
      });

      result = aiResult.text;
    }

    if (command === "translate") {
      const targetLang = params?.lang ?? "English";

      const { data: messages } = await supabase
        .from("messages")
        .select("content")
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!messages || messages.length === 0) {
        return NextResponse.json({
          result: "Aucun message a traduire.",
          command,
        });
      }

      const lastMessage = messages[0].content;

      const aiResult = await callOpenRouter({
        system: `Tu es un traducteur professionnel. Traduis le texte donne en ${targetLang}. Retourne uniquement la traduction, sans explication ni commentaire.`,
        messages: [
          {
            role: "user",
            content: lastMessage,
          },
        ],
        maxTokens: 1024,
      });

      result = aiResult.text;
    }

    if (command === "suggest") {
      const { data: messages } = await supabase
        .from("messages")
        .select(
          "content, sender:profiles!messages_sender_id_fkey(full_name)",
        )
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!messages || messages.length === 0) {
        return NextResponse.json({
          result: "Pas assez de contexte pour suggerer une reponse.",
          command,
        });
      }

      const messagesText = messages
        .reverse()
        .map((m) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sender = m.sender as any;
          return `[${sender?.full_name ?? "Inconnu"}]: ${m.content}`;
        })
        .join("\n");

      const aiResult = await callOpenRouter({
        system: `Tu es l'assistant IA de la plateforme Off Market (coaching business). Tu aides ${profile?.full_name ?? "le coach"} a repondre dans une conversation. Genere une reponse naturelle, professionnelle, en francais, adaptee au contexte. Pas d'emojis. Tutoie. Sois direct et utile.`,
        messages: [
          {
            role: "user",
            content: `Voici les derniers messages de la conversation. Suggere une reponse appropriee :\n\n${messagesText}`,
          },
        ],
        maxTokens: 512,
      });

      result = aiResult.text;
    }

    return NextResponse.json({ result, command });
  } catch (error) {
    console.error("AI slash-command error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la commande IA." },
      { status: 500 },
    );
  }
}
