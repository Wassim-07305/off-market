"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

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
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: conversations } = useQuery({
    queryKey: ["ai-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("updated_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when selecting a conversation
  const loadConversation = useCallback(
    async (convId: string) => {
      setConversationId(convId);
      try {
        const { data, error } = await supabase
          .from("ai_messages")
          .select("role, content")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        setMessages(
          (data ?? []).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        );
      } catch {
        toast.error("Impossible de charger la conversation");
      }
    },
    [supabase],
  );

  const handleSend = async (content?: string) => {
    const message = content ?? input;
    if (!message.trim() || !user || isStreaming) return;

    setInput("");
    const userMsg: ChatMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);

    // Create conversation if needed — capture the ID for this scope
    let activeConvId = conversationId;
    if (!activeConvId) {
      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title: message.length > 50 ? message.slice(0, 50) + "..." : message,
        })
        .select()
        .single();
      if (error) {
        toast.error("Impossible de creer la conversation");
        return;
      }
      activeConvId = data.id;
      setConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    }

    // Save user message
    await supabase.from("ai_messages").insert({
      conversation_id: activeConvId,
      role: "user",
      content: message,
    });

    // Call the Claude API route
    setIsStreaming(true);
    try {
      const allMessages = [...messages, userMsg];
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });
      const data = await res.json();
      const response = data.response ?? "Erreur de reponse";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);

      // Save assistant response
      await supabase.from("ai_messages").insert({
        conversation_id: activeConvId,
        role: "assistant",
        content: response,
      });

      // Update conversation timestamp
      await supabase
        .from("ai_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConvId);

      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Erreur de connexion avec l'assistant IA. Veuillez reessayer.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase
        .from("ai_messages")
        .delete()
        .eq("conversation_id", convId);
      await supabase.from("ai_conversations").delete().eq("id", convId);
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      if (conversationId === convId) {
        setConversationId(null);
        setMessages([]);
      }
      toast.success("Conversation supprimee");
    } catch {
      toast.error("Impossible de supprimer la conversation");
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex h-[calc(100vh-7rem)] bg-surface rounded-2xl overflow-hidden relative"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 border-r border-border/50 flex flex-col shrink-0">
          <div className="p-3 border-b border-border/50 flex items-center gap-2">
            <button
              onClick={startNewConversation}
              className="flex-1 h-9 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle conversation
            </button>
            <button
              onClick={() => setShowSidebar(false)}
              className="w-9 h-9 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center shrink-0"
              title="Masquer le panneau"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {conversations?.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8 px-4">
                Aucune conversation
              </p>
            )}
            {conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 group",
                  conversationId === conv.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate flex-1">
                  {conv.title ?? "Conversation"}
                </span>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                  title="Supprimer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toggle sidebar button when hidden */}
        {!showSidebar && (
          <div className="absolute top-2 left-2 z-10">
            <button
              onClick={() => setShowSidebar(true)}
              className="w-9 h-9 rounded-[10px] bg-surface border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
              style={{ boxShadow: "var(--shadow-xs)" }}
              title="Afficher le panneau"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

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
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight mb-2">
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
                    disabled={isStreaming}
                    className="text-left p-3 rounded-xl text-sm text-foreground hover:bg-muted/50 transition-all duration-200 disabled:opacity-50"
                    style={{ boxShadow: "var(--shadow-xs)" }}
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
                  msg.role === "user" ? "justify-end" : "",
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1 [&_code]:text-xs [&_code]:bg-black/5 [&_code]:dark:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-black/5 [&_pre]:dark:bg-white/10 [&_pre]:rounded-lg [&_pre]:p-3 [&_hr]:my-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/50 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 max-w-3xl mx-auto"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ecris ton message..."
              disabled={isStreaming}
              className="flex-1 h-11 px-4 bg-muted/50 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              style={{ boxShadow: "var(--shadow-xs)" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white hover:bg-primary-hover transition-all duration-200 active:scale-[0.95] disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
