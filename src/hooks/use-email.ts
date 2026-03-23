"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TemplateName } from "@/lib/email-templates";

interface SendEmailParams {
  to: string | string[];
  template: TemplateName;
  data: Record<string, unknown>;
}

export function useSendEmail() {
  return useMutation({
    mutationFn: async (params: SendEmailParams) => {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? `Erreur HTTP ${res.status}`);
      }

      return res.json() as Promise<{ success: boolean; id?: string }>;
    },
    onSuccess: () => {
      toast.success("Email envoyé avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'envoi de l'email");
    },
  });
}
