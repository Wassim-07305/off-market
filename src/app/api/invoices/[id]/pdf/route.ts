import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Minimal PDF generator — no external dependency
// Produces a valid PDF 1.4 document with invoice details

function escapePDF(str: string) {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function generateInvoicePDF(invoice: {
  invoice_number: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  notes: string | null;
  client: { full_name: string; email: string } | null;
}): Buffer {
  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatEUR = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(n);

  const statusLabels: Record<string, string> = {
    draft: "Brouillon",
    sent: "En attente",
    paid: "Payee",
    overdue: "En retard",
    cancelled: "Annulee",
  };

  const clientName = escapePDF(invoice.client?.full_name ?? "Client");
  const clientEmail = escapePDF(invoice.client?.email ?? "");
  const invoiceNum = escapePDF(invoice.invoice_number);
  const dateCreated = escapePDF(formatDate(invoice.created_at));
  const dateDue = escapePDF(formatDate(invoice.due_date));
  const datePaid = invoice.paid_at
    ? escapePDF(formatDate(invoice.paid_at))
    : null;
  const status = escapePDF(statusLabels[invoice.status] ?? invoice.status);
  const amountHT = escapePDF(formatEUR(Number(invoice.amount)));
  const taxAmount = escapePDF(formatEUR(Number(invoice.tax)));
  const totalTTC = escapePDF(formatEUR(Number(invoice.total)));
  const taxRate =
    Number(invoice.amount) > 0
      ? ((Number(invoice.tax) / Number(invoice.amount)) * 100).toFixed(1)
      : "0";
  const notes = invoice.notes ? escapePDF(invoice.notes) : null;

  // Build PDF content streams
  const headerStream = `
BT
/F1 24 Tf
50 780 Td
(OFF-MARKET) Tj
/F2 10 Tf
0 -18 Td
(Plateforme de Coaching & Gestion Business) Tj
ET
`;

  const invoiceInfoStream = `
BT
/F1 16 Tf
50 720 Td
(FACTURE ${invoiceNum}) Tj
/F2 10 Tf
0 -25 Td
(Date d'emission : ${dateCreated}) Tj
0 -15 Td
(Date d'echeance : ${dateDue}) Tj
0 -15 Td
(Statut : ${status}) Tj
${datePaid ? `0 -15 Td\n(Payee le : ${datePaid}) Tj` : ""}
ET
`;

  const clientInfoStream = `
BT
/F1 12 Tf
350 720 Td
(FACTURER A) Tj
/F2 10 Tf
0 -20 Td
(${clientName}) Tj
0 -15 Td
(${clientEmail}) Tj
ET
`;

  // Table-like layout for amounts
  const yTable = datePaid ? 590 : 605;
  const tableStream = `
% Table header background
0.94 0.94 0.96 rg
50 ${yTable} 495 -25 re f
0 0 0 rg

BT
/F1 10 Tf
60 ${yTable - 17} Td
(Description) Tj
300 0 Td
(Montant HT) Tj
100 0 Td
(TVA) Tj
ET

% Table row
BT
/F2 10 Tf
60 ${yTable - 42} Td
(Prestation de coaching / accompagnement) Tj
300 0 Td
(${amountHT}) Tj
100 0 Td
(${taxRate}%) Tj
ET

% Separator line
0.85 0.85 0.87 RG
0.5 w
50 ${yTable - 55} m 545 ${yTable - 55} l S

% Totals
BT
/F2 10 Tf
360 ${yTable - 80} Td
(Sous-total HT :) Tj
100 0 Td
(${amountHT}) Tj
ET

BT
/F2 10 Tf
360 ${yTable - 100} Td
(TVA \\(${taxRate}%\\) :) Tj
100 0 Td
(${taxAmount}) Tj
ET

% Bold total line
0.85 0.85 0.87 RG
0.5 w
360 ${yTable - 110} m 545 ${yTable - 110} l S

BT
/F1 12 Tf
360 ${yTable - 130} Td
(TOTAL TTC :) Tj
100 0 Td
(${totalTTC}) Tj
ET
`;

  const notesStream = notes
    ? `
BT
/F1 10 Tf
50 ${yTable - 180} Td
(Notes :) Tj
/F2 9 Tf
0 -16 Td
(${notes.substring(0, 200)}) Tj
ET
`
    : "";

  const footerStream = `
BT
/F2 8 Tf
0.5 0.5 0.5 rg
50 50 Td
(Off-Market - Facture generee automatiquement - Document non contractuel si statut brouillon) Tj
0 -12 Td
(En cas de retard de paiement, une penalite de 3x le taux d'interet legal sera appliquee.) Tj
ET
`;

  const pageContent =
    headerStream +
    invoiceInfoStream +
    clientInfoStream +
    tableStream +
    notesStream +
    footerStream;

  // Build the PDF structure
  const objects: string[] = [];

  // Obj 1: Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

  // Obj 2: Pages
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");

  // Obj 3: Page
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj",
  );

  // Obj 4: Content stream
  const streamBytes = Buffer.from(pageContent, "latin1");
  objects.push(
    `4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${pageContent}\nendstream\nendobj`,
  );

  // Obj 5: Helvetica-Bold font
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj",
  );

  // Obj 6: Helvetica font
  objects.push(
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj",
  );

  // Assemble PDF
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += obj + "\n";
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += "xref\n";
  pdf += `0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += offset.toString().padStart(10, "0") + " 00000 n \n";
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF";

  return Buffer.from(pdf, "latin1");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(
        "*, client:profiles!invoices_client_id_fkey(id, full_name, email)",
      )
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: "Facture introuvable" },
        { status: 404 },
      );
    }

    const pdfBuffer = generateInvoicePDF(invoice);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du PDF" },
      { status: 500 },
    );
  }
}
