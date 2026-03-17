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
import { useAiConsent } from "@/hooks/use-ai-consent";
import { AiConsentModal } from "@/components/ai/ai-consent-modal";
import { AiResponseBadge } from "@/components/ai/ai-response-badge";

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
  const {
    hasConsent,
    isLoading: consentLoading,
    accept: acceptConsent,
    isAccepting,
  } = useAiConsent();
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
      await supabase.from("ai_messages").delete().eq("conversation_id", convId);
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

  // Afficher la modal de consentement si pas encore accepte (F46.2)
  if (!consentLoading && !hasConsent) {
    return (
      <AiConsentModal
        onAccept={(scopes) => acceptConsent(scopes)}
        isAccepting={isAccepting}
      />
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-7rem)] bg-surface dark:bg-surface border border-zinc-200/80 dark:border-border/50 rounded-2xl overflow-hidden relative"
      style={{
        boxShadow: "0 1px 3px rgb(0 0 0 / 0.04), 0 8px 20px rgb(0 0 0 / 0.02)",
      }}
    >
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 border-r border-zinc-200/80 dark:border-border/50 flex flex-col shrink-0 bg-zinc-50/50 dark:bg-muted/20">
          <div className="p-3 border-b border-zinc-200/80 dark:border-border/50 flex items-center gap-2">
            <button
              onClick={startNewConversation}
              className="flex-1 h-9 rounded-xl border border-zinc-200/80 dark:border-border text-sm text-muted-foreground hover:text-foreground hover:bg-surface dark:hover:bg-muted transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Nouvelle conversation
            </button>
            <button
              onClick={() => setShowSidebar(false)}
              className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface dark:hover:bg-muted transition-all duration-200 flex items-center justify-center shrink-0"
              title="Masquer le panneau"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {conversations?.length === 0 && (
              <p className="text-xs text-muted-foreground/50 text-center py-8 px-4">
                Aucune conversation
              </p>
            )}
            {conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 group",
                  conversationId === conv.id
                    ? "bg-[#AF0000]/10 text-[#AF0000] font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface dark:hover:bg-muted",
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate flex-1">
                  {conv.title ?? "Conversation"}
                </span>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 shrink-0"
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
              className="w-9 h-9 rounded-xl bg-surface dark:bg-surface border border-zinc-200/80 dark:border-border/50 text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-muted transition-all duration-200 flex items-center justify-center shadow-sm"
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#AF0000]/10 via-violet-500/10 to-blue-500/10 flex items-center justify-center mx-auto mb-5 relative">
                <Sparkles className="w-8 h-8 text-[#AF0000]" />
                {/* Decorative glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#AF0000]/5 to-violet-500/5 blur-xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  Assistant IA
                </span>
              </h1>
              <p className="text-sm text-muted-foreground/70 mb-8">
                Pose-moi une question sur tes eleves, ton business ou ta
                strategie.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    disabled={isStreaming}
                    className="text-left p-3.5 rounded-xl text-sm text-foreground bg-surface dark:bg-surface border border-zinc-200/80 dark:border-border/50 hover:border-[#AF0000]/20 hover:bg-[#AF0000]/[0.02] hover:shadow-sm transition-all duration-200 disabled:opacity-50 group"
                  >
                    <span className="group-hover:text-[#AF0000] transition-colors">
                      {s}
                    </span>
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/15 to-blue-500/15 flex items-center justify-center shrink-0 mt-0.5 relative">
                    <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white rounded-br-md shadow-sm shadow-[#AF0000]/20"
                      : "bg-gradient-to-br from-violet-50/80 via-blue-50/50 to-indigo-50/30 dark:from-violet-500/10 dark:via-blue-500/5 dark:to-indigo-500/5 text-foreground rounded-bl-md border border-violet-100/50 dark:border-violet-500/10",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <>
                      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1 [&_code]:text-xs [&_code]:bg-black/5 [&_code]:dark:bg-surface/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-black/5 [&_pre]:dark:bg-surface/10 [&_pre]:rounded-lg [&_pre]:p-3 [&_hr]:my-2">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <AiResponseBadge />
                      </div>
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/15 to-blue-500/15 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-spin" />
                </div>
                <div className="bg-gradient-to-br from-violet-50/80 via-blue-50/50 to-indigo-50/30 dark:from-violet-500/10 dark:via-blue-500/5 dark:to-indigo-500/5 border border-violet-100/50 dark:border-violet-500/10 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-violet-400/50 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-violet-400/50 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-violet-400/50 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="border-t border-zinc-200/80 dark:border-border/50 p-4 bg-zinc-50/30 dark:bg-muted/10">
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
              className="flex-1 h-11 px-4 bg-surface dark:bg-surface border border-zinc-200/80 dark:border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20 focus:border-[#AF0000]/30 disabled:opacity-60 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="w-11 h-11 bg-gradient-to-r from-[#AF0000] to-[#DC2626] rounded-xl flex items-center justify-center text-white hover:shadow-lg hover:shadow-[#AF0000]/20 transition-all duration-300 active:scale-[0.95] disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
