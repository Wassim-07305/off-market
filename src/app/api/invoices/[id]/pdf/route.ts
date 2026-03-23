import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Fetch invoice with client info
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  // Check access: admin sees all, client sees only their own
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profile?.role !== "admin" &&
    profile?.role !== "coach" &&
    invoice.client_id !== user.id
  ) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  // Get client name
  let clientName = "Client";
  if (invoice.client_id) {
    const { data: client } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", invoice.client_id)
      .single();
    if (client) clientName = client.full_name ?? client.email ?? "Client";
  }

  // Parse line items — fallback to invoice title/description if empty
  let lineItems = Array.isArray(invoice.line_items)
    ? (invoice.line_items as { description: string; quantity: number; unit_price: number; total: number }[])
    : [];

  if (lineItems.length === 0) {
    lineItems = [{
      description: invoice.title || invoice.description || "Prestation de service",
      quantity: 1,
      unit_price: Number(invoice.amount ?? invoice.total ?? 0),
      total: Number(invoice.total ?? 0),
    }];
  }

  const formatEUR = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

  const statusLabels: Record<string, string> = {
    draft: "Brouillon",
    sent: "Envoyee",
    paid: "Payee",
    overdue: "En retard",
    cancelled: "Annulee",
    partial: "Partiel",
    refunded: "Remboursee",
  };

  // Generate HTML invoice
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>Facture ${invoice.invoice_number ?? id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #DC2626; padding-bottom: 20px; }
    .brand { font-size: 24px; font-weight: 700; color: #DC2626; }
    .brand-sub { font-size: 12px; color: #666; margin-top: 4px; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 20px; font-weight: 700; }
    .invoice-date { font-size: 13px; color: #666; margin-top: 4px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-sent { background: #fef3c7; color: #92400e; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .status-draft { background: #f3f4f6; color: #4b5563; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .party { flex: 1; }
    .party-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 6px; }
    .party-name { font-size: 16px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    thead th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; padding: 10px 12px; border-bottom: 2px solid #e5e7eb; }
    tbody td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    tbody td:last-child, thead th:last-child { text-align: right; }
    tbody td:nth-child(2), tbody td:nth-child(3), thead th:nth-child(2), thead th:nth-child(3) { text-align: center; }
    .totals { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .total-row.final { border-top: 2px solid #1a1a1a; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 700; }
    .notes { margin-top: 30px; padding: 16px; background: #f9fafb; border-radius: 8px; font-size: 13px; color: #666; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Off Market</div>
      <div class="brand-sub">Plateforme de coaching</div>
    </div>
    <div class="invoice-info">
      <div class="invoice-number">${invoice.invoice_number ?? "FACTURE"}</div>
      <div class="invoice-date">Date : ${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString("fr-FR") : "-"}</div>
      ${invoice.due_date ? `<div class="invoice-date">Echeance : ${new Date(invoice.due_date).toLocaleDateString("fr-FR")}</div>` : ""}
      <span class="status status-${invoice.status ?? "draft"}">${statusLabels[invoice.status] ?? invoice.status}</span>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-label">Emetteur</div>
      <div class="party-name">Off Market</div>
    </div>
    <div class="party" style="text-align: right;">
      <div class="party-label">Client</div>
      <div class="party-name">${clientName}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantite</th>
        <th>Prix unitaire</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${
        lineItems.length > 0
          ? lineItems
              .map(
                (item) => `<tr>
                <td>${item.description ?? "-"}</td>
                <td>${item.quantity ?? 1}</td>
                <td>${formatEUR(Number(item.unit_price ?? 0))}</td>
                <td>${formatEUR(Number(item.total ?? 0))}</td>
              </tr>`,
              )
              .join("")
          : `<tr><td colspan="4" style="text-align:center;color:#999;">-</td></tr>`
      }
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>Sous-total HT</span><span>${formatEUR(Number(invoice.amount ?? 0))}</span></div>
    ${Number(invoice.discount ?? 0) > 0 ? `<div class="total-row"><span>Remise</span><span>-${formatEUR(Number(invoice.discount))}</span></div>` : ""}
    ${Number(invoice.tax ?? 0) > 0 ? `<div class="total-row"><span>TVA</span><span>${formatEUR(Number(invoice.tax))}</span></div>` : ""}
    <div class="total-row final"><span>Total TTC</span><span>${formatEUR(Number(invoice.total ?? 0))}</span></div>
  </div>

  ${invoice.notes ? `<div class="notes"><strong>Notes :</strong> ${invoice.notes}</div>` : ""}

  <div class="footer">
    Off Market — Facture generee automatiquement le ${new Date().toLocaleDateString("fr-FR")}
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="facture-${invoice.invoice_number ?? id}.html"`,
    },
  });
}
