import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Minimal PDF 1.4 generator — no external dependency
// Produces a valid PDF document with contract details + optional signature

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

function generateContractPDF(contract: {
  id: string;
  title: string;
  content: string;
  status: string;
  signature_image: string | null;
  signature_data: {
    signed_at: string;
    ip_address: string;
    user_agent: string;
  } | null;
  signed_at: string | null;
  created_at: string;
  expires_at: string | null;
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

  const statusLabels: Record<string, string> = {
    draft: "Brouillon",
    sent: "En attente de signature",
    signed: "Signe",
    cancelled: "Annule",
  };

  const clientName = escapePDF(contract.client?.full_name ?? "Client");
  const clientEmail = escapePDF(contract.client?.email ?? "");
  const title = escapePDF(contract.title);
  const dateCreated = escapePDF(formatDate(contract.created_at));
  const status = escapePDF(statusLabels[contract.status] ?? contract.status);
  const isSigned = contract.status === "signed";

  // Wrap content into lines for the PDF
  const contentLines = wrapText(escapePDF(contract.content), 85);

  // Build pages — each page fits ~45 lines of content
  const LINES_PER_PAGE = 42;
  const FIRST_PAGE_LINES = 32; // Less room on first page due to header

  const pages: string[][] = [];
  let remainingLines = [...contentLines];

  // First page gets fewer lines
  pages.push(remainingLines.splice(0, FIRST_PAGE_LINES));
  while (remainingLines.length > 0) {
    pages.push(remainingLines.splice(0, LINES_PER_PAGE));
  }

  // We need a signature section — add it to the last page if there's room, else new page
  const lastPage = pages[pages.length - 1];
  const sigLinesNeeded = 8;
  const maxLines = pages.length === 1 ? FIRST_PAGE_LINES : LINES_PER_PAGE;
  if (lastPage.length + sigLinesNeeded > maxLines) {
    pages.push([]); // Signature goes on new page
  }

  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  // We'll build objects dynamically
  // Reserve: 1=Catalog, 2=Pages, 3+=fonts, then page+content objects
  const FONT_BOLD_ID = 3;
  const FONT_REGULAR_ID = 4;
  let nextObjId = 5;

  // Build each page's content stream
  const pageStreams: string[] = [];

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const isFirstPage = pageIdx === 0;
    const isLastPage = pageIdx === pages.length - 1;
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

      // Separator line
      stream += `
0.85 0.85 0.87 RG
0.5 w
50 752 m 545 752 l S
`;

      // Contract title
      stream += `
BT
/F1 16 Tf
50 730 Td
(${title}) Tj
/F2 10 Tf
0 -20 Td
(Statut : ${status}) Tj
0 -15 Td
(Date de creation : ${dateCreated}) Tj
ET
`;

      // Client info box
      stream += `
0.96 0.96 0.97 rg
350 715 195 -55 re f
0 0 0 rg
BT
/F1 10 Tf
360 705 Td
(CLIENT) Tj
/F2 9 Tf
0 -16 Td
(${clientName}) Tj
0 -14 Td
(${clientEmail}) Tj
ET
`;

      // Separator
      stream += `
0.85 0.85 0.87 RG
0.5 w
50 650 m 545 650 l S
`;

      // Content starts at y=635
      let y = 635;
      for (const line of lines) {
        if (line === "") {
          y -= 8;
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
      // Small header
      stream += `
BT
/F2 8 Tf
0.5 0.5 0.5 rg
50 800 Td
(${title} - Page ${pageIdx + 1}) Tj
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

    // Signature section on last page
    if (isLastPage) {
      // Calculate Y position after content
      const contentEndY = isFirstPage
        ? 635 - lines.length * 13
        : 775 - lines.length * 13;
      const sigY = Math.min(contentEndY - 30, 250);

      stream += `
0.85 0.85 0.87 RG
0.5 w
50 ${sigY + 20} m 545 ${sigY + 20} l S
`;

      stream += `
BT
/F1 11 Tf
50 ${sigY} Td
(SIGNATURE ELECTRONIQUE) Tj
ET
`;

      if (isSigned) {
        const signedDate = escapePDF(formatDate(contract.signed_at));
        const ipAddr = escapePDF(contract.signature_data?.ip_address ?? "");

        stream += `
BT
/F2 9 Tf
50 ${sigY - 20} Td
(Contrat signe electroniquement) Tj
0 -14 Td
(Date de signature : ${signedDate}) Tj
0 -14 Td
(Adresse IP : ${ipAddr}) Tj
ET
`;

        // Signature image placeholder box
        stream += `
0.96 0.96 0.97 rg
50 ${sigY - 80} 200 -60 re f
0 0 0 rg
BT
/F2 8 Tf
80 ${sigY - 115} Td
([Signature electronique]) Tj
ET
`;
      } else {
        stream += `
BT
/F2 9 Tf
50 ${sigY - 20} Td
(En attente de signature) Tj
ET
0.96 0.96 0.97 rg
50 ${sigY - 45} 200 -50 re f
0 0 0 rg
BT
/F2 8 Tf
0.5 0.5 0.5 rg
70 ${sigY - 75} Td
(Signature du client) Tj
0 0 0 rg
ET
`;
      }
    }

    // Footer on every page
    stream += `
BT
/F2 7 Tf
0.5 0.5 0.5 rg
50 35 Td
(Off-Market - Contrat genere automatiquement - Page ${pageIdx + 1}/${pages.length}) Tj
0 -10 Td
(Ce document fait foi de contrat electronique conformement aux articles 1366 et 1367 du Code civil.) Tj
ET
`;

    pageStreams.push(stream);
  }

  // Now build all PDF objects
  // Obj 1: Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

  // Obj 2: Pages (we'll fill Kids after we know page obj IDs)
  // Placeholder — we'll replace this
  objects.push(""); // index 1

  // Obj 3: Font Bold
  objects.push(
    `${FONT_BOLD_ID} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj`,
  );

  // Obj 4: Font Regular
  objects.push(
    `${FONT_REGULAR_ID} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj`,
  );

  // Pages + content streams
  for (let i = 0; i < pageStreams.length; i++) {
    const pageObjId = nextObjId++;
    const contentObjId = nextObjId++;

    pageObjectIds.push(pageObjId);

    const streamBytes = Buffer.from(pageStreams[i], "latin1");

    // Content stream object
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${pageStreams[i]}\nendstream\nendobj`,
    );

    // Page object
    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${FONT_BOLD_ID} 0 R /F2 ${FONT_REGULAR_ID} 0 R >> >> >>\nendobj`,
    );
  }

  // Now fill in the Pages object
  const kids = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageObjectIds.length} >>\nendobj`;

  // Assemble PDF — objects need to be output in order of their IDs
  // Collect all objects with their IDs
  const allObjs: { id: number; content: string }[] = [];
  allObjs.push({ id: 1, content: objects[0] });
  allObjs.push({ id: 2, content: objects[1] });
  allObjs.push({ id: FONT_BOLD_ID, content: objects[2] });
  allObjs.push({ id: FONT_REGULAR_ID, content: objects[3] });

  // The remaining objects (content streams + pages) are in objects[4..]
  // They were added as pairs (content, page) with IDs starting at 5
  let objIdx = 4;
  let currentId = 5;
  while (objIdx < objects.length) {
    allObjs.push({ id: currentId, content: objects[objIdx] });
    currentId++;
    objIdx++;
  }

  // Sort by ID
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Try authenticated access first, fall back to public for signed contracts
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let contract;

    if (user) {
      // Authenticated: use user's session (respects RLS)
      const { data, error } = await supabase
        .from("contracts")
        .select(
          "*, client:profiles!contracts_client_id_fkey(id, full_name, email)",
        )
        .eq("id", id)
        .single();
      if (error || !data) {
        return NextResponse.json(
          { error: "Contrat introuvable" },
          { status: 404 },
        );
      }
      contract = data;
    } else {
      // Public access: only allow for signed contracts (post-signature download)
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from("contracts")
        .select(
          "*, client:profiles!contracts_client_id_fkey(id, full_name, email)",
        )
        .eq("id", id)
        .single();
      if (error || !data) {
        return NextResponse.json(
          { error: "Contrat introuvable" },
          { status: 404 },
        );
      }
      if (data.status !== "signed") {
        return NextResponse.json({ error: "Non autorise" }, { status: 401 });
      }
      contract = data;
    }

    const pdfBuffer = generateContractPDF(contract);
    const fileName = `contrat-${contract.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Contract PDF generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du PDF" },
      { status: 500 },
    );
  }
}
