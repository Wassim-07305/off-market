"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyCheckins } from "@/hooks/use-checkins";
import { useXp } from "@/hooks/use-xp";
import { MOOD_CONFIG, ENERGY_CONFIG } from "@/types/coaching";
import type { Mood, Energy } from "@/types/coaching";
import {
  Sun,
  Moon,
  Check,
  Send,
  Flame,
  Trophy,
  BookOpen,
  AlertTriangle,
  Heart,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DailyCheckinCard() {
  const {
    morningDone,
    eveningDone,
    isLoading,
    createDailyCheckin,
    dailyStreak,
  } = useDailyCheckins();
  const { awardXp } = useXp();

  const [activeTab, setActiveTab] = useState<"morning" | "evening">(
    morningDone ? "evening" : "morning",
  );

  if (isLoading) {
    return (
      <div
        className="bg-surface rounded-2xl p-6 animate-shimmer"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="h-8 w-48 bg-muted rounded-lg mb-4" />
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div
      className="bg-surface rounded-2xl overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground tracking-tight">
              Check-in quotidien
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          {dailyStreak > 1 && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full">
              <Flame className="w-3.5 h-3.5" />
              {dailyStreak}j
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("morning")}
            className={cn(
              "flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-all",
              activeTab === "morning"
                ? "bg-amber-500/10 text-amber-600"
                : "bg-muted/50 text-muted-foreground hover:text-foreground",
            )}
          >
            <Sun className="w-4 h-4" />
            Matin
            {morningDone && (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("evening")}
            className={cn(
              "flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-all",
              activeTab === "evening"
                ? "bg-indigo-500/10 text-indigo-600"
                : "bg-muted/50 text-muted-foreground hover:text-foreground",
            )}
          >
            <Moon className="w-4 h-4" />
            Soir
            {eveningDone && (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 pt-2">
        <AnimatePresence mode="wait">
          {activeTab === "morning" ? (
            <motion.div
              key="morning"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              {morningDone ? (
                <MorningReadonly checkin={morningDone} />
              ) : (
                <MorningForm
                  onSubmit={async (data) => {
                    await createDailyCheckin.mutateAsync({
                      type: "morning",
                      ...data,
                    });
                    awardXp.mutate({
                      action: "daily_checkin_morning",
                      metadata: { date: new Date().toISOString().split("T")[0] },
                    });
                  }}
                  isPending={createDailyCheckin.isPending}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="evening"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              {eveningDone ? (
                <EveningReadonly checkin={eveningDone} />
              ) : (
                <EveningForm
                  onSubmit={async (data) => {
                    await createDailyCheckin.mutateAsync({
                      type: "evening",
                      ...data,
                    });
                    awardXp.mutate({
                      action: "daily_checkin_evening",
                      metadata: { date: new Date().toISOString().split("T")[0] },
                    });
                  }}
                  isPending={createDailyCheckin.isPending}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Morning Form ────────────────────

function MorningForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: {
    energy: Energy;
    mood: Mood;
    goal_today: string;
    priority: string;
  }) => void;
  isPending: boolean;
}) {
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [goalToday, setGoalToday] = useState("");
  const [priority, setPriority] = useState("");

  const canSubmit = energy && mood && goalToday.trim();

  return (
    <div className="space-y-4">
      {/* Energy */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Niveau d&apos;energie
        </label>
        <div className="flex gap-1.5">
          {([1, 2, 3, 4, 5] as Energy[]).map((e) => (
            <button
              key={e}
              onClick={() => setEnergy(e)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-150",
                energy === e
                  ? "border-primary bg-primary/5 scale-105"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <span className="text-lg">{ENERGY_CONFIG[e].emoji}</span>
              <span className="text-[9px] text-muted-foreground leading-tight">
                {ENERGY_CONFIG[e].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
          <Heart className="w-3.5 h-3.5 text-pink-500" />
          Comment te sens-tu ?
        </label>
        <div className="flex gap-1.5">
          {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-150",
                mood === m
                  ? "border-primary bg-primary/5 scale-105"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <span className="text-lg">{MOOD_CONFIG[m].emoji}</span>
              <span className="text-[9px] text-muted-foreground leading-tight">
                {MOOD_CONFIG[m].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Goal today */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
          <Target className="w-3.5 h-3.5 text-primary" />
          Objectif du jour
        </label>
        <input
          type="text"
          value={goalToday}
          onChange={(e) => setGoalToday(e.target.value)}
          placeholder="Quel est ton objectif principal aujourd'hui ?"
          className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Priority */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
          Priorite n&deg;1
        </label>
        <input
          type="text"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          placeholder="La chose la plus importante à faire"
          className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Submit */}
      <button
        onClick={() => {
          if (energy && mood) {
            onSubmit({
              energy,
              mood,
              goal_today: goalToday,
              priority,
            });
          }
        }}
        disabled={!canSubmit || isPending}
        className="w-full h-10 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Sun className="w-4 h-4" />
        {isPending ? "Envoi..." : "Enregistrer mon check-in matin"}
      </button>
    </div>
  );
}

// ─── Evening Form ────────────────────

function EveningForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: {
    wins: string;
    learnings: string;
    challenges: string;
    gratitude: string;
  }) => void;
  isPending: boolean;
}) {
  const [wins, setWins] = useState("");
  const [learnings, setLearnings] = useState("");
  const [challenges, setChallenges] = useState("");
  const [gratitude, setGratitude] = useState("");

  const canSubmit = wins.trim() || learnings.trim();

  return (
    <div className="space-y-4">
      {/* Wins */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          Victoire du jour
        </label>
        <textarea
          value={wins}
          onChange={(e) => setWins(e.target.value)}
          placeholder="Qu'as-tu accompli aujourd'hui ?"
          rows={2}
          className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Learnings */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          Apprentissages
        </label>
        <textarea
          value={learnings}
          onChange={(e) => setLearnings(e.target.value)}
          placeholder="Qu'as-tu appris aujourd'hui ?"
          rows={2}
          className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Challenges */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          Challenges
        </label>
        <textarea
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
          placeholder="Qu'est-ce qui a ete difficile ?"
          rows={2}
          className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Gratitude */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
          <Heart className="w-3.5 h-3.5 text-pink-500" />
          Gratitude
        </label>
        <textarea
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          placeholder="Pour quoi es-tu reconnaissant aujourd'hui ?"
          rows={2}
          className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={() =>
          onSubmit({ wins, learnings, challenges, gratitude })
        }
        disabled={!canSubmit || isPending}
        className="w-full h-10 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Moon className="w-4 h-4" />
        {isPending ? "Envoi..." : "Enregistrer mon check-in soir"}
      </button>
    </div>
  );
}

// ─── Readonly states ─────────────────

function MorningReadonly({
  checkin,
}: {
  checkin: { energy: number | null; mood: number | null; goal_today: string | null; priority: string | null };
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-emerald-500 mb-2">
        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Check className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-medium">Check-in matin complete</span>
      </div>

      <div className="bg-muted/30 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">Energie:</span>
            <span className="text-sm">
              {checkin.energy ? ENERGY_CONFIG[checkin.energy as Energy]?.emoji : "--"}{" "}
              {checkin.energy ? ENERGY_CONFIG[checkin.energy as Energy]?.label : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Heart className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-xs text-muted-foreground">Humeur:</span>
            <span className="text-sm">
              {checkin.mood ? MOOD_CONFIG[checkin.mood as Mood]?.emoji : "--"}{" "}
              {checkin.mood ? MOOD_CONFIG[checkin.mood as Mood]?.label : ""}
            </span>
          </div>
        </div>
        {checkin.goal_today && (
          <div className="flex items-start gap-2 text-xs">
            <Target className="w-3.5 h-3.5 text-primary mt-0.5" />
            <div>
              <span className="text-muted-foreground font-medium">Objectif: </span>
              <span className="text-foreground">{checkin.goal_today}</span>
            </div>
          </div>
        )}
        {checkin.priority && (
          <div className="flex items-start gap-2 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5" />
            <div>
              <span className="text-muted-foreground font-medium">Priorite: </span>
              <span className="text-foreground">{checkin.priority}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EveningReadonly({
  checkin,
}: {
  checkin: { wins: string | null; learnings: string | null; challenges: string | null; gratitude: string | null };
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-emerald-500 mb-2">
        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Check className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-medium">Check-in soir complete</span>
      </div>

      <div className="bg-muted/30 rounded-xl p-4 space-y-2.5">
        {checkin.wins && (
          <div className="flex items-start gap-2 text-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
            <div>
              <span className="text-muted-foreground font-medium">Victoire: </span>
              <span className="text-foreground">{checkin.wins}</span>
            </div>
          </div>
        )}
        {checkin.learnings && (
          <div className="flex items-start gap-2 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
            <div>
              <span className="text-muted-foreground font-medium">Apprentissages: </span>
              <span className="text-foreground">{checkin.learnings}</span>
            </div>
          </div>
        )}
        {checkin.challenges && (
          <div className="flex items-start gap-2 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5" />
            <div>
              <span className="text-muted-foreground font-medium">Challenges: </span>
              <span className="text-foreground">{checkin.challenges}</span>
            </div>
          </div>
        )}
        {checkin.gratitude && (
          <div className="flex items-start gap-2 text-xs">
            <Heart className="w-3.5 h-3.5 text-pink-500 mt-0.5" />
            <div>
              <span className="text-muted-foreground font-medium">Gratitude: </span>
              <span className="text-foreground">{checkin.gratitude}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
