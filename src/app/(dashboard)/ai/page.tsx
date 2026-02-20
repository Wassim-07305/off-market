"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import {
  Bot,
  Send,
  Plus,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";

const suggestions = [
  "Analyse la progression de mes eleves",
  "Quels eleves sont a risque d'abandon ?",
  "Redige un message de relance pour les eleves inactifs",
  "Fais un rapport de performance de la semaine",
  "Suggere du contenu pour mon prochain module",
  "Cree un plan d'action personnalise",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIPage() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({
    queryKey: ["ai-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content?: string) => {
    const message = content ?? input;
    if (!message.trim() || !user) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    // Create conversation if needed
    if (!conversationId) {
      const { data } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title: message.slice(0, 50),
        })
        .select()
        .single();
      if (data) setConversationId(data.id);
    }

    // Save user message
    if (conversationId) {
      await supabase.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: message,
      });
    }

    // For now, simulate a response (the Edge Function would handle real Claude API calls)
    setIsStreaming(true);
    const response =
      "Je suis l'assistant IA d'Off Market. Pour le moment, la connexion avec l'API Claude n'est pas encore configuree. Une fois configuree, je pourrai analyser les donnees de tes eleves, generer des rapports, et te donner des recommandations personnalisees.";

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: response },
    ]);
    setIsStreaming(false);

    if (conversationId) {
      await supabase.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: response,
      });
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-border hidden lg:flex flex-col">
        <div className="p-3 border-b border-border">
          <button
            onClick={startNewConversation}
            className="w-full h-9 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations?.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setConversationId(conv.id);
                setMessages([]);
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate",
                conversationId === conv.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5 inline mr-2" />
              {conv.title ?? "Conversation"}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={defaultTransition}
              className="text-center max-w-lg"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h1
                className="text-2xl font-semibold text-foreground mb-2"
                style={{ fontFamily: "Instrument Serif, serif" }}
              >
                Assistant IA
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                Pose-moi une question sur tes eleves, ton business ou ta
                strategie.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-left p-3 rounded-xl border border-border text-sm text-foreground hover:bg-muted hover:border-border/80 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : ""
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="bg-muted rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ecris ton message..."
              className="flex-1 h-11 px-4 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-primary-hover transition-all active:scale-[0.95] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
