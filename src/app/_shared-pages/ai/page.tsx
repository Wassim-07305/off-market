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
  BookOpen,
  Settings,
  Brain,
} from "lucide-react";
import { AlexiaKnowledgePanel } from "@/components/ai/alexia-knowledge-panel";
import { AlexiaConfigPanel } from "@/components/ai/alexia-config-panel";
import { AlexiaMemoryPanel } from "@/components/ai/alexia-memory-panel";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAiConsent } from "@/hooks/use-ai-consent";
import { AiConsentModal } from "@/components/ai/ai-consent-modal";
import { AiResponseBadge } from "@/components/ai/ai-response-badge";

const SUGGESTIONS_BY_ROLE: Record<string, string[]> = {
  admin: [
    "Fais un rapport de performance de la semaine",
    "Quels eleves sont à risque d'abandon ?",
    "Donne-moi une vue d'ensemble du revenu ce mois-ci",
    "Quels clients n'ont pas eu de session ce mois ?",
    "Redige un message de relance pour les eleves inactifs",
    "Suggere du contenu pour mon prochain module",
  ],
  coach: [
    "Quels clients ont besoin d'attention urgente ?",
    "Prepare-moi une session de coaching pour un client bloque",
    "Redige un message de motivation pour mes clients",
    "Quels eleves progressent le mieux cette semaine ?",
    "Suggere des exercices pratiques pour debloquer mes clients",
    "Fais un bilan de progression de mes eleves",
  ],
  setter: [
    "Aide-moi a qualifier un prospect froid",
    "Redige un message d'approche LinkedIn percutant",
    "Quelles sont les meilleures questions de decouverte ?",
    "Comment gerer un prospect qui ne repond plus ?",
    "Redige un follow-up apres un premier contact",
    "Aide-moi a preparer mon script d'appel",
  ],
  closer: [
    "Comment traiter l'objection 'c'est trop cher' ?",
    "Aide-moi a preparer un closing pour demain",
    "Quelles questions poser pour creer de l'urgence ?",
    "Redige une offre commerciale percutante",
    "Comment relancer un prospect apres un refus ?",
    "Analyse mon taux de conversion et suggere des ameliorations",
  ],
  client: [
    "Aide-moi a definir mes objectifs pour ce mois",
    "Je suis bloque sur un problème, aide-moi a le resoudre",
    "Comment rester motive quand ca devient difficile ?",
    "Fais le bilan de ma progression",
    "Donne-moi un plan d'action pour cette semaine",
    "Quelles habitudes devrais-je adopter pour progresser ?",
  ],
  prospect: [
    "Aide-moi a definir mes premiers objectifs",
    "Par ou commencer pour atteindre mes buts ?",
    "Comment organiser ma semaine pour etre productif ?",
    "Quels sont les premiers pas vers le succes ?",
    "Donne-moi un plan d'action pour commencer",
    "Comment rester motive dans les premiers mois ?",
  ],
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type AITab = "chat" | "config";

export default function AIPage() {
  const { user, isStaff, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AITab>("chat");
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
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1024) setShowSidebar(true);
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const role = profile?.role ?? "client";
  const suggestions =
    SUGGESTIONS_BY_ROLE[role] ?? SUGGESTIONS_BY_ROLE.client;

  const { data: conversations } = useQuery({
    queryKey: ["ai-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("updated_at", { ascending: false })
        .limit(30)
        .returns<Array<{ id: string; user_id: string; title: string | null; created_at: string; updated_at: string }>>();
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
          .order("created_at", { ascending: true })
          .returns<Array<{ role: string; content: string }>>();
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
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      // Conversation creation is handled server-side — no client RLS risk
      const res = await fetch("/api/ai/alexia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversation_id: conversationId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Erreur ${res.status}`);
      }

      const data = await res.json();
      const response = data.response ?? "Erreur de réponse";

      // Sync conversation ID if it was created server-side
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
        queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);

      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erreur de connexion avec AlexIA";
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erreur : " + msg },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await (supabase as any).from("ai_messages").delete().eq("conversation_id", convId);
      await (supabase as any).from("ai_conversations").delete().eq("id", convId);
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

  const tabs: {
    id: AITab;
    label: string;
    icon: typeof Bot;
    staffOnly?: boolean;
  }[] = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "config", label: "Configuration", icon: Settings, staffOnly: true },
  ];

  // Show consent modal if user hasn't accepted yet
  if (!consentLoading && !hasConsent) {
    return (
      <AiConsentModal
        onAccept={(scopes) => acceptConsent(scopes)}
        isAccepting={isAccepting}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs (staff only sees all, clients see only chat) */}
      {isStaff && (
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 w-fit">
          {tabs
            .filter((t) => !t.staffOnly || isStaff)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "h-9 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
        </div>
      )}

      {/* Tab content */}
      {activeTab === "config" && isStaff ? (
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto pb-8 max-h-none lg:max-h-[calc(100vh-10rem)]"
        >
          <div
            className="bg-surface border border-border rounded-2xl p-5 overflow-y-auto max-h-none lg:max-h-[calc(100vh-11rem)]"
          >
            <AlexiaKnowledgePanel />
          </div>
          <div
            className="bg-surface border border-border rounded-2xl p-5 overflow-y-auto max-h-none lg:max-h-[calc(100vh-11rem)]"
          >
            <AlexiaConfigPanel />
          </div>
          <div
            className="bg-surface border border-border rounded-2xl p-5 overflow-y-auto max-h-none lg:max-h-[calc(100vh-11rem)]"
          >
            <AlexiaMemoryPanel />
          </div>
        </div>
      ) : (
        <div
          className="flex h-[calc(100vh-10rem)] bg-surface dark:bg-surface border border-border dark:border-border/50 rounded-2xl overflow-hidden relative"
          style={{
            boxShadow:
              "0 1px 3px rgb(0 0 0 / 0.04), 0 8px 20px rgb(0 0 0 / 0.02)",
          }}
        >
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-64 border-r border-border dark:border-border/50 flex flex-col shrink-0 bg-zinc-50/50 dark:bg-muted/20 lg:relative absolute z-20 inset-y-0 left-0">
              <div className="p-3 border-b border-border dark:border-border/50 flex items-center gap-2">
                <button
                  onClick={startNewConversation}
                  className="flex-1 h-9 rounded-xl border border-border dark:border-border text-sm text-muted-foreground hover:text-foreground hover:bg-surface dark:hover:bg-muted transition-all duration-200 flex items-center justify-center gap-2 font-medium"
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
                  <div
                    key={conv.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => loadConversation(conv.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        loadConversation(conv.id);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 group cursor-pointer",
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
                  </div>
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
                  className="w-9 h-9 rounded-xl bg-surface dark:bg-surface border border-border dark:border-border/50 text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-muted transition-all duration-200 flex items-center justify-center shadow-sm"
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
                      AlexIA
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground/70 mb-8">
                    Pose-moi une question sur tes élèves, ton business ou ta
                    strategie.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        disabled={isStreaming}
                        className="text-left p-3.5 rounded-xl text-sm text-foreground bg-surface dark:bg-surface border border-border dark:border-border/50 hover:border-[#AF0000]/20 hover:bg-[#AF0000]/[0.02] hover:shadow-sm transition-all duration-200 disabled:opacity-50 group"
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
            <div className="border-t border-border dark:border-border/50 p-4 bg-zinc-50/30 dark:bg-muted/10">
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
                  className="flex-1 h-11 px-4 bg-surface dark:bg-surface border border-border dark:border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20 focus:border-[#AF0000]/30 disabled:opacity-60 transition-all duration-200"
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
      )}
    </div>
  );
}
