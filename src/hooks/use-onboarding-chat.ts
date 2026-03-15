"use client";

import { useState, useCallback, useRef } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────
export type ChatMessageRole = "bot" | "user";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: number;
}

export type OnboardingChatStep =
  | "name"
  | "role"
  | "clients_count"
  | "goal"
  | "source"
  | "complete";

export interface OnboardingAnswers {
  name?: string;
  role?: string;
  clients_count?: string;
  goal?: string;
  source?: string;
}

// ─── Step definitions ───────────────────────────────────────────
interface StepConfig {
  key: OnboardingChatStep;
  getBotMessage: (answers: OnboardingAnswers) => string;
  choices?: string[];
  inputType?: "text";
  profileField?: string;
}

const STEPS: StepConfig[] = [
  {
    key: "name",
    getBotMessage: () => "Bienvenue ! 👋 Comment tu t'appelles ?",
    inputType: "text",
    profileField: "full_name",
  },
  {
    key: "role",
    getBotMessage: (a) => `Enchanté ${a.name} ! Quel est ton rôle ?`,
    choices: ["Coach", "Closer", "Consultant", "Autre"],
    profileField: "business_type",
  },
  {
    key: "clients_count",
    getBotMessage: () => "Top ! Combien de clients gères-tu actuellement ?",
    choices: ["0-5", "5-20", "20-50", "50+"],
    profileField: "current_revenue",
  },
  {
    key: "goal",
    getBotMessage: () => "Quel est ton objectif principal ?",
    choices: [
      "Augmenter mes revenus",
      "Mieux organiser mes clients",
      "Automatiser ma prospection",
      "Suivre mes performances",
    ],
    profileField: "goals",
  },
  {
    key: "source",
    getBotMessage: () => "Dernière question : comment as-tu connu Off-Market ?",
    choices: [
      "Réseaux sociaux",
      "Bouche à oreille",
      "Recherche Google",
      "Autre",
    ],
    profileField: "how_found",
  },
  {
    key: "complete",
    getBotMessage: (a) => `Parfait ${a.name} ! Ton espace est prêt 🚀`,
    profileField: undefined,
  },
];

// ─── Helper ─────────────────────────────────────────────────────
let msgCounter = 0;
function createMessage(role: ChatMessageRole, content: string): ChatMessage {
  return {
    id: `msg_${Date.now()}_${++msgCounter}`,
    role,
    content,
    timestamp: Date.now(),
  };
}

// ─── Hook ───────────────────────────────────────────────────────
export function useOnboardingChat() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isComplete = currentStepIndex >= STEPS.length - 1 && !isTyping;
  const currentStep = STEPS[currentStepIndex] ?? null;
  const nextStepConfig = STEPS[currentStepIndex + 1] ?? null;

  // Save answer to profile
  const saveAnswer = useMutation({
    mutationFn: async ({
      field,
      value,
      allAnswers,
    }: {
      field?: string;
      value: string;
      allAnswers: OnboardingAnswers;
    }) => {
      if (!user) return;

      const updates: Record<string, unknown> = {
        onboarding_answers: allAnswers,
      };

      if (field) {
        updates[field] = value;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates as never)
        .eq("id", user.id);

      if (error) {
        console.warn("Profile update skipped:", error.message);
      }
    },
    onError: () => {
      // Non-critical, don't block the flow
      console.warn("Answer save skipped");
    },
  });

  // Complete onboarding
  const completeOnboarding = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_step: 7,
        } as never)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: () => {
      toast.error("Erreur lors de la finalisation");
    },
  });

  // Show a bot message with typing delay
  const showBotMessage = useCallback(
    (content: string, delay = 500): Promise<void> => {
      return new Promise((resolve) => {
        setIsTyping(true);
        typingTimeoutRef.current = setTimeout(() => {
          setMessages((prev) => [...prev, createMessage("bot", content)]);
          setIsTyping(false);
          resolve();
        }, delay);
      });
    },
    [],
  );

  // Start the conversation
  const startConversation = useCallback(async () => {
    if (isStarted) return;
    setIsStarted(true);

    const firstStep = STEPS[0];
    const initialAnswers: OnboardingAnswers = {};

    // Pre-fill name from profile if available
    if (profile?.full_name) {
      initialAnswers.name = profile.full_name;
    }

    setAnswers(initialAnswers);

    await showBotMessage(firstStep.getBotMessage(initialAnswers), 800);
    setCurrentStepIndex(0);
  }, [isStarted, profile, showBotMessage]);

  // Send an answer
  const sendAnswer = useCallback(
    async (answer: string) => {
      if (currentStepIndex < 0 || currentStepIndex >= STEPS.length - 1) return;
      if (isTyping) return;

      const step = STEPS[currentStepIndex];

      // Add user message
      setMessages((prev) => [...prev, createMessage("user", answer)]);

      // Update answers
      const newAnswers = { ...answers, [step.key]: answer };
      setAnswers(newAnswers);

      // Save to profile
      saveAnswer.mutate({
        field: step.profileField,
        value: answer,
        allAnswers: newAnswers,
      });

      // Advance to next step
      const nextIndex = currentStepIndex + 1;
      const nextStep = STEPS[nextIndex];

      if (nextStep) {
        await showBotMessage(nextStep.getBotMessage(newAnswers), 600);
        setCurrentStepIndex(nextIndex);
      }
    },
    [currentStepIndex, answers, isTyping, showBotMessage, saveAnswer],
  );

  // Cleanup
  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  return {
    messages,
    currentStep,
    nextStepConfig,
    currentStepIndex,
    answers,
    isTyping,
    isComplete,
    isStarted,
    startConversation,
    sendAnswer,
    completeOnboarding,
    cleanup,
    totalSteps: STEPS.length,
  };
}
