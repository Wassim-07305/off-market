import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { withErrorLogging } from "@/lib/error-logger-server";
import type { Invoice, InvoiceLineItem } from "@/types/billing";

async function handler(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe n'est pas configuré" },
        { status: 503 },
      );
    }

    // ── Auth ──────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // ── Body ─────────────────────────────────────
    const body = await request.json();
    const { invoiceId, successUrl, cancelUrl } = body as {
      invoiceId: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (!invoiceId) {
      return NextResponse.json(
        { error: "invoiceId est requis" },
        { status: 400 },
      );
    }

    // ── Fetch invoice ────────────────────────────
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, client:profiles!invoices_client_id_fkey(id, full_name, email)")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Facture introuvable" },
        { status: 404 },
      );
    }

    const inv = invoice as Invoice & {
      client?: { id: string; full_name: string; email: string };
    };

    if (inv.status === "paid") {
      return NextResponse.json(
        { error: "Cette facture est déjà payée" },
        { status: 400 },
      );
    }

    // ── Build line items ─────────────────────────
    const lineItems: { description: string; quantity: number; unit_price: number }[] =
      Array.isArray(inv.line_items) && inv.line_items.length > 0
        ? (inv.line_items as InvoiceLineItem[])
        : [
            {
              description: `Facture ${inv.invoice_number}`,
              quantity: 1,
              unit_price: inv.total,
            },
          ];

    const stripeLineItems = lineItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.description,
        },
        unit_amount: Math.round(item.unit_price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // ── Create checkout session ──────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: inv.client?.email ?? undefined,
      line_items: stripeLineItems,
      metadata: {
        invoice_id: inv.id,
        invoice_number: inv.invoice_number,
        client_id: inv.client_id,
      },
      success_url: successUrl || `${appUrl}/client/billing?success=1`,
      cancel_url: cancelUrl || `${appUrl}/client/billing?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Checkout]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 },
    );
  }
}

export const POST = withErrorLogging("/api/stripe/checkout", handler);
