"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useAllCheckins, useCheckins } from "@/hooks/use-checkins";
import { MOOD_CONFIG, ENERGY_CONFIG } from "@/types/coaching";
import type { Mood, Energy, WeeklyCheckin } from "@/types/coaching";
import { ClipboardCheck, MessageSquare, Send, Search, Filter, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

function formatWeek(dateStr: string) {
  const d = new Date(dateStr);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
}

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

type MoodFilter = "all" | "low" | "high";

export default function CoachCheckinsPage() {
  const { checkins, isLoading } = useAllCheckins();
  const [selectedCheckin, setSelectedCheckin] = useState<WeeklyCheckin | null>(null);
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<MoodFilter>("all");

  // Filter
  const filtered = useMemo(() => {
    let result = checkins;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.client?.full_name?.toLowerCase().includes(q));
    }
    if (moodFilter === "low") {
      result = result.filter((c) => c.mood && (c.mood as number) <= 2);
    } else if (moodFilter === "high") {
      result = result.filter((c) => c.mood && (c.mood as number) >= 4);
    }
    return result;
  }, [checkins, search, moodFilter]);

  // Group by week
  const grouped = filtered.reduce<Record<string, WeeklyCheckin[]>>((acc, c) => {
    const week = c.week_start;
    if (!acc[week]) acc[week] = [];
    acc[week].push(c);
    return acc;
  }, {});

  const weeks = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Global stats
  const globalStats = useMemo(() => {
    const moods = checkins.filter((c) => c.mood).map((c) => c.mood as number);
    const energies = checkins.filter((c) => c.energy).map((c) => c.energy as number);
    const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
    const avgEnergy = energies.length > 0 ? energies.reduce((a, b) => a + b, 0) / energies.length : 0;
    const lowMoodCount = moods.filter((m) => m <= 2).length;
    const totalRevenue = checkins.reduce((sum, c) => sum + Number(c.revenue), 0);
    return { avgMood, avgEnergy, lowMoodCount, totalRevenue, total: checkins.length };
  }, [checkins]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Check-ins clients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivi hebdomadaire de tous vos clients
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} transition={defaultTransition} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Total check-ins</p>
          <p className="text-lg font-semibold text-foreground">{globalStats.total}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Humeur moyenne</p>
          <p className="text-lg font-semibold text-foreground">
            {globalStats.avgMood > 0 ? `${globalStats.avgMood.toFixed(1)}/5` : "—"}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Energie moyenne</p>
          <p className="text-lg font-semibold text-foreground flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            {globalStats.avgEnergy > 0 ? `${globalStats.avgEnergy.toFixed(1)}/5` : "—"}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Moral bas</p>
          <p className={cn("text-lg font-semibold", globalStats.lowMoodCount > 0 ? "text-red-500" : "text-foreground")}>
            {globalStats.lowMoodCount}
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} transition={defaultTransition} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            className="w-full h-9 pl-9 pr-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(["all", "low", "high"] as MoodFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setMoodFilter(f)}
              className={cn(
                "h-9 px-3 rounded-lg text-xs font-medium transition-colors",
                moodFilter === f
                  ? "bg-primary text-white"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "Tous" : f === "low" ? "Moral bas" : "Moral haut"}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : weeks.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-surface border border-border rounded-xl p-12 text-center"
        >
          <ClipboardCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search || moodFilter !== "all" ? "Aucun check-in correspondant" : "Aucun check-in recu"}
          </p>
        </motion.div>
      ) : (
        weeks.map((week) => (
          <motion.div
            key={week}
            variants={fadeInUp}
            transition={defaultTransition}
            className="bg-surface border border-border rounded-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h2 className="text-sm font-semibold text-foreground">
                Semaine du {formatWeek(week)}
              </h2>
              <p className="text-xs text-muted-foreground">
                {grouped[week].length} check-in(s)
              </p>
            </div>
            <div className="divide-y divide-border">
              {grouped[week].map((checkin) => (
                <div
                  key={checkin.id}
                  className="px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setSelectedCheckin(selectedCheckin?.id === checkin.id ? null : checkin)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {checkin.client?.avatar_url ? (
                        <img
                          src={checkin.client.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold">
                          {checkin.client?.full_name?.charAt(0) ?? "?"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {checkin.client?.full_name ?? "Client"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatEUR(Number(checkin.revenue))}</span>
                          <span>{checkin.prospection_count} prospections</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {checkin.energy && (
                        <span className="text-lg" title={`Energie: ${ENERGY_CONFIG[checkin.energy as Energy]?.label}`}>
                          {ENERGY_CONFIG[checkin.energy as Energy]?.emoji}
                        </span>
                      )}
                      {checkin.mood && (
                        <span className="text-lg" title={`Humeur: ${MOOD_CONFIG[checkin.mood as Mood]?.label}`}>
                          {MOOD_CONFIG[checkin.mood as Mood]?.emoji}
                        </span>
                      )}
                      {checkin.coach_feedback && (
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                  </div>

                  {selectedCheckin?.id === checkin.id && (
                    <CheckinDetail checkin={checkin} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}

function CheckinDetail({ checkin }: { checkin: WeeklyCheckin }) {
  const { addFeedback } = useCheckins(checkin.client_id);
  const [feedback, setFeedback] = useState(checkin.coach_feedback ?? "");

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2" onClick={(e) => e.stopPropagation()}>
      {checkin.win && (
        <div className="text-xs">
          <span className="text-emerald-600 font-medium">Victoire:</span>{" "}
          <span className="text-foreground">{checkin.win}</span>
        </div>
      )}
      {checkin.blocker && (
        <div className="text-xs">
          <span className="text-red-500 font-medium">Blocage:</span>{" "}
          <span className="text-foreground">{checkin.blocker}</span>
        </div>
      )}
      {checkin.goal_next_week && (
        <div className="text-xs">
          <span className="text-blue-500 font-medium">Objectif:</span>{" "}
          <span className="text-foreground">{checkin.goal_next_week}</span>
        </div>
      )}
      {checkin.gratitudes && checkin.gratitudes.length > 0 && (
        <div className="text-xs">
          <span className="text-pink-500 font-medium">Gratitudes:</span>
          <ul className="ml-4 mt-0.5 list-disc text-foreground">
            {checkin.gratitudes.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
      )}
      {checkin.daily_goals && checkin.daily_goals.length > 0 && (
        <div className="text-xs">
          <span className="text-amber-500 font-medium">Objectifs du jour:</span>
          <ul className="ml-4 mt-0.5 list-disc text-foreground">
            {checkin.daily_goals.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
      )}
      {checkin.notes && (
        <div className="text-xs">
          <span className="text-muted-foreground font-medium">Notes:</span>{" "}
          <span className="text-foreground">{checkin.notes}</span>
        </div>
      )}

      {/* Coach feedback */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Ajouter un feedback..."
          className="flex-1 h-8 px-3 bg-muted rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => addFeedback.mutate({ checkinId: checkin.id, feedback })}
          disabled={!feedback.trim() || addFeedback.isPending}
          className="h-8 w-8 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
