"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingChat } from "@/hooks/use-onboarding-chat";
import { useAuth } from "@/hooks/use-auth";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { Bot, Send, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/use-onboarding-chat";

// ─── Typing indicator (animated dots) ─────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 max-w-[85%]">
      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-zinc-500" />
      </div>
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: "150ms", animationDuration: "0.6s" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Single chat bubble ───────────────────────────────────────
function ChatBubble({ message, isLatest }: { message: ChatMessage; isLatest: boolean }) {
  const isBot = message.role === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex items-end gap-2.5 max-w-[85%]",
        isBot ? "self-start" : "self-end flex-row-reverse",
      )}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-zinc-500" />
        </div>
      )}
      <div
        className={cn(
          "px-4 py-2.5 text-sm leading-relaxed",
          isBot
            ? "bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-2xl rounded-bl-md"
            : "bg-[#DC2626] text-white rounded-2xl rounded-br-md",
        )}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

// ─── Text input for free-text answers ─────────────────────────
function ChatTextInput({
  onSubmit,
  placeholder,
  defaultValue,
}: {
  onSubmit: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      onSubmit={handleSubmit}
      className="flex items-center gap-2"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "Écris ta réponse..."}
        className="flex-1 h-11 px-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 transition-shadow"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="h-11 w-11 rounded-xl bg-[#DC2626] text-white flex items-center justify-center hover:bg-[#DC2626]/90 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
      >
        <Send className="w-4 h-4" />
      </button>
    </motion.form>
  );
}

// ─── Button choices for multiple-choice answers ───────────────
function ChatChoices({
  choices,
  onSelect,
}: {
  choices: string[];
  onSelect: (choice: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-wrap gap-2"
    >
      {choices.map((choice, i) => (
        <motion.button
          key={choice}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.05 * i }}
          onClick={() => onSelect(choice)}
          className="h-10 px-4 rounded-xl border border-border bg-white dark:bg-zinc-900 text-sm font-medium text-foreground hover:border-[#DC2626]/50 hover:bg-[#DC2626]/5 hover:text-[#DC2626] transition-all active:scale-95"
        >
          {choice}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ─── CTA button for completion ────────────────────────────────
function CompletionCTA({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="flex justify-center pt-2"
    >
      <button
        onClick={onClick}
        disabled={isLoading}
        className="h-12 px-8 rounded-xl bg-[#DC2626] text-white text-sm font-semibold hover:bg-[#DC2626]/90 transition-all active:scale-[0.97] disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-[#DC2626]/20"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Préparation...
          </span>
        ) : (
          <>
            Accéder à mon dashboard
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </motion.div>
  );
}

// ─── Progress dots ────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            i < current
              ? "w-6 bg-[#DC2626]"
              : i === current
                ? "w-4 bg-[#DC2626]/50"
                : "w-1.5 bg-zinc-200 dark:bg-zinc-700",
          )}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export function ChatbotOnboarding() {
  const router = useRouter();
  const { profile } = useAuth();
  const prefix = useRoutePrefix();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    currentStep,
    currentStepIndex,
    isTyping,
    isComplete,
    isStarted,
    startConversation,
    sendAnswer,
    completeOnboarding,
    cleanup,
    totalSteps,
  } = useOnboardingChat();

  // Start conversation on mount
  useEffect(() => {
    startConversation();
    return () => cleanup();
  }, [startConversation, cleanup]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }, [messages, isTyping]);

  const handleComplete = () => {
    completeOnboarding.mutate(undefined, {
      onSuccess: () => {
        router.push(`${prefix}/dashboard`);
      },
    });
  };

  // Determine what input to show
  const showInput = !isTyping && currentStep && !isComplete;
  const showCompletion = isComplete && !isTyping;

  return (
    <div className="flex flex-col h-full max-h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#DC2626]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">
                Configuration de ton espace
              </h1>
              <p className="text-xs text-muted-foreground">
                Quelques questions pour personnaliser ton expérience
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-xl mx-auto mt-3">
          <ProgressDots current={currentStepIndex + 1} total={totalSteps} />
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          <AnimatePresence mode="sync">
            {messages.map((msg, i) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isLatest={i === messages.length - 1}
              />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}

          {/* Completion CTA */}
          {showCompletion && (
            <CompletionCTA
              onClick={handleComplete}
              isLoading={completeOnboarding.isPending}
            />
          )}
        </div>
      </div>

      {/* Input area */}
      {showInput && (
        <div className="shrink-0 border-t border-border bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm px-6 py-4">
          <div className="max-w-xl mx-auto">
            {currentStep.inputType === "text" ? (
              <ChatTextInput
                onSubmit={sendAnswer}
                placeholder="Ton prénom..."
                defaultValue={profile?.full_name ?? ""}
              />
            ) : currentStep.choices ? (
              <ChatChoices
                choices={currentStep.choices}
                onSelect={sendAnswer}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
