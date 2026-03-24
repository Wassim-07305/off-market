"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useChallenges } from "@/hooks/use-challenges";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Trophy,
  Plus,
  Trash2,
  X,
  Clock,
  Users,
  Zap,
  Calendar,
} from "lucide-react";
import { CreateChallengeModal } from "@/components/gamification/create-challenge-modal";
import {
  CHALLENGE_TYPE_CONFIG,
  type Challenge,
  type ChallengeType,
} from "@/types/gamification";

export default function AdminChallengesPage() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { updateChallenge } = useChallenges();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch ALL challenges (active + inactive, past + future)
  const { data: allChallenges, isLoading } = useQuery({
    queryKey: ["admin-challenges"],
    enabled: !!user,
    queryFn: async () => {
      const { data: challenges, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch participant counts
      const { data: counts, error: countsError } = await (supabase as any)
        .from("challenge_participants")
        .select("challenge_id");
      if (countsError) throw countsError;

      const countMap = new Map<string, number>();
      for (const row of counts ?? []) {
        countMap.set(
          row.challenge_id,
          (countMap.get(row.challenge_id) ?? 0) + 1,
        );
      }

      return (challenges as Challenge[]).map((c) => ({
        ...c,
        participant_count: countMap.get(c.id) ?? 0,
      }));
    },
  });

  const handleToggleActive = async (challenge: Challenge & { participant_count: number }) => {
    setTogglingId(challenge.id);
    try {
      await updateChallenge.mutateAsync({
        id: challenge.id,
        is_active: !challenge.is_active,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-challenges"] });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Defi supprime avec succes");
      queryClient.invalidateQueries({ queryKey: ["admin-challenges"] });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    } catch {
      toast.error("Erreur lors de la suppression du defi");
    }
    setDeleteConfirm(null);
  };

  const challenges = allChallenges ?? [];
  const active = challenges.filter((c) => c.is_active);
  const inactive = challenges.filter((c) => !c.is_active);

  function daysLeft(endDate: string) {
    const diff = new Date(endDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Termine";
    if (days === 1) return "1 jour restant";
    return `${days} jours restants`;
  }

  function ChallengeRow({ challenge }: { challenge: Challenge & { participant_count: number } }) {
    const typeConfig =
      CHALLENGE_TYPE_CONFIG[challenge.challenge_type as ChallengeType];
    const ended = new Date(challenge.ends_at).getTime() < Date.now();

    return (
      <div
        className={cn(
          "bg-surface border border-border rounded-xl p-4 flex items-start gap-3",
          !challenge.is_active && "opacity-50",
        )}
      >
        {/* Type icon */}
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg",
          )}
        >
          {typeConfig.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {challenge.title}
            </p>
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0",
                typeConfig.color,
              )}
            >
              {typeConfig.label}
            </span>
          </div>
          {challenge.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {challenge.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              +{challenge.xp_reward} XP
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {challenge.participant_count} participant{challenge.participant_count !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(challenge.starts_at, "short")} - {formatDate(challenge.ends_at, "short")}
            </span>
            <span
              className={cn(
                "flex items-center gap-1",
                ended ? "text-red-400" : "text-emerald-400",
              )}
            >
              <Clock className="w-3 h-3" />
              {daysLeft(challenge.ends_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active toggle */}
          <button
            onClick={() => handleToggleActive(challenge)}
            disabled={togglingId === challenge.id}
            title={challenge.is_active ? "Desactiver" : "Activer"}
            className={cn(
              "relative w-10 h-5 rounded-full transition-colors",
              challenge.is_active ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-surface shadow-sm transition-transform",
                challenge.is_active ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>

          {/* Delete */}
          {deleteConfirm === challenge.id ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleDelete(challenge.id)}
                className="px-2 py-1 text-[10px] font-medium bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(challenge.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Gestion des defis
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Cree et gere les challenges, active ou desactive-les et suis les
                participations
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nouveau defi
          </button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-surface border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-foreground">{challenges.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Total
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-500">{active.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Actifs
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-muted-foreground">{inactive.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Inactifs
          </p>
        </div>
      </motion.div>

      {/* Active challenges */}
      <motion.div variants={fadeInUp} transition={defaultTransition} className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">
          Actifs ({active.length})
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-muted animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : active.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucun defi actif
            </p>
          </div>
        ) : (
          active.map((c) => <ChallengeRow key={c.id} challenge={c} />)
        )}
      </motion.div>

      {/* Inactive challenges */}
      {inactive.length > 0 && (
        <motion.div variants={fadeInUp} transition={defaultTransition} className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Inactifs ({inactive.length})
          </h2>
          {inactive.map((c) => (
            <ChallengeRow key={c.id} challenge={c} />
          ))}
        </motion.div>
      )}

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          queryClient.invalidateQueries({ queryKey: ["admin-challenges"] });
        }}
      />
    </motion.div>
  );
}
