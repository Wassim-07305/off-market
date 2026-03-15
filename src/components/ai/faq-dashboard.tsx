"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  HelpCircle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { AiResponseBadge } from "@/components/ai/ai-response-badge";

interface FAQStat {
  question: string;
  count: number;
  hasAnswer: boolean;
}

export function FAQDashboard() {
  const supabase = useSupabase();

  // Fetch all AI messages to build FAQ stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["faq-stats"],
    queryFn: async () => {
      // Get user messages (questions)
      const { data: messages, error } = await supabase
        .from("ai_messages")
        .select("content, role, conversation_id")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      // Group questions by similarity (simple word matching)
      const questionMap = new Map<
        string,
        { count: number; hasAnswer: boolean }
      >();
      const userMessages = ((messages ?? []) as any[]).filter(
        (m) => m.role === "user",
      );
      const allMessages = (messages ?? []) as any[];

      for (const msg of userMessages) {
        const normalized = msg.content.toLowerCase().trim().slice(0, 80);
        const existing = questionMap.get(normalized);

        // Check if the conversation has an assistant response
        const hasAnswer = allMessages.some(
          (m) =>
            m.conversation_id === msg.conversation_id &&
            m.role === "assistant" &&
            !m.content.includes("sera bientot connectee"),
        );

        if (existing) {
          existing.count++;
          if (hasAnswer) existing.hasAnswer = true;
        } else {
          questionMap.set(normalized, { count: 1, hasAnswer });
        }
      }

      // Sort by count, take top 10
      const topQuestions: FAQStat[] = [...questionMap.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([question, data]) => ({
          question,
          count: data.count,
          hasAnswer: data.hasAnswer,
        }));

      const totalQuestions = userMessages.length;
      const answered = userMessages.filter((m) =>
        allMessages.some(
          (am) =>
            am.conversation_id === m.conversation_id &&
            am.role === "assistant" &&
            !am.content.includes("sera bientot connectee"),
        ),
      ).length;
      const unanswered = totalQuestions - answered;
      const resolutionRate =
        totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0;

      return {
        topQuestions,
        totalQuestions,
        answered,
        unanswered,
        resolutionRate,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const { topQuestions, totalQuestions, answered, unanswered, resolutionRate } =
    stats ?? {
      topQuestions: [],
      totalQuestions: 0,
      answered: 0,
      unanswered: 0,
      resolutionRate: 0,
    };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Stats row */}
      <motion.div variants={staggerItem} className="grid grid-cols-4 gap-3">
        <StatCard
          icon={MessageSquare}
          iconColor="text-blue-500"
          label="Total questions"
          value={totalQuestions}
        />
        <StatCard
          icon={CheckCircle}
          iconColor="text-emerald-500"
          label="Repondues"
          value={answered}
        />
        <StatCard
          icon={AlertCircle}
          iconColor="text-amber-500"
          label="Sans reponse"
          value={unanswered}
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-primary"
          label="Taux de resolution"
          value={`${resolutionRate}%`}
        />
      </motion.div>

      {/* Top questions */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Top 10 questions posees
          </h3>
        </div>

        {topQuestions.length === 0 ? (
          <div
            className="bg-surface border border-border rounded-xl p-8 text-center"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <HelpCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucune question posee pour le moment
            </p>
          </div>
        ) : (
          <div
            className="bg-surface border border-border rounded-xl divide-y divide-border"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {topQuestions.map((q, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs font-bold text-muted-foreground w-6 text-center tabular-nums">
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {q.question}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {q.count}x
                  </span>
                  {q.hasAnswer ? (
                    <AiResponseBadge />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Unanswered questions */}
      {topQuestions.filter((q) => !q.hasAnswer).length > 0 && (
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Questions sans reponse
            </h3>
          </div>
          <div
            className="bg-amber-500/5 border border-amber-500/20 rounded-xl divide-y divide-amber-500/10"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {topQuestions
              .filter((q) => !q.hasAnswer)
              .map((q, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-foreground truncate flex-1">
                    {q.question}
                  </p>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {q.count} demande{q.count > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
}: {
  icon: typeof MessageSquare;
  iconColor: string;
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="bg-surface rounded-xl p-4 border border-border"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <Icon className={cn("w-5 h-5 mb-2", iconColor)} />
      <p className="text-2xl font-display font-bold text-foreground tabular-nums">
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
