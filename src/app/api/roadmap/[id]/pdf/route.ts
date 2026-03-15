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

// ─── PDF Generation ──────────────────────────────────────

interface Milestone {
  title: string;
  description: string | null;
  status: string;
  order_index: number;
  completed_at: string | null;
  validation_criteria: string[];
  notes: string | null;
}

interface RoadmapData {
  id: string;
  title: string;
  description: string | null;
  generated_from: string;
  created_at: string;
  client?: { full_name: string; avatar_url: string | null } | null;
  milestones: Milestone[];
}

function generateRoadmapPDF(roadmap: RoadmapData): Buffer {
  const clientName = escapePDF(roadmap.client?.full_name ?? "Client");
  const title = escapePDF(roadmap.title);
  const description = escapePDF(roadmap.description ?? "");
  const dateCreated = escapePDF(formatDate(roadmap.created_at));
  const dateGenerated = escapePDF(formatDate(new Date().toISOString()));

  const milestones = roadmap.milestones.sort(
    (a, b) => a.order_index - b.order_index,
  );
  const completed = milestones.filter((m) => m.status === "completed").length;
  const total = milestones.length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const sourceLabel: Record<string, string> = {
    kickoff_call: "Appel kickoff",
    manual: "Creation manuelle",
    ai_suggestion: "Suggestion IA",
  };

  const statusLabels: Record<string, string> = {
    pending: "A faire",
    in_progress: "En cours",
    completed: "Termine",
    skipped: "Passe",
  };

  const statusSymbols: Record<string, string> = {
    completed: "[x]",
    in_progress: "[~]",
    pending: "[ ]",
    skipped: "[-]",
  };

  // Build content lines for milestones
  const contentLines: string[] = [];

  // Progress summary
  contentLines.push(
    `Progression : ${completed}/${total} jalons termines (${progressPercent}%)`,
  );
  contentLines.push("");

  // Source
  contentLines.push(
    `Source : ${escapePDF(sourceLabel[roadmap.generated_from] ?? roadmap.generated_from)}`,
  );
  contentLines.push("");

  // Description
  if (description) {
    contentLines.push("Description :");
    contentLines.push(...wrapText(description, 85));
    contentLines.push("");
  }

  // Milestones
  contentLines.push("--- JALONS ---");
  contentLines.push("");

  for (const milestone of milestones) {
    const symbol = statusSymbols[milestone.status] ?? "[ ]";
    const statusText = statusLabels[milestone.status] ?? milestone.status;
    const milestoneTitle = escapePDF(milestone.title);

    contentLines.push(
      `${symbol} Etape ${milestone.order_index + 1} : ${milestoneTitle}`,
    );
    contentLines.push(`     Statut : ${escapePDF(statusText)}`);

    if (milestone.status === "completed" && milestone.completed_at) {
      contentLines.push(
        `     Termine le : ${escapePDF(formatDate(milestone.completed_at))}`,
      );
    }

    if (milestone.description) {
      const descLines = wrapText(escapePDF(milestone.description), 80);
      for (const line of descLines) {
        contentLines.push(`     ${line}`);
      }
    }

    if (
      milestone.validation_criteria &&
      milestone.validation_criteria.length > 0
    ) {
      contentLines.push("     Criteres de validation :");
      for (const criterion of milestone.validation_criteria) {
        contentLines.push(`       - ${escapePDF(criterion)}`);
      }
    }

    if (milestone.notes) {
      contentLines.push(`     Notes : ${escapePDF(milestone.notes)}`);
    }

    contentLines.push("");
  }

  // Next steps (pending + in_progress milestones)
  const nextSteps = milestones.filter(
    (m) => m.status === "pending" || m.status === "in_progress",
  );
  if (nextSteps.length > 0) {
    contentLines.push("--- PROCHAINES ETAPES ---");
    contentLines.push("");
    for (const step of nextSteps.slice(0, 5)) {
      const prefix = step.status === "in_progress" ? "(en cours)" : "(a venir)";
      contentLines.push(`  ${prefix} ${escapePDF(step.title)}`);
    }
    if (nextSteps.length > 5) {
      contentLines.push(`  ... et ${nextSteps.length - 5} autre(s)`);
    }
  }

  // ─── Build PDF pages ────────────────────────────────────

  const LINES_PER_PAGE = 42;
  const FIRST_PAGE_LINES = 30;

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

      // Separator
      stream += `
0.85 0.85 0.87 RG
0.5 w
50 752 m 545 752 l S
`;

      // Roadmap title
      stream += `
BT
/F1 16 Tf
50 730 Td
(Roadmap : ${title}) Tj
/F2 10 Tf
0 -18 Td
(Date de creation : ${dateCreated}) Tj
ET
`;

      // Client info box
      stream += `
0.96 0.96 0.97 rg
380 720 165 -40 re f
0 0 0 rg
BT
/F1 10 Tf
390 710 Td
(CLIENT) Tj
/F2 9 Tf
0 -14 Td
(${clientName}) Tj
ET
`;

      // Progress bar area
      const barY = 678;
      const barWidth = 200;
      const fillWidth = Math.round((progressPercent / 100) * barWidth);

      // Background bar
      stream += `
0.92 0.92 0.93 rg
50 ${barY} ${barWidth} 8 re f
`;

      // Fill bar (red = primary)
      if (fillWidth > 0) {
        stream += `
0.94 0.17 0.17 rg
50 ${barY} ${fillWidth} 8 re f
`;
      }

      stream += `
0 0 0 rg
BT
/F1 10 Tf
${50 + barWidth + 10} ${barY} Td
(${progressPercent}% termine) Tj
ET
`;

      // Separator
      stream += `
0.85 0.85 0.87 RG
0.5 w
50 665 m 545 665 l S
`;

      // Content
      let y = 650;
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

        // Detect checkbox items
        const isCheckbox = line.match(/^\[.\]/);
        const fontCmd = isCheckbox ? "/F1 9 Tf" : "/F2 9 Tf";

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
      // Continuation pages
      stream += `
BT
/F2 8 Tf
0.5 0.5 0.5 rg
50 800 Td
(Roadmap : ${title} - Page ${pageIdx + 1}) Tj
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

        const isCheckbox = line.match(/^\[.\]/);
        const fontCmd = isCheckbox ? "/F1 9 Tf" : "/F2 9 Tf";

        stream += `
BT
${fontCmd}
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
(Off-Market - Roadmap generee automatiquement - Page ${pageIdx + 1}/${pages.length}) Tj
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

    // Fetch roadmap
    const { data: roadmap, error: roadmapError } = await supabase
      .from("client_roadmaps")
      .select(
        "*, client:profiles!client_roadmaps_client_id_fkey(id, full_name, avatar_url)",
      )
      .eq("id", id)
      .single();

    if (roadmapError || !roadmap) {
      return NextResponse.json(
        { error: "Roadmap introuvable" },
        { status: 404 },
      );
    }

    // Auth check: must be the client, or admin/coach
    const isOwner = roadmap.client_id === user.id;
    if (!isOwner) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roles || !["admin", "coach"].includes(roles.role)) {
        return NextResponse.json({ error: "Non autorise" }, { status: 403 });
      }
    }

    // Fetch milestones
    const { data: milestones, error: milError } = await supabase
      .from("roadmap_milestones")
      .select("*")
      .eq("roadmap_id", id)
      .order("order_index", { ascending: true });

    if (milError) throw milError;

    const roadmapData: RoadmapData = {
      ...roadmap,
      milestones: milestones ?? [],
    };

    const pdfBuffer = generateRoadmapPDF(roadmapData);
    const fileName = `roadmap-${roadmap.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Roadmap PDF generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du PDF" },
      { status: 500 },
    );
  }
}
