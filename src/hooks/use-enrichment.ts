"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatResetTime } from "@/lib/rate-limiter";

type EnrichmentType =
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "website"
  | "all";

interface EnrichmentResult {
  success: boolean;
  enrichment_data: Record<string, unknown>;
  error?: string;
  reset_at?: string;
}

const ENRICHMENT_LABELS: Record<EnrichmentType, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  website: "Site web",
  all: "toutes les plateformes",
};

export function useBulkEnrich() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      contacts: Array<{
        id: string;
        linkedin_url?: string | null;
        instagram_url?: string | null;
        tiktok_url?: string | null;
        facebook_url?: string | null;
        website_url?: string | null;
      }>,
    ) => {
      // Filter contacts that have at least one URL
      const enrichable = contacts.filter(
        (c) =>
          c.linkedin_url ||
          c.instagram_url ||
          c.tiktok_url ||
          c.facebook_url ||
          c.website_url,
      );

      // Run enrichment sequentially to avoid overwhelming the API
      const results = [];
      for (const contact of enrichable) {
        try {
          const res = await fetch("/api/enrichment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contactId: contact.id, type: "all" }),
          });

          // Handle rate limit
          if (res.status === 429) {
            const data = await res.json();
            const resetTime = data.reset_at
              ? formatResetTime(data.reset_at)
              : "";
            toast.error(`Limite atteinte. Reessayez a ${resetTime}.`);
            // Stop processing remaining contacts
            break;
          }

          results.push({ id: contact.id, success: res.ok });
        } catch {
          results.push({ id: contact.id, success: false });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["rate-limit-status"] });
      const successCount = results.filter((r) => r.success).length;
      toast.success(`${successCount}/${results.length} contacts enrichis`);
    },
    onError: () => {
      toast.error("Erreur lors de l'enrichissement en masse");
    },
  });
}

export function useEnrichContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      type,
    }: {
      contactId: string;
      type: EnrichmentType;
    }) => {
      const res = await fetch("/api/enrichment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, type }),
      });

      const data = (await res.json()) as EnrichmentResult;

      if (res.status === 429) {
        const resetTime = data.reset_at ? formatResetTime(data.reset_at) : "";
        throw new Error(`Limite atteinte. Reessayez a ${resetTime}.`);
      }

      if (!res.ok) throw new Error(data.error || "Erreur enrichissement");
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      queryClient.invalidateQueries({
        queryKey: ["contact-interactions", variables.contactId],
      });
      queryClient.invalidateQueries({ queryKey: ["rate-limit-status"] });

      const label = ENRICHMENT_LABELS[variables.type];
      toast.success(`Enrichissement ${label} terminé`);
    },
    onError: (err: Error) => {
      toast.error(`Enrichissement echoue: ${err.message}`);
    },
  });
}
