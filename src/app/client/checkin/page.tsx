"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useCheckins } from "@/hooks/use-checkins";
import { MOOD_CONFIG, ENERGY_CONFIG } from "@/types/coaching";
import type { Mood, Energy, WeeklyCheckin } from "@/types/coaching";
import {
  ClipboardCheck,
  Send,
  Flame,
  TrendingUp,
  Heart,
  Zap,
  Euro,
  Calendar,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  StickyNote,
  ChevronDown,
  Trophy,
  Target,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Minus,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyCheckinCard } from "@/components/coaching/daily-checkin-card";

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

function formatShortWeek(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function CheckinPage() {
  const { checkins, isLoading, submitCheckin, stats, heatmapData } =
    useCheckins();
  const thisWeek = getMonday(new Date());
  const hasThisWeek = checkins.some((c) => c.week_start === thisWeek);

  // Form state
  const [revenue, setRevenue] = useState("");
  const [prospection, setProspection] = useState("");
  const [win, setWin] = useState("");
  const [blocker, setBlocker] = useState("");
  const [goal, setGoal] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [gratitudes, setGratitudes] = useState<string[]>([""]);
  const [dailyGoals, setDailyGoals] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  // Heatmap navigation
  const [heatmapOffset, setHeatmapOffset] = useState(0);

  // Trends
  const trends = useMemo(() => {
    const sorted = [...checkins].sort((a, b) =>
      b.week_start.localeCompare(a.week_start),
    );
    if (sorted.length < 2) return null;
    const current = sorted[0];
    const previous = sorted[1];
    const revDiff = Number(current.revenue) - Number(previous.revenue);
    const prosDiff = current.prospection_count - previous.prospection_count;
    return {
      revenueDiff: revDiff,
      prospectionDiff: prosDiff,
      revenueUp: revDiff > 0,
      prospectionUp: prosDiff > 0,
    };
  }, [checkins]);

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
        energy: energy ?? undefined,
        gratitudes: gratitudes.filter((g) => g.trim()),
        daily_goals: dailyGoals.filter((g) => g.trim()),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setRevenue("");
          setProspection("");
          setWin("");
          setBlocker("");
          setGoal("");
          setMood(null);
          setEnergy(null);
          setGratitudes([""]);
          setDailyGoals([""]);
          setNotes("");
          setCurrentStep(0);
        },
      },
    );
  };

  const addGratitude = () => {
    if (gratitudes.length < 5) setGratitudes([...gratitudes, ""]);
  };
  const removeGratitude = (i: number) => {
    setGratitudes(gratitudes.filter((_, idx) => idx !== i));
  };
  const updateGratitude = (i: number, val: string) => {
    const next = [...gratitudes];
    next[i] = val;
    setGratitudes(next);
  };

  const addDailyGoal = () => {
    if (dailyGoals.length < 5) setDailyGoals([...dailyGoals, ""]);
  };
  const removeDailyGoal = (i: number) => {
    setDailyGoals(dailyGoals.filter((_, idx) => idx !== i));
  };
  const updateDailyGoal = (i: number, val: string) => {
    const next = [...dailyGoals];
    next[i] = val;
    setDailyGoals(next);
  };

  // Form steps for guided mode
  const STEPS = [
    { label: "Bien-etre", icon: Heart },
    { label: "Business", icon: Euro },
    { label: "Gratitudes", icon: Heart },
    { label: "Objectifs", icon: Target },
    { label: "Bilan", icon: ClipboardCheck },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Check-in hebdomadaire
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Semaine du {formatWeek(thisWeek)}
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${stats.streak} sem.`}
          color="text-orange-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Check-ins"
          value={String(stats.totalCheckins)}
          color="text-blue-500"
        />
        <StatCard
          icon={Heart}
          label="Humeur moy."
          value={stats.avgMood > 0 ? `${stats.avgMood.toFixed(1)}/5` : "\u2014"}
          color="text-pink-500"
        />
        <StatCard
          icon={Zap}
          label="Energie moy."
          value={
            stats.avgEnergy > 0 ? `${stats.avgEnergy.toFixed(1)}/5` : "\u2014"
          }
          color="text-amber-500"
        />
      </motion.div>

      {/* Heatmap calendar */}
      <motion.div variants={staggerItem}>
        <HeatmapCalendar
          heatmapData={heatmapData}
          offset={heatmapOffset}
          onPrev={() => setHeatmapOffset(heatmapOffset + 1)}
          onNext={() => setHeatmapOffset(Math.max(0, heatmapOffset - 1))}
        />
      </motion.div>

      {/* Daily check-in (morning / evening) */}
      <motion.div variants={staggerItem}>
        <DailyCheckinCard />
      </motion.div>

      {/* Weekly form or success */}
      {hasThisWeek ? (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-8 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Check-in soumis !
          </h2>
          <p className="text-sm text-muted-foreground">
            Ton check-in de cette semaine est enregistre.
          </p>
          {stats.streak > 1 && (
            <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full">
              <Flame className="w-3.5 h-3.5" />
              {stats.streak} semaines consecutives
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {/* Step indicators */}
          <div className="flex items-center gap-1 px-6 pt-5 pb-3">
            {STEPS.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={cn(
                    "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all",
                    currentStep === i
                      ? "bg-primary/10 text-primary"
                      : currentStep > i
                        ? "text-emerald-500"
                        : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {currentStep > i ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>

          <div className="px-6 pb-6 pt-2 space-y-6">
            {/* Step 0: Mood + Energy */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Comment te sens-tu ?
                    </label>
                    <div className="flex gap-1.5">
                      {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMood(m)}
                          className={cn(
                            "flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-150",
                            mood === m
                              ? "border-primary bg-primary/5 scale-105"
                              : "border-border hover:bg-muted/50",
                          )}
                        >
                          <span className="text-xl">
                            {MOOD_CONFIG[m].emoji}
                          </span>
                          <span className="text-[9px] text-muted-foreground leading-tight">
                            {MOOD_CONFIG[m].label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Niveau d&apos;energie
                    </label>
                    <div className="flex gap-1.5">
                      {([1, 2, 3, 4, 5] as Energy[]).map((e) => (
                        <button
                          key={e}
                          onClick={() => setEnergy(e)}
                          className={cn(
                            "flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-150",
                            energy === e
                              ? "border-primary bg-primary/5 scale-105"
                              : "border-border hover:bg-muted/50",
                          )}
                        >
                          <span className="text-xl">
                            {ENERGY_CONFIG[e].emoji}
                          </span>
                          <span className="text-[9px] text-muted-foreground leading-tight">
                            {ENERGY_CONFIG[e].label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Revenue + Prospection */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      CA cette semaine (EUR)
                    </label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        placeholder="0"
                        className="w-full h-10 pl-9 pr-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {trends && (
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1.5 text-[10px]",
                          trends.revenueUp
                            ? "text-emerald-500"
                            : trends.revenueDiff < 0
                              ? "text-red-500"
                              : "text-muted-foreground",
                        )}
                      >
                        {trends.revenueUp ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : trends.revenueDiff < 0 ? (
                          <ArrowDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {Math.abs(trends.revenueDiff).toLocaleString("fr-FR")}{" "}
                        EUR vs semaine dernière
                      </div>
                    )}
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
                      className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {trends && (
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1.5 text-[10px]",
                          trends.prospectionUp
                            ? "text-emerald-500"
                            : trends.prospectionDiff < 0
                              ? "text-red-500"
                              : "text-muted-foreground",
                        )}
                      >
                        {trends.prospectionUp ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : trends.prospectionDiff < 0 ? (
                          <ArrowDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {Math.abs(trends.prospectionDiff)} vs semaine dernière
                      </div>
                    )}
                  </div>
                </div>

                {/* Win + Blocker */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    Victoire de la semaine
                  </label>
                  <input
                    type="text"
                    value={win}
                    onChange={(e) => setWin(e.target.value)}
                    placeholder="Qu'as-tu accompli de bien ?"
                    className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Blocage principal
                  </label>
                  <input
                    type="text"
                    value={blocker}
                    onChange={(e) => setBlocker(e.target.value)}
                    placeholder="Qu'est-ce qui t'a freine ?"
                    className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Gratitudes */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Gratitudes du jour
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Nomme 3 choses pour lesquelles tu es reconnaissant
                </p>
                <div className="space-y-2">
                  {gratitudes.map((g, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-sm text-muted-foreground mt-2.5 w-5 text-right">
                        {i + 1}.
                      </span>
                      <input
                        type="text"
                        value={g}
                        onChange={(e) => updateGratitude(i, e.target.value)}
                        placeholder="Je suis reconnaissant pour..."
                        className="flex-1 h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {gratitudes.length > 1 && (
                        <button
                          onClick={() => removeGratitude(i)}
                          className="w-8 h-10 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {gratitudes.length < 5 && (
                    <button
                      onClick={addGratitude}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline ml-7"
                    >
                      <Plus className="w-3 h-3" /> Ajouter
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Daily goals + Goal next week */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Objectifs du jour
                  </label>
                  <div className="space-y-2">
                    {dailyGoals.map((g, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-sm text-muted-foreground mt-2.5 w-5 text-right">
                          {i + 1}.
                        </span>
                        <input
                          type="text"
                          value={g}
                          onChange={(e) => updateDailyGoal(i, e.target.value)}
                          placeholder="Aujourd'hui je vais..."
                          className="flex-1 h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        {dailyGoals.length > 1 && (
                          <button
                            onClick={() => removeDailyGoal(i)}
                            className="w-8 h-10 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {dailyGoals.length < 5 && (
                      <button
                        onClick={addDailyGoal}
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline ml-7"
                      >
                        <Plus className="w-3 h-3" /> Ajouter
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    Objectif semaine prochaine
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Sur quoi vas-tu te concentrer ?"
                    className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Notes + Submit */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                    <StickyNote className="w-3.5 h-3.5" />
                    Notes libres
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Pensees, reflexions, idees..."
                    rows={4}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                {/* Summary preview */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Resume
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Heart className="w-3 h-3 text-pink-500" />
                      <span className="text-muted-foreground">Humeur:</span>
                      <span className="text-foreground">
                        {mood ? MOOD_CONFIG[mood].emoji : "\u2014"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-muted-foreground">Energie:</span>
                      <span className="text-foreground">
                        {energy ? ENERGY_CONFIG[energy].emoji : "\u2014"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="w-3 h-3 text-emerald-500" />
                      <span className="text-muted-foreground">CA:</span>
                      <span className="text-foreground font-medium">
                        {revenue
                          ? `${Number(revenue).toLocaleString("fr-FR")} EUR`
                          : "\u2014"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-blue-500" />
                      <span className="text-muted-foreground">
                        Prospections:
                      </span>
                      <span className="text-foreground font-medium">
                        {prospection || "\u2014"}
                      </span>
                    </div>
                  </div>
                  {win && (
                    <p className="text-xs mt-1">
                      <span className="text-emerald-500 font-medium">
                        Victoire:
                      </span>{" "}
                      {win}
                    </p>
                  )}
                  {blocker && (
                    <p className="text-xs">
                      <span className="text-red-500 font-medium">Blocage:</span>{" "}
                      {blocker}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className={cn(
                  "h-10 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                  currentStep === 0
                    ? "opacity-0 pointer-events-none"
                    : "bg-muted text-foreground hover:bg-border/50",
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Precedent
              </button>

              {currentStep === STEPS.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitCheckin.isPending}
                  className="h-10 px-6 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitCheckin.isPending
                    ? "Envoi..."
                    : "Soumettre mon check-in"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))
                  }
                  className="h-10 px-6 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* History */}
      <motion.div variants={staggerItem}>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Historique ({checkins.length})
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-surface rounded-2xl animate-shimmer"
                style={{ boxShadow: "var(--shadow-card)" }}
              />
            ))}
          </div>
        ) : checkins.length === 0 ? (
          <div
            className="bg-surface rounded-2xl p-8 text-center"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <ClipboardCheck className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucun check-in pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {checkins.map((c) => (
              <HistoryCard key={c.id} checkin={c} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Sub-components ──────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="bg-surface rounded-2xl p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-4 h-4", color)} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-display font-bold text-foreground">{value}</p>
    </div>
  );
}

function HeatmapCalendar({
  heatmapData,
  offset,
  onPrev,
  onNext,
}: {
  heatmapData: Record<string, { mood: Mood | null; energy: Energy | null }>;
  offset: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const weeks = useMemo(() => {
    const result: string[] = [];
    const now = new Date();
    const currentMonday = new Date(getMonday(now));
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentMonday);
      d.setDate(d.getDate() - (i + offset * 12) * 7);
      result.push(d.toISOString().split("T")[0]);
    }
    return result.reverse();
  }, [offset]);

  const getMoodColor = (mood: Mood | null): string => {
    if (!mood) return "bg-muted/40";
    const colors: Record<Mood, string> = {
      1: "bg-red-400",
      2: "bg-orange-400",
      3: "bg-amber-400",
      4: "bg-emerald-400",
      5: "bg-green-500",
    };
    return colors[mood];
  };

  return (
    <div
      className="bg-surface rounded-2xl p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Historique d&apos;humeur
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            disabled={offset === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 justify-center">
        {weeks.map((w) => {
          const data = heatmapData[w];
          const d = new Date(w);
          const label = d.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          });
          return (
            <div key={w} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-colors",
                  data ? getMoodColor(data.mood) : "bg-muted/40",
                )}
                title={`${label}${data?.mood ? ` \u2014 ${MOOD_CONFIG[data.mood].label}` : " \u2014 Pas de check-in"}`}
              />
              <span className="text-[8px] text-muted-foreground leading-tight">
                {d.toLocaleDateString("fr-FR", { day: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <span className="text-[10px] text-muted-foreground">Humeur:</span>
        {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
          <div key={m} className="flex items-center gap-1">
            <div className={cn("w-3 h-3 rounded", getMoodColor(m))} />
            <span className="text-[10px] text-muted-foreground">
              {MOOD_CONFIG[m].emoji}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted/40" />
          <span className="text-[10px] text-muted-foreground">Vide</span>
        </div>
      </div>
    </div>
  );
}

function HistoryCard({ checkin: c }: { checkin: WeeklyCheckin }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "bg-surface rounded-2xl overflow-hidden transition-all cursor-pointer",
        expanded ? "ring-1 ring-primary/20" : "hover:ring-1 hover:ring-border",
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {formatWeek(c.week_start)}
          </span>
          <div className="flex items-center gap-2">
            {c.energy && (
              <span className="text-lg">
                {ENERGY_CONFIG[c.energy as Energy]?.emoji}
              </span>
            )}
            {c.mood && (
              <span className="text-lg">
                {MOOD_CONFIG[c.mood as Mood]?.emoji}
              </span>
            )}
            {c.coach_feedback && (
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">CA:</span>{" "}
            <span className="text-foreground font-medium">
              {Number(c.revenue).toLocaleString("fr-FR")} EUR
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Prospections:</span>{" "}
            <span className="text-foreground font-medium">
              {c.prospection_count}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="px-4 pb-4 pt-2 border-t border-border/50 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              {c.win && (
                <p className="text-xs">
                  <span className="text-emerald-600 font-medium">
                    Victoire:
                  </span>{" "}
                  {c.win}
                </p>
              )}
              {c.blocker && (
                <p className="text-xs">
                  <span className="text-red-500 font-medium">Blocage:</span>{" "}
                  {c.blocker}
                </p>
              )}
              {c.goal_next_week && (
                <p className="text-xs">
                  <span className="text-blue-500 font-medium">Objectif:</span>{" "}
                  {c.goal_next_week}
                </p>
              )}
              {c.gratitudes && c.gratitudes.length > 0 && (
                <div className="text-xs">
                  <span className="text-pink-500 font-medium">Gratitudes:</span>
                  <ul className="ml-4 mt-0.5 list-disc text-foreground">
                    {c.gratitudes.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
              {c.daily_goals && c.daily_goals.length > 0 && (
                <div className="text-xs">
                  <span className="text-amber-500 font-medium">
                    Objectifs du jour:
                  </span>
                  <ul className="ml-4 mt-0.5 list-disc text-foreground">
                    {c.daily_goals.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
              {c.notes && (
                <p className="text-xs">
                  <span className="text-muted-foreground font-medium">
                    Notes:
                  </span>{" "}
                  {c.notes}
                </p>
              )}
              {c.coach_feedback && (
                <div className="mt-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageSquare className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
                      Feedback coach
                    </span>
                  </div>
                  <p className="text-xs text-foreground">{c.coach_feedback}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
