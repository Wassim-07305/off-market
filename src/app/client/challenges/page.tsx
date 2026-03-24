"use client";

import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useChallenges } from "@/hooks/use-challenges";
import { useMiniChallenge } from "@/hooks/use-mini-challenge";
import { useAuth } from "@/hooks/use-auth";
import { CHALLENGE_TYPE_CONFIG } from "@/types/gamification";
import type { ChallengeType, Challenge } from "@/types/gamification";
import { Flame, Calendar, Users, CheckCircle, Clock, Lock, ArrowRight } from "lucide-react";

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Termine";
  if (days === 1) return "1 jour restant";
  return `${days} jours restants`;
}

export default function ClientChallengesPage() {
  const {
    challenges,
    participations,
    joinedChallengeIds,
    isLoading,
    joinChallenge,
  } = useChallenges();
  const { profile } = useAuth();
  const miniChallenge = useMiniChallenge();

  const isProspect = profile?.role === "prospect";

  // If prospect and mini-challenge expired, show expiration gate
  if (isProspect && miniChallenge.isExpired) {
    return <MiniChallengeExpiredGate />;
  }

  const myChallenges = participations.filter((p) => !p.completed);
  const completedChallenges = participations.filter((p) => p.completed);
  const availableChallenges = challenges.filter(
    (c) => !joinedChallengeIds.has(c.id),
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Defis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Releve les defis pour gagner de l&apos;XP et des badges
        </p>
      </motion.div>

      {/* Mini-challenge countdown banner for prospects */}
      {isProspect && miniChallenge.isJoined && miniChallenge.daysRemaining !== null && (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3"
        >
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">
              Mini-challenge : {miniChallenge.daysRemaining} jour{miniChallenge.daysRemaining > 1 ? "s" : ""} restant{miniChallenge.daysRemaining > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-amber-400/60 mt-0.5">
              Ton acces au challenge expire dans {miniChallenge.daysRemaining} jour{miniChallenge.daysRemaining > 1 ? "s" : ""}. Profites-en !
            </p>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* My active challenges */}
          {myChallenges.length > 0 && (
            <motion.div variants={fadeInUp} transition={defaultTransition}>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Mes defis en cours ({myChallenges.length})
              </h2>
              <div className="space-y-2">
                {myChallenges.map((participation) => {
                  const challenge = participation.challenge;
                  if (!challenge) return null;
                  const typeConfig =
                    CHALLENGE_TYPE_CONFIG[
                      challenge.challenge_type as ChallengeType
                    ];
                  const progress = Number(participation.progress) || 0;

                  return (
                    <div
                      key={participation.id}
                      className="bg-surface border border-border rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{typeConfig.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {challenge.title}
                            </p>
                            {challenge.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {challenge.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeConfig.color}`}
                          >
                            {typeConfig.label}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {daysLeft(challenge.ends_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground shrink-0">
                          {progress}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>+{challenge.xp_reward} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Available challenges */}
          <motion.div variants={fadeInUp} transition={defaultTransition}>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Defis disponibles ({availableChallenges.length})
            </h2>
            {availableChallenges.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-8 text-center">
                <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucun nouveau defi disponible pour le moment
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onJoin={() => joinChallenge.mutate(challenge.id)}
                    isJoining={joinChallenge.isPending}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Completed challenges */}
          {completedChallenges.length > 0 && (
            <motion.div variants={fadeInUp} transition={defaultTransition}>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Terminés ({completedChallenges.length})
              </h2>
              <div className="space-y-2">
                {completedChallenges.map((participation) => {
                  const challenge = participation.challenge;
                  if (!challenge) return null;
                  const typeConfig =
                    CHALLENGE_TYPE_CONFIG[
                      challenge.challenge_type as ChallengeType
                    ];
                  return (
                    <div
                      key={participation.id}
                      className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl opacity-60"
                    >
                      <span className="text-xl">{typeConfig.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {challenge.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          +{challenge.xp_reward} XP gagnes
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

function MiniChallengeExpiredGate() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center space-y-5 p-8">
        <div className="w-16 h-16 rounded-full bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-zinc-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Ton mini-challenge est termine
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Tes 5 jours d&apos;acces gratuit sont ecoules. Rejoins le programme
            complet pour debloquer tous les defis, la formation, le coaching et
            la communaute.
          </p>
        </div>
        <a
          href="/mini-challenge"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Decouvrir le programme
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function ChallengeCard({
  challenge,
  onJoin,
  isJoining,
}: {
  challenge: Challenge;
  onJoin: () => void;
  isJoining: boolean;
}) {
  const typeConfig =
    CHALLENGE_TYPE_CONFIG[challenge.challenge_type as ChallengeType];

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{typeConfig.icon}</span>
          <div>
            <p className="text-sm font-medium text-foreground">
              {challenge.title}
            </p>
            {challenge.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {challenge.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span
                className={`font-medium px-1.5 py-0.5 rounded-full text-[10px] ${typeConfig.color}`}
              >
                {typeConfig.label}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysLeft(challenge.ends_at)}
              </span>
              <span>+{challenge.xp_reward} XP</span>
            </div>
          </div>
        </div>
        <button
          onClick={onJoin}
          disabled={isJoining}
          className="h-8 px-3 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
        >
          {isJoining ? "..." : "Participer"}
        </button>
      </div>
    </div>
  );
}
