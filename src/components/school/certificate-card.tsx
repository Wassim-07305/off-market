"use client";

import { Award, Download, Calendar } from "lucide-react";
import type { Certificate } from "@/types/database";

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const date = new Date(certificate.issued_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDownload = () => {
    // Generate a printable certificate in a new window
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificat - ${escapeHtml(certificate.course_title)}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5; }
          .cert { width: 800px; padding: 60px; background: white; border: 3px solid #e5e5e5; position: relative; }
          .cert::before { content: ''; position: absolute; inset: 8px; border: 1px solid #e5e5e5; pointer-events: none; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: #666; margin-bottom: 8px; }
          .header h2 { font-size: 32px; font-weight: 700; color: #111; }
          .body { text-align: center; margin-bottom: 40px; }
          .body p { font-size: 16px; color: #555; margin-bottom: 12px; }
          .body .name { font-size: 28px; font-weight: 600; color: #111; margin: 20px 0; }
          .body .course { font-size: 20px; font-weight: 600; color: #111; }
          .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
          .footer .col { text-align: center; }
          .footer .label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
          .footer .value { font-size: 13px; color: #333; margin-top: 4px; }
          @media print { body { background: white; } .cert { border: none; } .cert::before { border-color: #ccc; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="header">
            <h1>Certificat de completion</h1>
            <h2>Off Market</h2>
          </div>
          <div class="body">
            <p>Ce certificat est decerne a</p>
            <div class="name">${escapeHtml(certificate.student_name)}</div>
            <p>pour avoir complete avec succes la formation</p>
            <div class="course">${escapeHtml(certificate.course_title)}</div>
            <p style="margin-top: 20px; font-size: 14px;">
              ${certificate.total_modules} module${certificate.total_modules > 1 ? "s" : ""} · ${certificate.total_lessons} lecon${certificate.total_lessons > 1 ? "s" : ""}
              ${certificate.quiz_average ? ` · Moyenne quiz : ${certificate.quiz_average}%` : ""}
            </p>
          </div>
          <div class="footer">
            <div class="col">
              <div class="label">Date</div>
              <div class="value">${date}</div>
            </div>
            <div class="col">
              <div class="label">Numero</div>
              <div class="value">${certificate.certificate_number}</div>
            </div>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <div
      className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <Award className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            {certificate.course_title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {certificate.total_modules} module
            {certificate.total_modules > 1 ? "s" : ""} ·{" "}
            {certificate.total_lessons} lecon
            {certificate.total_lessons > 1 ? "s" : ""}
            {certificate.quiz_average != null &&
              ` · Quiz ${certificate.quiz_average}%`}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {date}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {certificate.certificate_number}
            </span>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="h-8 px-3 rounded-lg text-xs font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          PDF
        </button>
      </div>
    </div>
  );
}
