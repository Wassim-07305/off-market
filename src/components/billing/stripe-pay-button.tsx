"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StripePayButtonProps {
  invoiceId: string;
  amount: number;
  className?: string;
}

export function StripePayButton({
  invoiceId,
  amount,
  className,
}: StripePayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erreur de paiement");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors du paiement",
      );
      setIsLoading(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ""}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      {isLoading ? "Redirection..." : `Payer ${formattedAmount}`}
    </button>
  );
}
