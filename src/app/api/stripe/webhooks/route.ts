import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

// Disable Next.js body parsing — Stripe needs the raw body for signature verification
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe n'est pas configuré" },
        { status: 503 },
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET manquant");
      return NextResponse.json(
        { error: "Webhook non configuré" },
        { status: 500 },
      );
    }

    // ── Verify signature ─────────────────────────
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Signature Stripe manquante" },
        { status: 400 },
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signature invalide";
      console.error("[Stripe Webhook] Signature invalide:", message);
      return NextResponse.json(
        { error: `Signature invalide: ${message}` },
        { status: 400 },
      );
    }

    // ── Handle events ────────────────────────────
    const supabase = createAdminClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = session.metadata?.invoice_id;

        if (invoiceId) {
          const { error } = await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_invoice_id: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq("id", invoiceId);

          if (error) {
            console.error(
              "[Stripe Webhook] Erreur mise à jour facture:",
              error.message,
            );
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(
          "[Stripe Webhook] Paiement échoué:",
          paymentIntent.id,
          paymentIntent.last_payment_error?.message,
        );

        // If we have an invoice ID in metadata, mark it
        const failedInvoiceId = paymentIntent.metadata?.invoice_id;
        if (failedInvoiceId) {
          await supabase
            .from("invoices")
            .update({
              updated_at: new Date().toISOString(),
            })
            .eq("id", failedInvoiceId);
        }
        break;
      }

      default:
        // Event non géré — on log pour debug
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur interne du webhook" },
      { status: 500 },
    );
  }
}
