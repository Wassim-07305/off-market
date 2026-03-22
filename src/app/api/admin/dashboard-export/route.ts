import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── PDF helpers (same pattern as journal/export) ─────────────

function escapePDF(str: string) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\u00e0\u00e2]/g, "a")
    .replace(/[\u00e9\u00e8\u00ea\u00eb]/g, "e")
    .replace(/[\u00ee\u00ef]/g, "i")
    .replace(/[\u00f4]/g, "o")
    .replace(/[\u00f9\u00fb\u00fc]/g, "u")
    .replace(/[\u00e7]/g, "c")
    .replace(/[\u00c0\u00c2]/g, "A")
    .replace(/[\u00c9\u00c8\u00ca\u00cb]/g, "E")
    .replace(/[\u00ce\u00cf]/g, "I")
    .replace(/[\u00d4]/g, "O")
    .replace(/[\u00d9\u00db\u00dc]/g, "U")
    .replace(/[\u00c7]/g, "C")
    .replace(/[\u2019\u2018]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "--")
    .replace(/\u2026/g, "...")
    .replace(/[\u00ab\u00bb]/g, '"')
    .replace(/[^\x00-\x7F]/g, "");
}

function formatDateFR(d: Date) {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── KPI fetching ─────────────────────────────────────────────

interface DashboardKPIs {
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueChange: number;
  cashCollected: number;
  cashInvoiced: number;
  totalStudents: number;
  newStudentsThisMonth: number;
  retentionRate: number;
  churnRate: number;
  closingRate: number;
}

async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  const supabase = createAdminClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  // Revenue this month
  const { data: revenueThisMonthData } = await supabase
    .from("financial_entries")
    .select("amount")
    .eq("type", "revenue")
    .gte("date", startOfMonth);

  const revenueThisMonth = (revenueThisMonthData ?? []).reduce(
    (sum, r) => sum + (r.amount ?? 0),
    0,
  );

  // Revenue last month
  const { data: revenueLastMonthData } = await supabase
    .from("financial_entries")
    .select("amount")
    .eq("type", "revenue")
    .gte("date", startOfLastMonth)
    .lte("date", endOfLastMonth);

  const revenueLastMonth = (revenueLastMonthData ?? []).reduce(
    (sum, r) => sum + (r.amount ?? 0),
    0,
  );

  const revenueChange =
    revenueLastMonth > 0
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
      : 0;

  // Cash collected (paid invoices this month)
  const { data: paidInvoices } = await supabase
    .from("financial_entries")
    .select("amount")
    .eq("type", "revenue")
    .eq("status", "paid")
    .gte("date", startOfMonth);

  const cashCollected = (paidInvoices ?? []).reduce(
    (sum, r) => sum + (r.amount ?? 0),
    0,
  );

  // Cash invoiced (all invoices this month)
  const cashInvoiced = revenueThisMonth;

  // Students
  const { count: totalStudents } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  const { count: newStudentsThisMonth } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfMonth);

  const { count: churnedStudents } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("status", "churned")
    .gte("updated_at", startOfMonth);

  const total = totalStudents ?? 0;
  const churned = churnedStudents ?? 0;
  const retentionRate = total > 0 ? Math.round(((total - churned) / total) * 100) : 100;
  const churnRate = total > 0 ? Math.round((churned / total) * 100) : 0;

  // Closing rate
  const { count: totalCalls } = await supabase
    .from("closer_calls")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfMonth);

  const { count: closedCalls } = await supabase
    .from("closer_calls")
    .select("id", { count: "exact", head: true })
    .eq("status", "closed_won")
    .gte("created_at", startOfMonth);

  const closingRate =
    (totalCalls ?? 0) > 0
      ? Math.round(((closedCalls ?? 0) / (totalCalls ?? 1)) * 100)
      : 0;

  return {
    revenueThisMonth,
    revenueLastMonth,
    revenueChange,
    cashCollected,
    cashInvoiced,
    totalStudents: total,
    newStudentsThisMonth: newStudentsThisMonth ?? 0,
    retentionRate,
    churnRate,
    closingRate,
  };
}

// ─── CSV generation ───────────────────────────────────────────

function generateCSV(kpis: DashboardKPIs): string {
  const lines = [
    "Metrique,Valeur",
    `CA du mois,${kpis.revenueThisMonth}`,
    `CA mois precedent,${kpis.revenueLastMonth}`,
    `Evolution CA (%),${kpis.revenueChange}`,
    `Cash encaisse,${kpis.cashCollected}`,
    `Cash facture,${kpis.cashInvoiced}`,
    `Eleves actifs,${kpis.totalStudents}`,
    `Nouveaux ce mois,${kpis.newStudentsThisMonth}`,
    `Taux retention (%),${kpis.retentionRate}`,
    `Taux churn (%),${kpis.churnRate}`,
    `Taux closing (%),${kpis.closingRate}`,
  ];
  return lines.join("\n");
}

// ─── PDF generation ───────────────────────────────────────────

