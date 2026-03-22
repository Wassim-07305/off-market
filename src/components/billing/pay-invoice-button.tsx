"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PayInvoiceButtonProps {
  invoiceId: string;
  amount: number;
  disabled?: boolean;
  className?: string;
}

const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function PayInvoiceButton({
  invoiceId,
  amount,
  disabled = false,
  className,
}: PayInvoiceButtonProps) {
  const checkout = useStripeCheckout();

  if (!isStripeConfigured) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Paiement non configuré
      </p>
    );
  }

  return (
    <Button
      onClick={() => checkout.mutate({ invoiceId })}
      disabled={disabled || checkout.isPending}
      className={className}
      size="sm"
    >
      {checkout.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      Payer {formatCurrency(amount)}
    </Button>
  );
}
