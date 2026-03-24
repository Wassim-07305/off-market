import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { withErrorLogging } from "@/lib/error-logger-server";

/**
 * Cron endpoint pour les relances de paiement.
 *
 * 1. Met a jour le statut des factures "sent" depassees → "overdue"
 * 2. Cree des rappels dans payment_reminders aux paliers J+7, J+14, J+21
 * 3. Envoie un email de relance pour chaque rappel cree
 *
 * Vercel Cron : GET /api/cron/payment-reminders
 * Header: Authorization: Bearer <CRON_SECRET>
 */

interface ReminderLevel {
  days: number;
  type: string;
  subject: string;
  severity: "info" | "warning" | "urgent";
}

const REMINDER_LEVELS: ReminderLevel[] = [
  {
    days: 7,
    type: "j+7",
    subject: "Rappel de paiement — Facture en retard",
    severity: "info",
  },
  {
    days: 14,
    type: "j+14",
    subject: "2eme rappel — Facture en retard depuis 14 jours",
    severity: "warning",
  },
  {
    days: 21,
    type: "j+21",
    subject: "Relance finale — Facture en retard depuis 21 jours",
    severity: "urgent",
  },
];

async function handler(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const now = new Date();
    const todayISO = now.toISOString().split("T")[0];

    // ── 1. Mettre a jour les factures "sent" en retard → "overdue" ──
    const { data: overdueInvoices, error: overdueError } = await supabase
      .from("invoices")
      .update({ status: "overdue" })
      .eq("status", "sent")
      .lt("due_date", todayISO)
      .not("due_date", "is", null)
      .select("id, invoice_number");

    if (overdueError) {
      console.error(
        "[payment-reminders] Erreur mise à jour overdue:",
        overdueError,
      );
    }

    const markedOverdue = overdueInvoices?.length ?? 0;

    if (markedOverdue > 0) {
      console.error(
        `[payment-reminders] ${markedOverdue} facture(s) passee(s) en "overdue"`,
      );
    }

    // ── 2. Chercher toutes les factures en retard (sent ou overdue avec date depassee) ──
    const { data: unpaidInvoices, error: unpaidError } = await supabase
      .from("invoices")
      .select(
        "id, invoice_number, client_id, total, due_date, status, client:profiles!invoices_client_id_fkey(id, full_name, email)",
      )
      .in("status", ["sent", "overdue"])
      .lt("due_date", todayISO)
      .not("due_date", "is", null);

    if (unpaidError) {
      console.error(
        "[payment-reminders] Erreur lecture factures impayees:",
        unpaidError,
      );
      return NextResponse.json(
        { error: "Erreur lors de la lecture des factures" },
        { status: 500 },
      );
    }

    const remindersCreated: string[] = [];
    const emailsSent: string[] = [];
    const errors: string[] = [];

    for (const invoice of unpaidInvoices ?? []) {
      const dueDate = new Date(invoice.due_date!);
      const daysSinceDue = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      const client = invoice.client as unknown as {
        id: string;
        full_name: string;
        email: string;
      } | null;

      for (const level of REMINDER_LEVELS) {
        if (daysSinceDue < level.days) continue;

        // Verifier si le reminder pour ce niveau a deja ete cree
        const { data: existingReminder } = await supabase
          .from("payment_reminders")
          .select("id")
          .eq("invoice_id", invoice.id)
          .eq("reminder_type", level.type)
          .limit(1)
          .maybeSingle();

        if (existingReminder) continue; // Deja envoye pour ce niveau

        // ── Creer le reminder en DB ──
        const { error: insertError } = await supabase
          .from("payment_reminders")
          .insert({
            invoice_id: invoice.id,
            reminder_type: level.type,
            scheduled_at: now.toISOString(),
            sent_at: now.toISOString(),
          });

        if (insertError) {
          errors.push(
            `Reminder ${level.type} pour facture ${invoice.invoice_number}: ${insertError.message}`,
          );
          continue;
        }

        remindersCreated.push(
          `${level.type} — ${invoice.invoice_number} (${client?.full_name ?? "Client inconnu"})`,
        );

        // ── Envoyer l'email de relance ──
        if (client?.email) {
          const emailResult = await sendEmail({
            to: client.email,
            subject: `${level.subject} — ${invoice.invoice_number}`,
            html: buildReminderEmail({
              clientName: client.full_name,
              invoiceNumber: invoice.invoice_number,
              total: Number(invoice.total),
              dueDate: invoice.due_date!,
              daysSinceDue,
              severity: level.severity,
            }),
          });

          if (emailResult.success) {
            emailsSent.push(
              `${level.type} → ${client.email} (${invoice.invoice_number})`,
            );
          } else {
            console.error(
              `[payment-reminders] Email echoue pour ${client.email}:`,
              emailResult.error,
            );
          }
        }
      }
    }

    return NextResponse.json({
      message: `${markedOverdue} facture(s) passee(s) en retard, ${remindersCreated.length} relance(s) creee(s), ${emailsSent.length} email(s) envoye(s)`,
      markedOverdue,
      remindersCreated,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[payment-reminders] Erreur fatale:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement des relances" },
      { status: 500 },
    );
  }
}

