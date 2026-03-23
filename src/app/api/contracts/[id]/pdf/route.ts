import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── PDF Helpers ─────────────────────────────────────────

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

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }
    const words = paragraph.split(" ");
    let currentLine = "";
    for (const word of words) {
      if (currentLine.length + word.length + 1 > maxCharsPerLine) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
  }
  return lines;
}

function formatDateFR(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── PDF Generation ─────────────────────────────────────

function generateContractPDF(contract: {
  title: string;
  content: string;
  status: string;
  created_at: string;
  signed_at: string | null;
  signature_image: string | null;
  client_name: string | null;
}): Buffer {
  const safeTitle = escapePDF(contract.title || "Contrat");
  const safeClient = escapePDF(contract.client_name || "");
  const safeDate = escapePDF(formatDateFR(contract.created_at));
  const safeSignedAt = contract.signed_at
    ? escapePDF(formatDateFR(contract.signed_at))
    : null;
  const dateGenerated = escapePDF(formatDateFR(new Date().toISOString()));

  const statusLabels: Record<string, string> = {
    draft: "Brouillon",
    sent: "Envoye",
    signed: "Signe",
    cancelled: "Annule",
  };
  const safeStatus = escapePDF(statusLabels[contract.status] || contract.status);

  // Build content lines
  const contentLines: string[] = [];
  contentLines.push(`Date de creation : ${safeDate}`);
  if (safeClient) {
    contentLines.push(`Client : ${safeClient}`);
  }
  contentLines.push(`Statut : ${safeStatus}`);
  if (safeSignedAt) {
    contentLines.push(`Signe le : ${safeSignedAt}`);
  }
  contentLines.push("");
  contentLines.push("--- Contenu du contrat ---");
  contentLines.push("");

  const contentWrapped = wrapText(escapePDF(contract.content || ""), 85);
  contentLines.push(...contentWrapped);

  if (contract.signed_at && contract.signature_image) {
    contentLines.push("");
    contentLines.push("--- Signature ---");
    contentLines.push("");
    contentLines.push(`Signe electroniquement le ${safeSignedAt}`);
  }

  // ─── Build PDF pages ────────────────────────────────────

  const LINES_PER_PAGE = 42;
  const FIRST_PAGE_LINES = 28;

  const pages: string[][] = [];
  const remainingLines = [...contentLines];

  pages.push(remainingLines.splice(0, FIRST_PAGE_LINES));
  while (remainingLines.length > 0) {
    pages.push(remainingLines.splice(0, LINES_PER_PAGE));
  }

  const pageObjectIds: number[] = [];

  const FONT_BOLD_ID = 3;
  const FONT_REGULAR_ID = 4;
  let nextObjId = 5;

  const pageStreams: string[] = [];

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const isFirstPage = pageIdx === 0;
    const lines = pages[pageIdx];

    let stream = "";

    if (isFirstPage) {
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
0.686 0 0 RG
2 w
50 752 m 545 752 l S
`;

      // Title
      stream += `
BT
/F1 16 Tf
50 730 Td
(${safeTitle}) Tj
/F2 10 Tf
0 -18 Td
(${safeClient}) Tj
ET
`;

      // Status box
      stream += `
0.96 0.96 0.97 rg
380 720 165 -30 re f
0 0 0 rg
BT
/F1 9 Tf
390 710 Td
(STATUT: ${safeStatus}) Tj
ET
`;

      // Separator
      stream += `
0.85 0.85 0.87 RG
0.5 w
50 680 m 545 680 l S
`;

      // Content
      let y = 665;
      for (const line of lines) {
        if (line === "") {
          y -= 8;
          continue;
        }

        const isSectionHeader = line.startsWith("---") && line.endsWith("---");
        if (isSectionHeader) {
          const headerText = line.replace(/^-+\s*/, "").replace(/\s*-+$/, "");
          stream += `
0.686 0 0 rg
BT
/F1 10 Tf
50 ${y} Td
(${headerText}) Tj
ET
0 0 0 rg
`;
          y -= 15;
          continue;
        }

        stream += `
BT
/F2 9 Tf
50 ${y} Td
(${line}) Tj
ET
`;
        y -= 13;
      }
    } else {
      // Continuation pages
      stream += `
BT
/F2 8 Tf
0.5 0.5 0.5 rg
50 800 Td
(${safeTitle} - Page ${pageIdx + 1}) Tj
0 0 0 rg
ET
0.85 0.85 0.87 RG
0.5 w
50 793 m 545 793 l S
`;

      let y = 775;
      for (const line of lines) {
        if (line === "") {
          y -= 8;
          continue;
        }

        const isSectionHeader = line.startsWith("---") && line.endsWith("---");
        if (isSectionHeader) {
          const headerText = line.replace(/^-+\s*/, "").replace(/\s*-+$/, "");
          stream += `
0.686 0 0 rg
BT
/F1 10 Tf
50 ${y} Td
(${headerText}) Tj
ET
0 0 0 rg
`;
          y -= 15;
          continue;
        }

        stream += `
BT
/F2 9 Tf
50 ${y} Td
(${line}) Tj
ET
`;
        y -= 13;
      }
    }

    // Footer
    stream += `
BT
/F2 7 Tf
0.5 0.5 0.5 rg
50 35 Td
(Off-Market - Contrat - Page ${pageIdx + 1}/${pages.length}) Tj
0 -10 Td
(Document généré le ${dateGenerated}) Tj
ET
`;

    pageStreams.push(stream);
  }

  // ─── Assemble PDF Objects ──────────────────────────────

  const objects: string[] = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  objects.push("");

  objects.push(
    `${FONT_BOLD_ID} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj`,
  );
  objects.push(
    `${FONT_REGULAR_ID} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj`,
  );

  for (let i = 0; i < pageStreams.length; i++) {
    const contentObjId = nextObjId++;
    const pageObjId = nextObjId++;

    pageObjectIds.push(pageObjId);

    const streamBytes = Buffer.from(pageStreams[i], "latin1");

    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${pageStreams[i]}\nendstream\nendobj`,
    );

    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${FONT_BOLD_ID} 0 R /F2 ${FONT_REGULAR_ID} 0 R >> >> >>\nendobj`,
    );
  }

  const kids = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageObjectIds.length} >>\nendobj`;

  const allObjs: { id: number; content: string }[] = [];
  allObjs.push({ id: 1, content: objects[0] });
  allObjs.push({ id: 2, content: objects[1] });
  allObjs.push({ id: FONT_BOLD_ID, content: objects[2] });
  allObjs.push({ id: FONT_REGULAR_ID, content: objects[3] });

  let objIdx = 4;
  let currentId = 5;
  while (objIdx < objects.length) {
    allObjs.push({ id: currentId, content: objects[objIdx] });
    currentId++;
    objIdx++;
  }

  allObjs.sort((a, b) => a.id - b.id);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (const obj of allObjs) {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += obj.content + "\n";
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += "xref\n";
  pdf += `0 ${allObjs.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += offset.toString().padStart(10, "0") + " 00000 n \n";
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${allObjs.length + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF";

  return Buffer.from(pdf, "latin1");
}

// ─── GET Route ───────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    const { data: contract, error } = await admin
      .from("contracts")
      .select(
        "id, title, content, status, created_at, signed_at, signature_image, client_id",
      )
      .eq("id", id)
      .single();

    if (error || !contract) {
      return NextResponse.json(
        { error: "Contrat introuvable" },
        { status: 404 },
      );
    }

    // Get client name
    let clientName: string | null = null;
    if (contract.client_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", contract.client_id)
        .single();
      clientName = profile?.full_name ?? null;
    }

    const pdfBuffer = generateContractPDF({
      title: contract.title,
      content: contract.content,
      status: contract.status,
      created_at: contract.created_at,
      signed_at: contract.signed_at,
      signature_image: contract.signature_image,
      client_name: clientName,
    });

    const fileName = `contrat-${id}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Contract PDF generation error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la generation du PDF" },
      { status: 500 },
    );
  }
}
