import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/send";
import { paymentReminderEmail } from "@/lib/email/templates";
import { dispatchWebhook } from "@/lib/webhooks";

// Cron job for billing tasks:
// 1. Mark overdue invoices
// 2. Send payment reminders
// 3. Generate recurring invoices from payment schedules

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://offmarket.app";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const results = {
    overdue_marked: 0,
    reminders_sent: 0,
    recurring_created: 0,
  };

  // ═══════════════════════════════════════
  // 1. Mark overdue invoices
  // ═══════════════════════════════════════
  const { data: overdueInvoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("status", "sent")
    .lt("due_date", today);

  if (overdueInvoices?.length) {
    const { count } = await supabase
      .from("invoices")
      .update({ status: "overdue" })
      .in("id", overdueInvoices.map((i) => i.id));

    results.overdue_marked = count ?? 0;
  }

  // ═══════════════════════════════════════
  // 2. Send payment reminders
  // ═══════════════════════════════════════
  const { data: pendingReminders } = await supabase
    .from("payment_reminders")
    .select("id, invoice_id, reminder_type, invoices(id, invoice_number, total, due_date, client_id)")
    .is("sent_at", null)
    .lte("scheduled_at", now)
    .limit(50);

  if (pendingReminders?.length) {
    for (const reminder of pendingReminders) {
      const invoice = reminder.invoices as unknown as {
        id: string;
        invoice_number: string;
        total: number;
        due_date: string;
        client_id: string;
      } | null;

      if (!invoice) continue;

      const { data: client } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", invoice.client_id)
        .single();

      if (client?.email) {
        const formatEUR = (n: number) =>
          new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
        const formatDate = (d: string) =>
          new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

        try {
          // Calculate days overdue from reminder type (j-3, j0, j+3, j+7, j+14)
          const daysMatch = reminder.reminder_type.match(/j([+-]?\d+)/);
          const daysOverdue = daysMatch ? parseInt(daysMatch[1]) : 0;

          const { subject, html } = paymentReminderEmail({
            clientName: client.full_name ?? "Client",
            invoiceNumber: invoice.invoice_number,
            amount: formatEUR(Number(invoice.total)),
            dueDate: formatDate(invoice.due_date),
            daysOverdue: Math.max(0, daysOverdue),
            payUrl: `${SITE_URL}/client/invoices`,
          });

          await sendEmail({ to: client.email, subject, html });

          await supabase
            .from("payment_reminders")
            .update({ sent_at: now })
            .eq("id", reminder.id);

          results.reminders_sent++;
        } catch (err) {
          console.error("Reminder send error:", err);
        }
      }
    }
  }

  // ═══════════════════════════════════════
  // 3. Generate recurring invoices from payment schedules
  // ═══════════════════════════════════════
  const { data: schedules } = await supabase
    .from("payment_schedules")
    .select("id, client_id, contract_id, total_amount, installments, frequency, installment_details")
    .eq("status", "active");

  if (schedules?.length) {
    for (const schedule of schedules) {
      const details = (schedule.installment_details ?? []) as Array<{
        index: number;
        amount: number;
        due_date: string;
        invoice_id: string | null;
        status: string;
      }>;

      // Find installments that are due today or past due but not yet invoiced
      const dueInstallments = details.filter(
        (d) => !d.invoice_id && d.status === "pending" && d.due_date <= today,
      );

      for (const installment of dueInstallments) {
        // Create invoice for this installment
        const { data: newInvoice, error: invError } = await supabase
          .from("invoices")
          .insert({
            client_id: schedule.client_id,
            contract_id: schedule.contract_id,
            amount: installment.amount,
            tax: 0,
            total: installment.amount,
            due_date: installment.due_date,
            status: "sent",
            notes: `Echeance ${installment.index + 1}/${details.length} — Echeancier ${schedule.id.slice(0, 8)}`,
          })
          .select("id, invoice_number")
          .single();

        if (invError || !newInvoice) continue;

        // Update the installment with the invoice ID
        installment.invoice_id = newInvoice.id;
        installment.status = "invoiced";

        await supabase
          .from("payment_schedules")
          .update({ installment_details: details })
          .eq("id", schedule.id);

        dispatchWebhook("invoice.created", {
          invoice_id: newInvoice.id,
          invoice_number: newInvoice.invoice_number,
          amount: installment.amount,
        }).catch(() => {});

        results.recurring_created++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    processed_at: now,
  });
}
