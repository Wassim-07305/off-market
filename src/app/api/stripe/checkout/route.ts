import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { invoiceId } = await req.json();
    if (!invoiceId) {
      return NextResponse.json({ error: "ID facture requis" }, { status: 400 });
    }

    // Fetch the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, client:profiles!invoices_client_id_fkey(id, full_name, email, stripe_customer_id)")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    // Only allow payment on sent/overdue invoices
    if (!["sent", "overdue"].includes(invoice.status)) {
      return NextResponse.json(
        { error: "Cette facture ne peut pas etre payee" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId = invoice.client?.stripe_customer_id;
    if (!customerId) {
      const customer = await getStripeServer().customers.create({
        email: invoice.client?.email ?? user.email ?? "",
        name: invoice.client?.full_name ?? "",
        metadata: { supabase_id: invoice.client_id },
      });
      customerId = customer.id;

      // Save Stripe customer ID
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", invoice.client_id);
    }

    // Build the origin URL
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Create Checkout Session
    const session = await getStripeServer().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Facture ${invoice.invoice_number}`,
              description: invoice.notes ?? undefined,
            },
            unit_amount: Math.round(Number(invoice.total) * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/client/invoices?payment=success&invoice=${invoice.invoice_number}`,
      cancel_url: `${origin}/client/invoices?payment=cancelled`,
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
      },
    });

    // Store the checkout session ID
    await supabase
      .from("invoices")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", invoice.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la creation du paiement" },
      { status: 500 }
    );
  }
}