function generateDashboardPDF(kpis: DashboardKPIs): Buffer {
  const dateGenerated = escapePDF(formatDateFR(new Date()));

  const metrics = [
    { label: "CA du mois", value: `${kpis.revenueThisMonth.toLocaleString("fr-FR")} EUR` },
    { label: "CA mois precedent", value: `${kpis.revenueLastMonth.toLocaleString("fr-FR")} EUR` },
    { label: "Evolution CA", value: `${kpis.revenueChange > 0 ? "+" : ""}${kpis.revenueChange}%` },
    { label: "Cash encaisse", value: `${kpis.cashCollected.toLocaleString("fr-FR")} EUR` },
    { label: "Cash facture", value: `${kpis.cashInvoiced.toLocaleString("fr-FR")} EUR` },
    { label: "Eleves actifs", value: `${kpis.totalStudents}` },
    { label: "Nouveaux ce mois", value: `${kpis.newStudentsThisMonth}` },
    { label: "Taux retention", value: `${kpis.retentionRate}%` },
    { label: "Taux churn", value: `${kpis.churnRate}%` },
    { label: "Taux closing", value: `${kpis.closingRate}%` },
  ];

  let stream = "";

  // Header
  stream += `
BT
/F1 22 Tf
50 780 Td
(OFF-MARKET) Tj
/F2 9 Tf
0 -16 Td
(Plateforme de Coaching & Gestion Business) Tj
ET
`;

  // Red accent line
  stream += `
0.86 0.15 0.15 RG
2 w
50 752 m 545 752 l S
`;

  // Title
  stream += `
BT
/F1 16 Tf
50 730 Td
(Rapport Dashboard Admin) Tj
/F2 10 Tf
0 -18 Td
(Genere le ${escapePDF(dateGenerated)}) Tj
ET
`;

  // Date box
  const monthLabel = escapePDF(
    new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
  );
  stream += `
0.96 0.96 0.97 rg
400 720 145 -30 re f
0 0 0 rg
BT
/F1 9 Tf
410 710 Td
(PERIODE) Tj
/F2 8 Tf
0 -12 Td
(${monthLabel}) Tj
ET
`;

  // Separator
  stream += `
0.85 0.85 0.87 RG
0.5 w
50 680 m 545 680 l S
`;

  // KPI table header
  let y = 655;
  stream += `
0.86 0.15 0.15 rg
BT
/F1 11 Tf
50 ${y} Td
(Indicateurs cles de performance) Tj
ET
0 0 0 rg
`;
  y -= 25;

  // Table header row
  stream += `
0.95 0.95 0.96 rg
50 ${y - 2} 495 -18 re f
0 0 0 rg
BT
/F1 9 Tf
60 ${y} Td
(Metrique) Tj
350 ${y} Td
(Valeur) Tj
ET
`;
  y -= 25;

  // Table rows
  for (let i = 0; i < metrics.length; i++) {
    const m = metrics[i];
    // Alternate row bg
    if (i % 2 === 0) {
      stream += `
0.98 0.98 0.99 rg
50 ${y + 4} 495 -18 re f
0 0 0 rg
`;
    }
    stream += `
BT
/F2 9 Tf
60 ${y - 4} Td
(${escapePDF(m.label)}) Tj
/F1 9 Tf
350 ${y - 4} Td
(${escapePDF(m.value)}) Tj
ET
`;
    y -= 20;
  }

  // Footer
  stream += `
BT
/F2 7 Tf
0.5 0.5 0.5 rg
50 35 Td
(Off-Market - Rapport Dashboard Admin - Page 1/1) Tj
0 -10 Td
(Document genere le ${escapePDF(dateGenerated)}) Tj
ET
`;

  // ─── Assemble PDF ─────────────────────────────────────────

  const FONT_BOLD_ID = 3;
  const FONT_REGULAR_ID = 4;

  const streamBytes = Buffer.from(stream, "latin1");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [7 0 R] /Count 1 >>\nendobj",
    `${FONT_BOLD_ID} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj`,
    `${FONT_REGULAR_ID} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj`,
    `5 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream\nendobj`,
    `7 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources << /Font << /F1 ${FONT_BOLD_ID} 0 R /F2 ${FONT_REGULAR_ID} 0 R >> >> >>\nendobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += obj + "\n";
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  const objIds = [1, 2, 3, 4, 5, 7];
  const maxObjId = Math.max(...objIds);

  pdf += "xref\n";
  pdf += `0 ${maxObjId + 1}\n`;
  pdf += "0000000000 65535 f \n";

  const offsetMap = new Map<number, number>();
  objIds.forEach((id, i) => offsetMap.set(id, offsets[i]));

  for (let i = 1; i <= maxObjId; i++) {
    const off = offsetMap.get(i);
    if (off !== undefined) {
      pdf += off.toString().padStart(10, "0") + " 00000 n \n";
    } else {
      pdf += "0000000000 65535 f \n";
    }
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${maxObjId + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF";

  return Buffer.from(pdf, "latin1");
}

// ─── GET Route ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roles || roles.role !== "admin") {
      return NextResponse.json({ error: "Acces reserve aux administrateurs" }, { status: 403 });
    }

    const format = req.nextUrl.searchParams.get("format") ?? "pdf";
    const kpis = await fetchDashboardKPIs();

    if (format === "csv") {
      const csv = generateCSV(kpis);
      const now = new Date().toISOString().split("T")[0];
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="dashboard-${now}.csv"`,
        },
      });
    }

    // Default: PDF
    const pdfBuffer = generateDashboardPDF(kpis);
    const now = new Date().toISOString().split("T")[0];

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="dashboard-${now}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Dashboard export error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation de l'export" },
      { status: 500 },
    );
  }
}
