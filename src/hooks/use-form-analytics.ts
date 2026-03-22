"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

interface FormAnalytics {
  totalSubmissions: number;
  submissionsThisWeek: number;
  averageRating: number | null;
  npsScore: number | null;
  npsBreakdown: { promoters: number; passives: number; detractors: number };
  criticalAlerts: CriticalAlert[];
  fieldSummaries: Record<string, FieldSummary>;
}

interface CriticalAlert {
  id: string;
  formId: string;
  formTitle: string;
  respondentName: string;
  respondentEmail: string;
  npsScore: number;
  submittedAt: string;
  answers: Record<string, unknown>;
}

interface FieldSummary {
  fieldLabel: string;
  fieldType: string;
  totalResponses: number;
  // For rating/NPS fields
  average?: number;
  distribution?: Record<string, number>;
  // For select/checkbox fields
  optionCounts?: Record<string, number>;
  // For text fields
  responseCount?: number;
}

export function useFormAnalytics(formId: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["form-analytics", formId],
    enabled: !!user && !!formId,
    queryFn: async () => {
      // Fetch form with fields
      const { data: form, error: formError } = await supabase
        .from("forms")
        .select("*, form_fields(*)")
        .eq("id", formId)
        .single();
      if (formError) throw formError;

      // Fetch all submissions
      const { data: submissions, error: subError } = await supabase
        .from("form_submissions")
        .select(
          "*, respondent:profiles!form_submissions_respondent_id_fkey(full_name, email)",
        )
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false })
        .returns<Array<{ id: string; submitted_at: string; answers: Record<string, unknown>; respondent: { full_name: string; email: string } | null }>>();
      if (subError) throw subError;

      const allSubs = submissions ?? [];
      const fields = (form as any).form_fields ?? [];

      // Calculate week boundary
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const submissionsThisWeek = allSubs.filter(
        (s) => new Date(s.submitted_at) >= weekAgo,
      ).length;

      // Build field summaries
      const fieldSummaries: Record<string, FieldSummary> = {};
      const criticalAlerts: CriticalAlert[] = [];

      for (const field of fields) {
        const summary: FieldSummary = {
          fieldLabel: field.label,
          fieldType: field.field_type,
          totalResponses: 0,
        };

        const values: unknown[] = [];
        for (const sub of allSubs) {
          const answers = sub.answers as Record<string, unknown>;
          const val = answers?.[field.id] ?? answers?.[field.label];
          if (val !== undefined && val !== null && val !== "") {
            values.push(val);
            summary.totalResponses++;
          }
        }

        if (field.field_type === "rating" || field.field_type === "nps") {
          const nums = values.map(Number).filter((n) => !isNaN(n));
          if (nums.length > 0) {
            summary.average =
              Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) /
              10;
            summary.distribution = {};
            for (const n of nums) {
              const key = String(n);
              summary.distribution[key] = (summary.distribution[key] ?? 0) + 1;
            }
          }

          // Check for critical NPS alerts (score < 5)
          if (field.field_type === "nps") {
            for (const sub of allSubs) {
              const answers = sub.answers as Record<string, unknown>;
              const val = Number(answers?.[field.id] ?? answers?.[field.label]);
              if (!isNaN(val) && val < 5) {
                const respondent = sub.respondent as any;
                criticalAlerts.push({
                  id: sub.id,
                  formId,
                  formTitle: (form as any).title,
                  respondentName: respondent?.full_name ?? "Anonyme",
                  respondentEmail: respondent?.email ?? "",
                  npsScore: val,
                  submittedAt: sub.submitted_at,
                  answers: answers,
                });
              }
            }
          }
        } else if (
          field.field_type === "select" ||
          field.field_type === "checkbox"
        ) {
          summary.optionCounts = {};
          for (const val of values) {
            if (Array.isArray(val)) {
              for (const v of val) {
                summary.optionCounts[String(v)] =
                  (summary.optionCounts[String(v)] ?? 0) + 1;
              }
            } else {
              summary.optionCounts[String(val)] =
                (summary.optionCounts[String(val)] ?? 0) + 1;
            }
          }
        } else {
          summary.responseCount = values.length;
        }

        fieldSummaries[field.id] = summary;
      }

      // Calculate NPS score
      let npsScore: number | null = null;
      const npsBreakdown = { promoters: 0, passives: 0, detractors: 0 };
      const npsField = fields.find((f: any) => f.field_type === "nps");
      if (npsField) {
        const npsValues: number[] = [];
        for (const sub of allSubs) {
          const answers = sub.answers as Record<string, unknown>;
          const val = Number(
            answers?.[npsField.id] ?? answers?.[npsField.label],
          );
          if (!isNaN(val)) npsValues.push(val);
        }
        if (npsValues.length > 0) {
          for (const v of npsValues) {
            if (v >= 9) npsBreakdown.promoters++;
            else if (v >= 7) npsBreakdown.passives++;
            else npsBreakdown.detractors++;
          }
          npsScore = Math.round(
            ((npsBreakdown.promoters - npsBreakdown.detractors) /
              npsValues.length) *
              100,
          );
        }
      }

      // Calculate average rating
      let averageRating: number | null = null;
      const ratingField = fields.find((f: any) => f.field_type === "rating");
      if (ratingField) {
        const ratingValues: number[] = [];
        for (const sub of allSubs) {
          const answers = sub.answers as Record<string, unknown>;
          const val = Number(
            answers?.[ratingField.id] ?? answers?.[ratingField.label],
          );
          if (!isNaN(val)) ratingValues.push(val);
        }
        if (ratingValues.length > 0) {
          averageRating =
            Math.round(
              (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) *
                10,
            ) / 10;
        }
      }

      const analytics: FormAnalytics = {
        totalSubmissions: allSubs.length,
        submissionsThisWeek,
        averageRating,
        npsScore,
        npsBreakdown,
        criticalAlerts: criticalAlerts.sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime(),
        ),
        fieldSummaries,
      };

      return analytics;
    },
  });
}

// Hook to get all critical NPS alerts across all forms
export function useNpsAlerts() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["nps-alerts"],
    enabled: !!user,
    queryFn: async () => {
      // Get all forms that have NPS fields
      const { data: forms } = await supabase
        .from("forms")
        .select("id, title, form_fields(id, field_type, label)")
        .eq("status", "active");

      const alerts: CriticalAlert[] = [];

      for (const form of (forms ?? []) as any[]) {
        const npsFields = (form.form_fields ?? []).filter(
          (f: any) => f.field_type === "nps",
        );
        if (npsFields.length === 0) continue;

        const { data: submissions } = await supabase
          .from("form_submissions")
          .select(
            "*, respondent:profiles!form_submissions_respondent_id_fkey(full_name, email)",
          )
          .eq("form_id", form.id)
          .order("submitted_at", { ascending: false })
          .limit(100);

        for (const sub of (submissions ?? []) as any[]) {
          const answers = sub.answers as Record<string, unknown>;
          for (const npsField of npsFields) {
            const val = Number(
              answers?.[npsField.id] ?? answers?.[npsField.label],
            );
            if (!isNaN(val) && val < 5) {
              alerts.push({
                id: sub.id,
                formId: form.id,
                formTitle: form.title,
                respondentName: sub.respondent?.full_name ?? "Anonyme",
                respondentEmail: sub.respondent?.email ?? "",
                npsScore: val,
                submittedAt: sub.submitted_at,
                answers,
              });
            }
          }
        }
      }

      return alerts.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      );
    },
  });
}
