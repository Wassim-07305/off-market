"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useCheckins } from "@/hooks/use-checkins";
import { MOOD_CONFIG } from "@/types/coaching";
import type { Mood } from "@/types/coaching";
import { ClipboardCheck, Send, ChevronDown, ChevronUp } from "lucide-react";

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function formatWeek(dateStr: string) {
  const d = new Date(dateStr);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
}

export default function CheckinPage() {
  const { checkins, isLoading, submitCheckin } = useCheckins();
  const thisWeek = getMonday(new Date());
  const hasThisWeek = checkins.some((c) => c.week_start === thisWeek);

  const [revenue, setRevenue] = useState("");
  const [prospection, setProspection] = useState("");
  const [win, setWin] = useState("");
  const [blocker, setBlocker] = useState("");
  const [goal, setGoal] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = () => {
    submitCheckin.mutate(
      {
        week_start: thisWeek,
        revenue: parseFloat(revenue) || 0,
        prospection_count: parseInt(prospection) || 0,
        win: win || undefined,
        blocker: blocker || undefined,
        goal_next_week: goal || undefined,
        mood: mood ?? undefined,
      },
      {
        onSuccess: () => {
          setRevenue("");
          setProspection("");
          setWin("");
          setBlocker("");
          setGoal("");
          setMood(null);
        },
      }
    );
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Check-in hebdomadaire</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Semaine du {formatWeek(thisWeek)}
        </p>
      </motion.div>

      {hasThisWeek ? (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center"
        >
          <ClipboardCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-emerald-600">
            Check-in de cette semaine deja soumis !
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Vous pourrez soumettre un nouveau check-in la semaine prochaine.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-surface border border-border rounded-xl p-6 space-y-5"
        >
          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Comment vous sentez-vous ?
            </label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
                    mood === m
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span className="text-2xl">{MOOD_CONFIG[m].emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{MOOD_CONFIG[m].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Revenue + Prospection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                CA cette semaine (EUR)
              </label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="0"
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Prospections
              </label>
              <input
                type="number"
                value={prospection}
                onChange={(e) => setProspection(e.target.value)}
                placeholder="0"
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Win */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Victoire de la semaine
            </label>
            <input
              type="text"
              value={win}
              onChange={(e) => setWin(e.target.value)}
              placeholder="Qu'avez-vous accompli de bien cette semaine ?"
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Blocker */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Blocage principal
            </label>
            <input
              type="text"
              value={blocker}
              onChange={(e) => setBlocker(e.target.value)}
              placeholder="Qu'est-ce qui vous a freine ?"
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Objectif semaine prochaine
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Sur quoi allez-vous vous concentrer ?"
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitCheckin.isPending}
            className="w-full h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitCheckin.isPending ? "Envoi..." : "Soumettre mon check-in"}
          </button>
        </motion.div>
      )}

      {/* History */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Historique ({checkins.length})
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : checkins.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun check-in pour le moment</p>
            ) : (
              checkins.map((c) => (
                <div key={c.id} className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {formatWeek(c.week_start)}
                    </span>
                    {c.mood && (
                      <span className="text-lg">{MOOD_CONFIG[c.mood as Mood]?.emoji}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">CA:</span>{" "}
                      <span className="text-foreground font-medium">{Number(c.revenue).toLocaleString("fr-FR")} EUR</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prospections:</span>{" "}
                      <span className="text-foreground font-medium">{c.prospection_count}</span>
                    </div>
                  </div>
                  {c.win && (
                    <p className="text-xs text-emerald-600 mt-2">Victoire: {c.win}</p>
                  )}
                  {c.coach_feedback && (
                    <div className="mt-2 p-2 bg-primary/5 rounded-lg">
                      <p className="text-xs text-primary">Coach: {c.coach_feedback}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
