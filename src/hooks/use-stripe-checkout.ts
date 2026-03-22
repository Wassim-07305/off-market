"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface CheckoutParams {
  invoiceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export function useStripeCheckout() {
  return useMutation({
    mutationFn: async ({ invoiceId, successUrl, cancelUrl }: CheckoutParams) => {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, successUrl, cancelUrl }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors du paiement");
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error("URL de paiement manquante");
      }

      // Redirect to Stripe Checkout
      window.location.href = url;

      return { url };
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la redirection vers le paiement");
    },
  });
}

export function useStripePortal() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de l'accès au portail");
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error("URL du portail manquante");
      }

      window.location.href = url;

      return { url };
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'accès au portail de paiement");
    },
  });
}
