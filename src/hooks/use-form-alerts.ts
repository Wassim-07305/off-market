"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

/**
 * Hook to check form submissions for critical NPS/rating scores
 * and create alert notifications for the form owner.
 */
export function useNpsCriticalAlerts() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      formId,
      answers,
      respondentName,
    }: {
      formId: string;
      answers: Record<string, unknown>;
      respondentName?: string;
    }) => {
      if (!user) return null;

      // Fetch the form with its fields
      const { data: form } = await supabase
        .from("forms")
        .select("id, title, created_by, form_fields(id, field_type, label)")
        .eq("id", formId)
        .single();

      if (!form) return null;

      const fields = (form as Record<string, unknown>).form_fields as Array<{
        id: string;
        field_type: string;
        label: string;
      }>;
      if (!fields) return null;

      const alerts: Array<{
        fieldLabel: string;
        score: number;
        type: "nps" | "rating";
      }> = [];

      for (const field of fields) {
        const value = Number(answers[field.id] ?? answers[field.label]);
        if (isNaN(value)) continue;

        // NPS < 5 is critical
        if (field.field_type === "nps" && value < 5) {
          alerts.push({
            fieldLabel: field.label,
            score: value,
            type: "nps",
          });
        }

        // Rating < 3 is critical (out of 5)
        if (field.field_type === "rating" && value < 3) {
          alerts.push({
            fieldLabel: field.label,
            score: value,
            type: "rating",
          });
        }
      }

      if (alerts.length === 0) return null;

      // Create notification for the form owner
      const ownerId = (form as Record<string, unknown>).created_by as string;
      const formTitle = (form as Record<string, unknown>).title as string;

      const bestAlert = alerts.reduce((worst, current) =>
        current.type === "nps"
          ? current.score < worst.score
            ? current
            : worst
          : current,
      );

      const displayName = respondentName || "Un participant";
      const scoreText =
        bestAlert.type === "nps"
          ? `NPS ${bestAlert.score}/10`
          : `${bestAlert.score}/5`;

      const { error } = await supabase.from("notifications").insert({
        recipient_id: ownerId,
        type: "alert_nps",
        title: `Alerte : score critique sur "${formTitle}"`,
        body: `${displayName} a donne un score de ${scoreText} sur "${bestAlert.fieldLabel}". Action recommandee.`,
        category: "general",
        data: {
          form_id: formId,
          alerts,
          respondent_name: respondentName,
        },
        action_url: `/admin/forms/${formId}`,
      });

      if (error) {
        console.error("Failed to create NPS alert notification:", error);
      }

      return { alertCount: alerts.length };
    },
    onSuccess: (result) => {
      if (result && result.alertCount > 0) {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["nps-alerts"] });
      }
    },
  });
}

/**
 * Hook that wraps form submission to automatically check for critical scores.
 * Use this after a successful form submission.
 */
export function useFormSubmissionWebhook() {
  const npsCriticalAlerts = useNpsCriticalAlerts();

  const checkSubmission = async ({
    formId,
    answers,
    respondentName,
  }: {
    formId: string;
    answers: Record<string, unknown>;
    respondentName?: string;
  }) => {
    await npsCriticalAlerts.mutateAsync({
      formId,
      answers,
      respondentName,
    });
  };

  return { checkSubmission, isPending: npsCriticalAlerts.isPending };
}
