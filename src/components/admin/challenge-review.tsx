"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  CheckCircle,
  XCircle,
  ExternalLink,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { METRIC_TYPES } from "@/types/upsell";
import type { ChallengeEntry } from "@/types/upsell";
import { formatRelativeDate } from "@/lib/utils";

interface ChallengeReviewProps {
  challengeId?: string;
}

export function ChallengeReview({ challengeId }: ChallengeReviewProps) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["challenge-entries-review", challengeId],
    enabled: !!user,
    queryFn: async () => {
      let query = (supabase as any)
        .from("challenge_entries")
        .select(
          "*, user:profiles!challenge_entries_user_id_fkey(id, full_name, avatar_url, email)",
        )
        .order("submitted_at", { ascending: false });

      if (challengeId) {
        query = query.eq("challenge_id", challengeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (ChallengeEntry & {
        user: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          email: string;
        };
      })[];
    },
  });

  const verifyEntry = useMutation({
    mutationFn: async ({
      entryId,
      verified,
      source,
    }: {
      entryId: string;
      verified: boolean;
      source: string;
    }) => {
      const { error } = await (supabase as any)
        .from("challenge_entries")
        .update({
          verified,
          verification_source: source,
          reviewed_by: user?.id,
        })
        .eq("id", entryId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["challenge-entries-review"],
      });
      queryClient.invalidateQueries({
        queryKey: ["challenge-leaderboard"],
      });
      toast.success(
        variables.verified ? "Soumission verifiee" : "Soumission rejetee",
      );
    },
    onError: () => {
      toast.error("Erreur lors de la verification");
    },
  });

  function handleVerify(entryId: string) {
    verifyEntry.mutate({
      entryId,
      verified: true,
      source: "admin_review",
    });
  }

  function handleReject(entryId: string) {
    verifyEntry.mutate({
      entryId,
      verified: false,
      source: "admin_rejected",
    });
  }

  const pendingEntries = entries.filter(
    (e) => !e.verified && e.verification_source !== "admin_rejected",
  );
  const reviewedEntries = entries.filter(
    (e) => e.verified || e.verification_source === "admin_rejected",
  );

  const metricLabel = (type: string) =>
    METRIC_TYPES.find((m) => m.value === type)?.label ?? type;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Verification des soumissions
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Verifiez les resultats soumis par les participants et croisez avec les
          donnees CRM.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Pending review */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                En attente de verification ({pendingEntries.length})
              </CardTitle>
              <CardDescription>
                Soumissions non encore verifiees
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Aucune soumission en attente.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:border-border transition-colors"
                    >
                      {/* Avatar */}
                      {entry.user?.avatar_url ? (
                        <img
                          src={entry.user.avatar_url}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover mt-0.5"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary mt-0.5">
                          {entry.user?.full_name?.charAt(0)?.toUpperCase() ??
                            "?"}
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {entry.user?.full_name ?? "Utilisateur"}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeDate(entry.submitted_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {metricLabel(entry.metric_type)}
                          </span>
                          <span className="text-sm font-bold">
                            {Number(entry.metric_value).toLocaleString("fr-FR")}
                          </span>
                        </div>
                        {entry.proof_url && (
                          <a
                            href={entry.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            {entry.proof_url.match(
                              /\.(png|jpg|jpeg|gif|webp)/i,
                            ) ? (
                              <ImageIcon className="h-3 w-3" />
                            ) : (
                              <ExternalLink className="h-3 w-3" />
                            )}
                            Voir la preuve
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerify(entry.id)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          disabled={verifyEntry.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Valider
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(entry.id)}
                          className="text-destructive hover:bg-destructive/10"
                          disabled={verifyEntry.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Already reviewed */}
          {reviewedEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Deja verifiees ({reviewedEntries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reviewedEntries.slice(0, 20).map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "flex items-center gap-3 py-2 px-3 rounded-xl",
                        entry.verified ? "bg-emerald-50/50" : "bg-red-50/50",
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">
                            {entry.user?.full_name}
                          </span>{" "}
                          &middot; {metricLabel(entry.metric_type)} :{" "}
                          <span className="font-bold">
                            {Number(entry.metric_value).toLocaleString("fr-FR")}
                          </span>
                        </p>
                      </div>
                      {entry.verified ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Verifie
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          <XCircle className="h-3.5 w-3.5" />
                          Rejete
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
