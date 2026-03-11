import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/send";
import { paymentConfirmedEmail } from "@/lib/email/templates";

// Use service role for webhook (no user session)
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeServer().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoiceId = session.metadata?.invoice_id;

      if (invoiceId && session.payment_status === "paid") {
        const now = new Date().toISOString();
        await supabase
          .from("invoices")
          .update({
            status: "paid",
            paid_at: now,
            stripe_payment_intent_id: session.payment_intent as string,
            payment_method: "stripe",
          })
          .eq("id", invoiceId);

        // Send payment confirmation email
        const { data: invoice } = await supabase
          .from("invoices")
          .select("invoice_number, total, client_id")
          .eq("id", invoiceId)
          .single();

        if (invoice) {
          const { data: client } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", invoice.client_id)
            .single();

          if (client?.email) {
            const appUrl =
              process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
            const formatEUR = (n: number) =>
              new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(n);
            const formatDate = (d: string) =>
              new Date(d).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

            const { subject, html } = paymentConfirmedEmail({
              clientName: client.full_name ?? "Client",
              invoiceNumber: invoice.invoice_number,
              amount: formatEUR(Number(invoice.total)),
              paidDate: formatDate(now),
              dashboardUrl: `${appUrl}/client/invoices`,
            });
            await sendEmail({ to: client.email, subject, html });
          }
        }
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoiceId = session.metadata?.invoice_id;

      if (invoiceId) {
        // Clear the checkout session ID so user can retry
        await supabase
          .from("invoices")
          .update({ stripe_checkout_session_id: null })
          .eq("id", invoiceId);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.error(
        `Payment failed for intent ${intent.id}:`,
        intent.last_payment_error?.message,
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
