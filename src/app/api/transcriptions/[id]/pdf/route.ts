import { NextRequest, NextResponse } from "next/server";
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

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, "0")}min ${s.toString().padStart(2, "0")}s`;
  }
  return `${m}min ${s.toString().padStart(2, "0")}s`;
}

// ─── PDF Generation ──────────────────────────────────────

interface RecordingData {
  id: string;
  call_id: string;
  transcript_text: string;
  duration_seconds: number | null;
  created_at: string;
  recorded_by_name: string;
  call_title: string | null;
  call_date: string | null;
  client_name: string | null;
}

function generateTranscriptionPDF(recording: RecordingData): Buffer {
  const title = "Transcription d'appel";
  const callTitle = escapePDF(recording.call_title ?? "Appel");
  const callDate = escapePDF(
    formatDate(recording.call_date ?? recording.created_at),
  );
  const duration = escapePDF(formatDuration(recording.duration_seconds));
  const recorderName = escapePDF(recording.recorded_by_name);
  const clientName = escapePDF(recording.client_name ?? "-");
  const dateGenerated = escapePDF(formatDate(new Date().toISOString()));

  // Build content lines
  const contentLines: string[] = [];

  // Metadata section
  contentLines.push(`Appel : ${callTitle}`);
  contentLines.push(`Date : ${callDate}`);
  contentLines.push(`Duree : ${duration}`);
  contentLines.push(`Enregistre par : ${recorderName}`);
  if (recording.client_name) {
    contentLines.push(`Client : ${clientName}`);
  }
  contentLines.push("");
  contentLines.push("--- TRANSCRIPTION ---");
  contentLines.push("");

  // Transcription text with wrapping
  const transcriptLines = wrapText(escapePDF(recording.transcript_text), 85);
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

      // Red accent line (brand color #DC2626 = 0.86 0.15 0.15)
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
(${escapePDF(title)}) Tj
/F2 10 Tf
0 -18 Td
(${callTitle}) Tj
ET
`;

      // Metadata box
      stream += `
0.96 0.96 0.97 rg
380 720 165 -55 re f
0 0 0 rg
BT
/F1 9 Tf
390 710 Td
(DETAILS) Tj
/F2 8 Tf
0 -13 Td
(Date : ${callDate}) Tj
0 -12 Td
(Duree : ${duration}) Tj
0 -12 Td
(Par : ${recorderName}) Tj
ET
`;

      // Separator
      stream += `
0.85 0.85 0.87 RG
0.5 w
50 660 m 545 660 l S
`;

      // Content
      let y = 645;
      for (const line of lines) {
        if (line === "") {
          y -= 8;
          continue;
        }

        // Detect section headers
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

        // Metadata lines (before transcription)
        const isMetadata = line.match(
          /^(Appel|Date|Duree|Enregistre par|Client) :/,
        );
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
      // Continuation pages header
      stream += `
BT
/F2 8 Tf
0.5 0.5 0.5 rg
50 800 Td
(${escapePDF(title)} - ${callTitle} - Page ${pageIdx + 1}) Tj
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

    // Footer
    stream += `
BT
/F2 7 Tf
0.5 0.5 0.5 rg
50 35 Td
(Off-Market - Transcription generee automatiquement - Page ${pageIdx + 1}/${pages.length}) Tj
0 -10 Td
(Document genere le ${dateGenerated}) Tj
ET
`;

    pageStreams.push(stream);
  }

  // ─── Assemble PDF Objects ──────────────────────────────

  // Obj 1: Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

  // Obj 2: Pages (placeholder)
  objects.push("");

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

    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${pageStreams[i]}\nendstream\nendobj`,
    );

    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${FONT_BOLD_ID} 0 R /F2 ${FONT_REGULAR_ID} 0 R >> >> >>\nendobj`,
    );
  }

  // Fill in Pages object
  const kids = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageObjectIds.length} >>\nendobj`;

  // Build all objects with their IDs
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

    // Fetch call recording
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recording, error: recordingError } = await (supabase as any)
      .from("call_recordings")
      .select(
        "id, call_id, transcript_text, duration_seconds, created_at, recorded_by",
      )
      .eq("id", id)
      .single();

    if (recordingError || !recording) {
      return NextResponse.json(
        { error: "Enregistrement introuvable" },
        { status: 404 },
      );
    }

    if (!recording.transcript_text) {
      return NextResponse.json(
        { error: "Aucune transcription disponible pour cet enregistrement" },
        { status: 404 },
      );
    }

    // Fetch recorder profile
    const { data: recorderProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", recording.recorded_by)
      .single();

    // Try to fetch related call info from call_calendar
    const { data: callInfo } = await supabase
      .from("call_calendar")
      .select(
        "title, date, client:profiles!call_calendar_client_id_fkey(full_name)",
      )
      .eq("id", recording.call_id)
      .single();

    const recordingData: RecordingData = {
      id: recording.id,
      call_id: recording.call_id,
      transcript_text: recording.transcript_text,
      duration_seconds: recording.duration_seconds,
      created_at: recording.created_at,
      recorded_by_name: recorderProfile?.full_name ?? "Inconnu",
      call_title: callInfo?.title ?? null,
      call_date: callInfo?.date ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client_name: (callInfo?.client as any)?.full_name ?? null,
    };

    const pdfBuffer = generateTranscriptionPDF(recordingData);
    const dateStr = new Date(recording.created_at).toISOString().slice(0, 10);
    const fileName = `transcription-${dateStr}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Transcription PDF generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du PDF" },
      { status: 500 },
    );
  }
}
