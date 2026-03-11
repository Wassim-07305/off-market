"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";

interface ReportExportProps {
  title: string;
  period: string;
  sections: {
    title: string;
    rows: { label: string; value: string }[];
  }[];
}

export function ReportExportButton({
  title,
  period,
  sections,
}: ReportExportProps) {
  const [generating, setGenerating] = useState(false);

  const handleExport = () => {
    setGenerating(true);

    const sectionHtml = sections
      .map(
        (s) => `
        <div class="section">
          <h2>${s.title}</h2>
          <table>
            <tbody>
              ${s.rows.map((r) => `<tr><td class="label">${r.label}</td><td class="value">${r.value}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>${title} - Rapport</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 32px; }
    .header h1 { font-size: 24px; font-weight: 700; }
    .header .meta { display: flex; gap: 20px; margin-top: 6px; font-size: 12px; color: #666; }
    .section { margin-bottom: 28px; }
    .section h2 { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e5e5; }
    table { width: 100%; border-collapse: collapse; }
    tr { border-bottom: 1px solid #f0f0f0; }
    tr:last-child { border-bottom: none; }
    td { padding: 8px 0; font-size: 13px; }
    td.label { color: #555; width: 60%; }
    td.value { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #999; text-align: center; }
    @media print {
      body { padding: 20px; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">
      <span>Periode : ${period}</span>
      <span>Genere le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
    </div>
  </div>
  ${sectionHtml}
  <div class="footer">
    Off Market — Rapport genere automatiquement
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
    setGenerating(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={generating}
      className="h-9 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-2"
    >
      {generating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <FileText className="w-3.5 h-3.5" />
      )}
      Exporter PDF
    </button>
  );
}
