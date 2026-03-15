import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/stripe/refund — Initiate a refund (admin only)
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Admin requis" }, { status: 403 });

  const { invoiceId, amount, reason } = await request.json();

  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId requis" }, { status: 400 });
  }

  // Fetch the invoice
  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .select("id, total, status, stripe_payment_intent_id, invoice_number")
    .eq("id", invoiceId)
    .single();

  if (invError || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  if (invoice.status !== "paid") {
    return NextResponse.json(
      { error: "Seules les factures payees peuvent etre remboursees" },
      { status: 400 },
    );
  }

  if (!invoice.stripe_payment_intent_id) {
    return NextResponse.json(
      { error: "Pas de paiement Stripe associe a cette facture" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripeServer();
    const refundAmount = amount ? Math.round(Number(amount) * 100) : undefined; // undefined = full refund

    const refund = await stripe.refunds.create({
      payment_intent: invoice.stripe_payment_intent_id,
      amount: refundAmount,
      reason:
        reason === "duplicate"
          ? "duplicate"
          : reason === "fraud"
            ? "fraudulent"
            : "requested_by_customer",
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
      },
    });

    // Update invoice status
    const isPartial =
      refundAmount && refundAmount < Math.round(Number(invoice.total) * 100);
    await supabase
      .from("invoices")
      .update({
        status: isPartial ? "paid" : "cancelled",
        notes: isPartial
          ? `Remboursement partiel de ${(refundAmount / 100).toFixed(2)} EUR (${refund.id})`
          : `Rembourse integralement (${refund.id})`,
      })
      .eq("id", invoiceId);

    return NextResponse.json({
      refund_id: refund.id,
      amount: (refund.amount ?? 0) / 100,
      status: refund.status,
      partial: isPartial ?? false,
    });
  } catch (error) {
    console.error("Stripe refund error:", error);
    return NextResponse.json(
      { error: "Erreur lors du remboursement" },
      { status: 500 },
    );
  }
}
