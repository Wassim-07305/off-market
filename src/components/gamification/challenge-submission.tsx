"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Send, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { METRIC_TYPES } from "@/types/upsell";
import { cn } from "@/lib/utils";

const challengeEntrySchema = z.object({
  metric_type: z.string().min(1, "Selectionnez un type de metrique"),
  metric_value: z.coerce.number().min(0, "La valeur doit etre positive"),
  proof_url: z.string().url().optional().or(z.literal("")),
});

type ChallengeEntryFormData = z.infer<typeof challengeEntrySchema>;

interface ChallengeSubmissionProps {
  challengeId: string;
  challengeTitle?: string;
  onSubmitted?: () => void;
}

export function ChallengeSubmission({
  challengeId,
  challengeTitle,
  onSubmitted,
}: ChallengeSubmissionProps) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [proofFile, setProofFile] = useState<File | null>(null);

  const form = useForm<ChallengeEntryFormData>({
    resolver: zodResolver(challengeEntrySchema) as any,
    defaultValues: {
      metric_type: "",
      metric_value: 0,
      proof_url: "",
    },
  });

  const submitEntry = useMutation({
    mutationFn: async (data: ChallengeEntryFormData) => {
      if (!user) throw new Error("Non authentifie");

      let proofUrl = data.proof_url || null;

      // Upload proof file if provided
      if (proofFile) {
        const ext = proofFile.name.split(".").pop();
        const path = `challenge-proofs/${user.id}/${challengeId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await (supabase as any).storage
          .from("uploads")
          .upload(path, proofFile);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = (supabase as any).storage.from("uploads").getPublicUrl(path);
        proofUrl = publicUrl;
      }

      const { error } = await (supabase as any)
        .from("challenge_entries")
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          metric_type: data.metric_type,
          metric_value: data.metric_value,
          proof_url: proofUrl,
          submitted_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-entries"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-leaderboard"] });
      toast.success("Soumission enregistree !");
      form.reset();
      setProofFile(null);
      onSubmitted?.();
    },
    onError: () => {
      toast.error("Erreur lors de la soumission");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          Soumettre mes resultats
        </CardTitle>
        {challengeTitle && (
          <p className="text-sm text-muted-foreground">{challengeTitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((data) => submitEntry.mutate(data))}
          className="space-y-4"
        >
          {/* Metric type */}
          <div>
            <label className="text-sm font-medium">Type de metrique</label>
            <select
              {...form.register("metric_type")}
              className="w-full mt-1 rounded-xl border border-border px-3 py-2 text-sm bg-surface"
            >
              <option value="">Selectionnez...</option>
              {METRIC_TYPES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {form.formState.errors.metric_type && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.metric_type.message}
              </p>
            )}
          </div>

          {/* Metric value */}
          <div>
            <label className="text-sm font-medium">Valeur</label>
            <Input
              type="number"
              {...form.register("metric_value")}
              placeholder="0"
            />
            {form.formState.errors.metric_value && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.metric_value.message}
              </p>
            )}
          </div>

          {/* Proof */}
          <div>
            <label className="text-sm font-medium">Preuve (optionnel)</label>
            <p className="text-xs text-muted-foreground mb-2">
              Joignez une capture d&apos;ecran ou un lien comme preuve.
            </p>

            <div className="space-y-2">
              <Input
                {...form.register("proof_url")}
                placeholder="https://... (lien vers la preuve)"
              />

              <div className="text-xs text-muted-foreground text-center">
                ou
              </div>

              <label
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
                  proofFile
                    ? "border-primary/30 bg-primary/5"
                    : "border-border hover:border-primary/20",
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                />
                {proofFile ? (
                  <>
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary truncate">
                      {proofFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Telecharger une capture d&apos;ecran
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <Button
            type="submit"
            loading={submitEntry.isPending}
            className="w-full"
            icon={<Send className="h-4 w-4" />}
          >
            Soumettre
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
