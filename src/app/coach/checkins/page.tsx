"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useAllCheckins } from "@/hooks/use-checkins";
import { useCheckins } from "@/hooks/use-checkins";
import { MOOD_CONFIG } from "@/types/coaching";
import type { Mood, WeeklyCheckin } from "@/types/coaching";
import { ClipboardCheck, MessageSquare, Send } from "lucide-react";

function formatWeek(dateStr: string) {
  const d = new Date(dateStr);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
}

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default function CoachCheckinsPage() {
  const { checkins, isLoading } = useAllCheckins();
  const [selectedCheckin, setSelectedCheckin] = useState<WeeklyCheckin | null>(null);

  // Group by week
  const grouped = checkins.reduce<Record<string, WeeklyCheckin[]>>((acc, c) => {
    const week = c.week_start;
    if (!acc[week]) acc[week] = [];
    acc[week].push(c);
    return acc;
  }, {});

  const weeks = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

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
          <p className="text-sm text-muted-foreground">Aucun check-in recu</p>
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
                      {checkin.mood && (
                        <span className="text-lg">{MOOD_CONFIG[checkin.mood as Mood]?.emoji}</span>
                      )}
                      {checkin.coach_feedback && (
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
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
