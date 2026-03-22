import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import {
  callReminderEmail,
  paymentReminderEmail,
} from "@/lib/email-templates";

/**
 * Cron endpoint pour les rappels email automatiques.
 * - Rappels d'appels (24h avant)
 * - Relances de paiement (echeances depassees)
 *
 * Vercel Cron : GET avec Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const admin = createAdminClient();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const results: { type: string; sent: number; errors: number }[] = [];

    // ─── 1. Rappels d'appels (24h avant) ─────────────────────────
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find calls scheduled in the next 24h that haven't been reminded
      const { data: upcomingCalls } = await admin
        .from("call_calendar")
        .select(
          "id, scheduled_at, client_id, coach_id, profiles!call_calendar_client_id_fkey(full_name, email), coach:profiles!call_calendar_coach_id_fkey(full_name)",
        )
        .gte("scheduled_at", now.toISOString())
        .lte("scheduled_at", in24h.toISOString())
        .eq("status", "scheduled");

      let callsSent = 0;
      let callsErrors = 0;

      if (upcomingCalls) {
        for (const call of upcomingCalls) {
          const clientProfile = call.profiles as unknown as {
            full_name: string;
            email: string;
          } | null;
          const coachProfile = call.coach as unknown as {
            full_name: string;
          } | null;

          if (!clientProfile?.email) continue;

          const scheduledDate = new Date(call.scheduled_at);
          const dateStr = scheduledDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const timeStr = scheduledDate.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const { subject, html } = callReminderEmail(
            clientProfile.full_name || "Client",
            coachProfile?.full_name || "Votre coach",
            dateStr,
            timeStr,
            `${appUrl}/client/calls`,
          );

          const result = await sendEmail({
            to: clientProfile.email,
            subject,
            html,
          });

          if (result.success) {
            callsSent++;
          } else {
            callsErrors++;
          }
        }
      }

      results.push({
        type: "call-reminders",
        sent: callsSent,
        errors: callsErrors,
      });
    } catch (err) {
      console.error("[Cron Email] Erreur rappels appels:", err);
      results.push({ type: "call-reminders", sent: 0, errors: 1 });
    }

    // ─── 2. Relances de paiement ─────────────────────────────────
    try {
      const now = new Date();

      // Find overdue payment schedules
      const { data: overduePayments } = await admin
        .from("payment_schedules")
        .select(
          "id, due_date, amount, invoice_number, client_id, profiles!payment_schedules_client_id_fkey(full_name, email)",
        )
        .eq("status", "pending")
        .lt("due_date", now.toISOString().split("T")[0]);

      let paymentsSent = 0;
      let paymentsErrors = 0;

      if (overduePayments) {
        for (const payment of overduePayments) {
          const clientProfile = payment.profiles as unknown as {
            full_name: string;
            email: string;
          } | null;

          if (!clientProfile?.email) continue;

          const dueDate = new Date(payment.due_date);
          const daysOverdue = Math.floor(
            (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysOverdue <= 0) continue;

          const amount = new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
          }).format(payment.amount);

          const { subject, html } = paymentReminderEmail(
            clientProfile.full_name || "Client",
            payment.invoice_number || payment.id,
            amount,
            daysOverdue,
          );

          const result = await sendEmail({
            to: clientProfile.email,
            subject,
            html,
          });

          if (result.success) {
            paymentsSent++;
          } else {
            paymentsErrors++;
          }
        }
      }

      results.push({
        type: "payment-reminders",
        sent: paymentsSent,
        errors: paymentsErrors,
      });
    } catch (err) {
      console.error("[Cron Email] Erreur relances paiement:", err);
      results.push({ type: "payment-reminders", sent: 0, errors: 1 });
    }

    // ─── Result ──────────────────────────────────────────────────
    const totalSent = results.reduce((acc, r) => acc + r.sent, 0);
    const totalErrors = results.reduce((acc, r) => acc + r.errors, 0);

    return NextResponse.json({
      message: `${totalSent} email(s) envoye(s), ${totalErrors} erreur(s)`,
      results,
    });
  } catch (error) {
    console.error("[Cron Email Reminders] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi des rappels" },
      { status: 500 },
    );
  }
}
