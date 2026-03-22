import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── PDF Helpers ─────────────────────────────────────────

// Common emoji-to-text mapping for journal/gamification context
const EMOJI_MAP: Record<string, string> = {
  "\u{1F62B}": "[Tres mal]",
  "\u{1F615}": "[Pas top]",
  "\u{1F610}": "[Neutre]",
  "\u{1F60A}": "[Bien]",
  "\u{1F929}": "[Excellent]",
  "\u{1F525}": "[Feu]",
  "\u{2B50}": "[Etoile]",
  "\u{1F3C6}": "[Trophee]",
  "\u{1F389}": "[Fete]",
  "\u{2705}": "[OK]",
  "\u{274C}": "[X]",
  "\u{1F4AA}": "[Force]",
  "\u{1F64F}": "[Merci]",
  "\u{1FA9E}": "[Miroir]",
  "\u{1F3AF}": "[Cible]",
  "\u{1F4CB}": "[Liste]",
  "\u{1F680}": "[Fusee]",
  "\u{2764}": "[Coeur]",
  "\u{1F44D}": "[Pouce]",
  "\u{1F31F}": "[Brillant]",
  "\u{1F4D6}": "[Livre]",
};

function escapePDF(str: string) {
  // Replace known emojis with text equivalents before stripping
  let result = str;
  for (const [emoji, text] of Object.entries(EMOJI_MAP)) {
    result = result.replaceAll(emoji, text);
  }

  return result
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

// ─── Mood labels ────────────────────────────────────────

const MOOD_LABELS: Record<number, string> = {
  1: "Tres mal",
  2: "Pas top",
  3: "Neutre",
  4: "Bien",
  5: "Excellent",
};

const ENERGY_LABELS: Record<number, string> = {
  1: "Epuise",
  2: "Fatigue",
  3: "Normal",
  4: "En forme",
  5: "Au top",
};

// ─── Types ──────────────────────────────────────────────

interface JournalAttachmentRow {
  url: string;
  type: string;
  name: string;
  size: number;
}

interface JournalEntryRow {
  id: string;
  title: string;
  content: string;
  mood: number | null;
  tags: string[];
  template: string | null;
  is_private: boolean;
  attachments: JournalAttachmentRow[] | null;
  created_at: string;
}

// ─── PDF Generation ─────────────────────────────────────

function generateJournalPDF(
  entries: JournalEntryRow[],
  userName: string,
  dateFrom: string,
  dateTo: string,
): Buffer {
  const safeUserName = escapePDF(userName);
  const safeDateFrom = escapePDF(formatDateFR(dateFrom));
  const safeDateTo = escapePDF(formatDateFR(dateTo));
  const dateGenerated = escapePDF(formatDateFR(new Date().toISOString()));

  // Build content lines
  const contentLines: string[] = [];

  contentLines.push(`Periode : du ${safeDateFrom} au ${safeDateTo}`);
  contentLines.push(`Nombre d'entrees : ${entries.length}`);
  contentLines.push("");

  if (entries.length === 0) {
    contentLines.push("Aucune entree pour cette periode.");
  }

  for (const entry of entries) {
    // Entry date and title
    const entryDate = escapePDF(formatDateFR(entry.created_at));
    const entryTitle = escapePDF(entry.title);

    contentLines.push(`--- ${entryDate} ---`);
    contentLines.push("");
    contentLines.push(entryTitle);
    contentLines.push("");

    // Mood
    if (entry.mood) {
      const moodLabel = MOOD_LABELS[entry.mood] ?? `${entry.mood}/5`;
      contentLines.push(`Humeur : ${escapePDF(moodLabel)} (${entry.mood}/5)`);
    }

    // Tags
    if (entry.tags && entry.tags.length > 0) {
      contentLines.push(
        `Tags : ${entry.tags.map((t) => `#${escapePDF(t)}`).join(" ")}`,
      );
    }

    if (entry.mood || (entry.tags && entry.tags.length > 0)) {
      contentLines.push("");
    }

    // Content
    const contentWrapped = wrapText(escapePDF(entry.content), 85);
    contentLines.push(...contentWrapped);
    contentLines.push("");

    // Attachments
    if (entry.attachments && entry.attachments.length > 0) {
      contentLines.push(`Pieces jointes (${entry.attachments.length}) :`);
      for (const att of entry.attachments) {
        const name = escapePDF(att.name || "fichier");
        const url = escapePDF(att.url || "");
        contentLines.push(`  - ${name} (${att.type || "fichier"}) : ${url}`);
      }
      contentLines.push("");
    }

    contentLines.push("");
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
      // Header — Off-Market branding
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
(Journal de Coaching) Tj
/F2 10 Tf
0 -18 Td
(${safeUserName}) Tj
ET
`;

      // Date range box
      stream += `
0.96 0.96 0.97 rg
380 720 165 -40 re f
0 0 0 rg
BT
/F1 9 Tf
390 712 Td
(PERIODE) Tj
/F2 8 Tf
0 -12 Td
(${safeDateFrom}) Tj
0 -11 Td
(au ${safeDateTo}) Tj
ET
`;

      // Separator
      stream += `
0.85 0.85 0.87 RG
0.5 w
50 670 m 545 670 l S
`;

      // Content
      let y = 655;
      for (const line of lines) {
        if (line === "") {
          y -= 8;
          continue;
        }

        // Detect date section headers
        const isSectionHeader = line.startsWith("---") && line.endsWith("---");
        if (isSectionHeader) {
          const headerText = line.replace(/^-+\s*/, "").replace(/\s*-+$/, "");
          // Red accent for dates
          stream += `
0.86 0.15 0.15 rg
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
(Journal de Coaching - ${safeUserName} - Page ${pageIdx + 1}) Tj
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
0.86 0.15 0.15 rg
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
(Off-Market - Journal de Coaching - Page ${pageIdx + 1}/${pages.length}) Tj
0 -10 Td
(Document genere le ${dateGenerated}) Tj
ET
`;

    pageStreams.push(stream);
  }

  // ─── Assemble PDF Objects ──────────────────────────────

  const objects: string[] = [];

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

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId") ?? user.id;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Auth check: can only export own journal unless admin/coach
    if (userId !== user.id) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roles || !["admin", "coach"].includes(roles.role)) {
        return NextResponse.json({ error: "Non autorise" }, { status: 403 });
      }
    }

    // Fetch user profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    const userName = profile?.full_name ?? "Utilisateur";

    // Build query
    let query = supabase
      .from("journal_entries")
      .select(
        "id, title, content, mood, tags, template, is_private, attachments, created_at",
      )
      .eq("author_id", userId)
      .order("created_at", { ascending: true });

    // Default: last 30 days
    const dateFrom =
      from ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const dateTo = to ?? new Date().toISOString().split("T")[0];

    query = query.gte("created_at", `${dateFrom}T00:00:00`);
    query = query.lte("created_at", `${dateTo}T23:59:59`);

    const { data: entries, error } = await query;
    if (error) throw error;

    const pdfBuffer = generateJournalPDF(
      (entries ?? []) as JournalEntryRow[],
      userName,
      dateFrom,
      dateTo,
    );

    const fileName = `journal-${dateFrom}-${dateTo}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Journal PDF generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du PDF" },
      { status: 500 },
    );
  }
}
