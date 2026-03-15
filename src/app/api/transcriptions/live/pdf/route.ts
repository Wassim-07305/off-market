import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

function generateLiveTranscriptionPDF(
  transcriptText: string,
  userName: string,
): Buffer {
  const title = "Transcription en direct";
  const now = new Date();
  const dateStr = escapePDF(
    now.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );
  const timeStr = escapePDF(
    now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  );

  const contentLines: string[] = [];
  contentLines.push(`Date : ${escapePDF(dateStr)}`);
  contentLines.push(`Heure : ${escapePDF(timeStr)}`);
  contentLines.push(`Utilisateur : ${escapePDF(userName)}`);
  contentLines.push("");
  contentLines.push("--- TRANSCRIPTION ---");
  contentLines.push("");

  const transcriptLines = wrapText(escapePDF(transcriptText), 85);
  contentLines.push(...transcriptLines);

  // ─── Build PDF pages ────────────────────────────────────

  const LINES_PER_PAGE = 42;
  const FIRST_PAGE_LINES = 28;

  const pages: string[][] = [];
  const remainingLines = [...contentLines];

  pages.push(remainingLines.splice(0, FIRST_PAGE_LINES));
  while (remainingLines.length > 0) {
    pages.push(remainingLines.splice(0, LINES_PER_PAGE));
  }

  const objects: string[] = [];
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
      stream += `
0.86 0.15 0.15 RG
2 w
50 752 m 545 752 l S
`;
      stream += `
BT
/F1 16 Tf
50 730 Td
(${escapePDF(title)}) Tj
/F2 10 Tf
0 -18 Td
(Appel du ${dateStr} a ${timeStr}) Tj
ET
`;
      stream += `
0.96 0.96 0.97 rg
380 720 165 -42 re f
0 0 0 rg
BT
/F1 9 Tf
390 710 Td
(DETAILS) Tj
/F2 8 Tf
0 -13 Td
(Date : ${dateStr}) Tj
0 -12 Td
(Par : ${escapePDF(userName)}) Tj
ET
`;
      stream += `
0.85 0.85 0.87 RG
0.5 w
50 660 m 545 660 l S
`;

      let y = 645;
      for (const line of lines) {
        if (line === "") {
          y -= 8;
          continue;
        }
        const isSectionHeader = line.startsWith("---") && line.endsWith("---");
        if (isSectionHeader) {
          const headerText = line.replace(/^-+\s*/, "").replace(/\s*-+$/, "");
          stream += `
BT
/F1 11 Tf
50 ${y} Td
(${headerText}) Tj
ET
`;
          y -= 15;
          continue;
        }
        const isMetadata = line.match(/^(Date|Heure|Utilisateur) :/);
        const fontCmd = isMetadata ? "/F1 9 Tf" : "/F2 9 Tf";
        stream += `
BT
${fontCmd}
50 ${y} Td
(${line}) Tj
ET
`;
        y -= 13;
      }
    } else {
      stream += `
BT
/F2 8 Tf
0.5 0.5 0.5 rg
50 800 Td
(${escapePDF(title)} - Page ${pageIdx + 1}) Tj
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
BT
/F1 11 Tf
50 ${y} Td
(${headerText}) Tj
ET
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

    stream += `
BT
/F2 7 Tf
0.5 0.5 0.5 rg
50 35 Td
(Off-Market - Transcription en direct - Page ${pageIdx + 1}/${pages.length}) Tj
0 -10 Td
(Document genere le ${dateStr}) Tj
ET
`;

    pageStreams.push(stream);
  }

  // ─── Assemble PDF Objects ──────────────────────────────

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  objects.push("");

  objects.push(
    `${FONT_BOLD_ID} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj`,
  );
  objects.push(
    `${FONT_REGULAR_ID} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj`,
  );

  for (let i = 0; i < pageStreams.length; i++) {
    const pageObjId = nextObjId++;
    const contentObjId = nextObjId++;

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

// ─── POST Route ───────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { transcriptText } = await request.json();

    if (!transcriptText || typeof transcriptText !== "string") {
      return NextResponse.json(
        { error: "Aucune transcription fournie" },
        { status: 400 },
      );
    }

    // Get user name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name ?? "Utilisateur";
    const pdfBuffer = generateLiveTranscriptionPDF(transcriptText, userName);
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `transcription-live-${dateStr}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Live transcription PDF generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du PDF" },
      { status: 500 },
    );
  }
}