export const GET = withErrorLogging("/api/cron/payment-reminders", handler);

// ── Email HTML builder ──────────────────────────────

function buildReminderEmail(params: {
  clientName: string;
  invoiceNumber: string;
  total: number;
  dueDate: string;
  daysSinceDue: number;
  severity: "info" | "warning" | "urgent";
}): string {
  const { clientName, invoiceNumber, total, dueDate, daysSinceDue, severity } =
    params;

  const formattedTotal = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(total);

  const formattedDueDate = new Date(dueDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const severityColors = {
    info: { bg: "#EBF5FF", border: "#3B82F6", text: "#1E40AF" },
    warning: { bg: "#FFF7ED", border: "#F59E0B", text: "#92400E" },
    urgent: { bg: "#FEF2F2", border: "#EF4444", text: "#991B1B" },
  };

  const colors = severityColors[severity];

  const urgencyText =
    severity === "urgent"
      ? "Ceci est notre dernier rappel avant le transfert de votre dossier au service de recouvrement."
      : severity === "warning"
        ? "Nous vous prions de regulariser votre situation dans les plus brefs delais."
        : "Nous vous rappelons que cette facture est en attente de paiement.";

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#F9FAFB;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background:${colors.bg};border-left:4px solid ${colors.border};padding:24px;">
        <h1 style="margin:0;font-size:20px;color:${colors.text};">
          ${severity === "urgent" ? "Relance finale" : severity === "warning" ? "Deuxieme rappel" : "Rappel de paiement"}
        </h1>
      </div>

      <!-- Body -->
      <div style="padding:32px 24px;">
        <p style="margin:0 0 16px;color:#374151;font-size:15px;">
          Bonjour ${clientName},
        </p>

        <p style="margin:0 0 16px;color:#374151;font-size:15px;">
          ${urgencyText}
        </p>

        <div style="background:#F9FAFB;border-radius:8px;padding:20px;margin:24px 0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#6B7280;font-size:14px;">Facture</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827;font-size:14px;">${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6B7280;font-size:14px;">Montant TTC</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827;font-size:14px;">${formattedTotal}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6B7280;font-size:14px;">Echeance</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827;font-size:14px;">${formattedDueDate}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6B7280;font-size:14px;">Retard</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;color:${colors.text};font-size:14px;">${daysSinceDue} jour(s)</td>
            </tr>
          </table>
        </div>

        <p style="margin:0 0 8px;color:#374151;font-size:15px;">
          Si vous avez deja effectue le reglement, veuillez ne pas tenir compte de ce message.
        </p>

        <p style="margin:24px 0 0;color:#6B7280;font-size:13px;">
          Cordialement,<br/>
          L'équipe Off-Market
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
