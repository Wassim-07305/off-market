import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron endpoint pour la generation automatique de factures.
 * Cherche les contrats signes avec un échéancier de paiement actif
 * et généré les factures dues automatiquement.
 *
 * Vercel Cron : GET /api/cron/generate-invoices
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const now = new Date();
    const todayISO = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // ── 1. Chercher les contrats signes avec échéancier ────────
    const { data: schedules, error: schedulesError } = await supabase
      .from("payment_schedules")
      .select(
        "*, contract:contracts(id, title, client_id, amount, status, created_by)",
      )
      .not("contract_id", "is", null);

    if (schedulesError) {
      console.error("[generate-invoices] Erreur schedules:", schedulesError);
      return NextResponse.json(
        { error: "Erreur lors de la lecture des échéanciers" },
        { status: 500 },
      );
    }

    const created: string[] = [];
    const errors: string[] = [];

    for (const schedule of schedules ?? []) {
      const contract = schedule.contract as {
        id: string;
        title: string;
        client_id: string;
        amount: number | null;
        status: string;
        created_by: string | null;
      } | null;

      // Ne traiter que les contrats signes
      if (!contract || contract.status !== "signed") continue;

      const installments =
        (schedule.installment_details as Array<{
          index: number;
          amount: number;
          due_date: string;
          status: string;
          paid_at: string | null;
        }>) ?? [];

      for (const installment of installments) {
        // Ne generer que les echeances dues (date <= aujourd'hui) et non payees
        if (installment.status !== "pending") continue;
        if (installment.due_date > todayISO) continue;

        // Verifier qu'une facture n'existe pas deja pour ce contrat + cette echeance
        const { data: existingInvoice } = await supabase
          .from("invoices")
          .select("id")
          .eq("contract_id", contract.id)
          .eq("due_date", installment.due_date)
          .limit(1)
          .maybeSingle();

        if (existingInvoice) continue; // Deja facturee

        // ── Calculer la TVA (taux par defaut 20%) ──
        const taxRate = 0.2;
        const subtotal = installment.amount;
        const tax = Math.round(subtotal * taxRate * 100) / 100;
        const total = Math.round((subtotal + tax) * 100) / 100;

        // ── Creer la facture ──
        const { data: invoice, error: insertError } = await supabase
          .from("invoices")
          .insert({
            contract_id: contract.id,
            client_id: contract.client_id,
            invoice_number: "", // Le trigger DB généré le numéro
            amount: subtotal,
            tax,
            tax_rate: 20,
            total,
            discount: 0,
            line_items: [
              {
                description: `${contract.title} — Echeance ${installment.due_date}`,
                quantity: 1,
                unit_price: subtotal,
                total: subtotal,
              },
            ],
            status: "sent",
            due_date: installment.due_date,
            notes: `Facture auto-generee — Contrat: ${contract.title}`,
            created_by: contract.created_by,
          })
          .select("id, invoice_number")
          .single();

        if (insertError) {
          console.error(
            `[generate-invoices] Erreur insert (contrat ${contract.id}):`,
            insertError,
          );
          errors.push(
            `Contrat ${contract.id} echeance ${installment.due_date}: ${insertError.message}`,
          );
          continue;
        }

        created.push(
          `${invoice.invoice_number || invoice.id} (contrat: ${contract.title}, echeance: ${installment.due_date})`,
        );

        console.error(
          `[generate-invoices] Facture creee: ${invoice.invoice_number || invoice.id} pour contrat ${contract.id}`,
        );
      }
    }

    // ── 2. Chercher aussi les contrats signes SANS échéancier ──
    // mais avec un montant et une date de fin (facturation unique a la signature)
    // On ne genere une facture que si aucune n'existe encore pour ce contrat
    const { data: contractsWithoutSchedule } = await supabase
      .from("contracts")
      .select("id, title, client_id, amount, created_by")
      .eq("status", "signed")
      .not("amount", "is", null)
      .gt("amount", 0);

    for (const contract of contractsWithoutSchedule ?? []) {
      // Verifier s'il a un échéancier
      const { data: hasSchedule } = await supabase
        .from("payment_schedules")
        .select("id")
        .eq("contract_id", contract.id)
        .limit(1)
        .maybeSingle();

      if (hasSchedule) continue; // Traite par la boucle precedente

      // Verifier qu'aucune facture n'existe
      const { data: existingInvoice } = await supabase
        .from("invoices")
        .select("id")
        .eq("contract_id", contract.id)
        .limit(1)
        .maybeSingle();

      if (existingInvoice) continue;

      const subtotal = Number(contract.amount);
      const taxRate = 0.2;
      const tax = Math.round(subtotal * taxRate * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      // Echeance a 30 jours
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const dueDateISO = dueDate.toISOString().split("T")[0];

      const { data: invoice, error: insertError } = await supabase
        .from("invoices")
        .insert({
          contract_id: contract.id,
          client_id: contract.client_id,
          invoice_number: "",
          amount: subtotal,
          tax,
          tax_rate: 20,
          total,
          discount: 0,
          line_items: [
            {
              description: contract.title,
              quantity: 1,
              unit_price: subtotal,
              total: subtotal,
            },
          ],
          status: "sent",
          due_date: dueDateISO,
          notes: `Facture auto-generee — Contrat: ${contract.title}`,
          created_by: contract.created_by,
        })
        .select("id, invoice_number")
        .single();

      if (insertError) {
        errors.push(
          `Contrat sans échéancier ${contract.id}: ${insertError.message}`,
        );
        continue;
      }

      created.push(
        `${invoice.invoice_number || invoice.id} (contrat: ${contract.title}, facturation unique)`,
      );

      console.error(
        `[generate-invoices] Facture unique creee: ${invoice.invoice_number || invoice.id} pour contrat ${contract.id}`,
      );
    }

    return NextResponse.json({
      message: `${created.length} facture(s) generee(s)`,
      created,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[generate-invoices] Erreur fatale:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation des factures" },
      { status: 500 },
    );
  }
}
