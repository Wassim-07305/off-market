"use client";

import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, CheckCircle, AlertCircle, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { ChallengeEntry } from "@/types/upsell";

interface ChallengeLeaderboardProps {
  challengeId: string;
  challengeTitle?: string;
}

interface LeaderboardRow {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_value: number;
  verified_value: number;
  entry_count: number;
  has_unverified: boolean;
}

export function ChallengeLeaderboard({
  challengeId,
  challengeTitle,
}: ChallengeLeaderboardProps) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["challenge-leaderboard", challengeId],
    enabled: !!user,
    queryFn: async () => {
      // Fetch all entries for this challenge with user profiles
      const { data, error } = await (supabase as any)
        .from("challenge_entries")
        .select(
          "*, user:profiles!challenge_entries_user_id_fkey(id, full_name, avatar_url)",
        )
        .eq("challenge_id", challengeId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;

      const entries = data as (ChallengeEntry & {
        user: { id: string; full_name: string; avatar_url: string | null };
      })[];

      // Aggregate by user
      const userMap = new Map<string, LeaderboardRow>();
      for (const entry of entries) {
        const existing = userMap.get(entry.user_id);
        if (existing) {
          existing.total_value += Number(entry.metric_value);
          if (entry.verified) {
            existing.verified_value += Number(entry.metric_value);
          } else {
            existing.has_unverified = true;
          }
          existing.entry_count += 1;
        } else {
          userMap.set(entry.user_id, {
            user_id: entry.user_id,
            full_name: entry.user?.full_name ?? "Utilisateur",
            avatar_url: entry.user?.avatar_url ?? null,
            total_value: Number(entry.metric_value),
            verified_value: entry.verified ? Number(entry.metric_value) : 0,
            entry_count: 1,
            has_unverified: !entry.verified,
          });
        }
      }

      // Sort by verified value first, then total
      return [...userMap.values()].sort(
        (a, b) =>
          b.verified_value - a.verified_value || b.total_value - a.total_value,
      );
    },
  });

  const RANK_ICONS = [
    { icon: Crown, color: "text-amber-500" },
    { icon: Medal, color: "text-zinc-400" },
    { icon: Medal, color: "text-amber-700" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          Classement {challengeTitle ? `- ${challengeTitle}` : "du defi"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="mx-auto h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Aucune soumission pour ce defi.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, index) => {
              const isMe = row.user_id === user?.id;
              const rankConfig = RANK_ICONS[index];

              return (
                <div
                  key={row.user_id}
                  className={cn(
                    "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors",
                    isMe
                      ? "bg-primary/5 border border-primary/10"
                      : "hover:bg-muted/50",
                  )}
                >
                  {/* Rank */}
                  <div className="w-8 flex-shrink-0 text-center">
                    {rankConfig ? (
                      <rankConfig.icon
                        className={cn("h-5 w-5 mx-auto", rankConfig.color)}
                      />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  {row.avatar_url ? (
                    <img
                      src={row.avatar_url}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {row.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {row.full_name}
                      {isMe && (
                        <span className="text-xs text-primary ml-1">
                          (vous)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.entry_count} soumission(s)
                    </p>
                  </div>

                  {/* Score + verification */}
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-sm font-bold">
                        {row.verified_value.toLocaleString("fr-FR")}
                      </p>
                      {row.has_unverified && (
                        <p className="text-xs text-amber-500 flex items-center gap-0.5 justify-end">
                          <AlertCircle className="h-3 w-3" />+
                          {(
                            row.total_value - row.verified_value
                          ).toLocaleString("fr-FR")}{" "}
                          en attente
                        </p>
                      )}
                    </div>
                    {!row.has_unverified && row.entry_count > 0 && (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
