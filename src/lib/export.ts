// ─── CSV / EXCEL EXPORT UTILITIES ─────────────────────────────
// Lightweight export without external dependencies.
// CSV files open natively in Excel / Google Sheets / Numbers.

/**
 * Convert an array of objects to a CSV string.
 * Handles French characters, commas, quotes, and newlines.
 */
export function toCSV(
  rows: Record<string, unknown>[],
  columns: { key: string; label: string }[]
): string {
  const escape = (val: unknown): string => {
    const str = val === null || val === undefined ? "" : String(val);
    // Wrap in quotes if contains comma, newline, or quote
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escape(row[c.key])).join(","))
    .join("\n");

  return `${header}\n${body}`;
}

/**
 * Download a CSV string as a .csv file with BOM for Excel compatibility.
 */
export function downloadCSV(csv: string, filename: string) {
  // Add UTF-8 BOM so Excel detects encoding correctly
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Shortcut: convert data to CSV and trigger download.
 */
export function exportToCSV(
  rows: Record<string, unknown>[],
  columns: { key: string; label: string }[],
  filename: string
) {
  const csv = toCSV(rows, columns);
  downloadCSV(csv, filename);
}

/**
 * Generate and open a print-ready HTML report (PDF via browser print).
 */
export function exportToPDF(config: {
  title: string;
  subtitle?: string;
  sections: {
    title: string;
    rows: { label: string; value: string }[];
  }[];
}) {
  const sectionHtml = config.sections
    .map(
      (s) => `
      <div class="section">
        <h2>${s.title}</h2>
        <table>
          <tbody>
            ${s.rows.map((r) => `<tr><td class="label">${r.label}</td><td class="value">${r.value}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${config.title}</title>
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
    @media print { body { padding: 20px; } @page { margin: 1.5cm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${config.title}</h1>
    <div class="meta">
      ${config.subtitle ? `<span>${config.subtitle}</span>` : ""}
      <span>Genere le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
    </div>
  </div>
  ${sectionHtml}
  <div class="footer">Off Market — Rapport genere automatiquement</div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

/**
 * Generate and open a print-ready HTML table report (PDF via browser print).
 * For tabular data like form responses, invoices list, etc.
 */
export function exportTableToPDF(config: {
  title: string;
  subtitle?: string;
  columns: { key: string; label: string }[];
  rows: Record<string, unknown>[];
}) {
  const thHtml = config.columns
    .map((c) => `<th>${c.label}</th>`)
    .join("");
  const bodyHtml = config.rows
    .map(
      (row) =>
        `<tr>${config.columns.map((c) => `<td>${row[c.key] ?? "—"}</td>`).join("")}</tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${config.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #111; padding: 40px; max-width: 1000px; margin: 0 auto; }
    .header { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; font-weight: 700; }
    .header .meta { display: flex; gap: 20px; margin-top: 6px; font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { text-align: left; padding: 8px 6px; background: #f5f5f5; font-weight: 600; border-bottom: 2px solid #ddd; white-space: nowrap; }
    td { padding: 7px 6px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) { background: #fafafa; }
    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #999; text-align: center; }
    .count { font-size: 12px; color: #666; margin-bottom: 16px; }
    @media print { body { padding: 15px; } @page { margin: 1cm; size: landscape; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${config.title}</h1>
    <div class="meta">
      ${config.subtitle ? `<span>${config.subtitle}</span>` : ""}
      <span>Genere le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
    </div>
  </div>
  <p class="count">${config.rows.length} ligne(s)</p>
  <table>
    <thead><tr>${thHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table>
  <div class="footer">Off Market — Rapport genere automatiquement</div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
