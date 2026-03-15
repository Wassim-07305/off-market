"use client";

import { useRef } from "react";
import DOMPurify from "dompurify";
import { FileText, Printer, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContractPreviewProps {
  title: string;
  content: string;
  onPrint?: () => void;
}

export function ContractPreview({
  title,
  content,
}: ContractPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(title)}</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              color: #1a1a1a;
              line-height: 1.6;
            }
            h1, h2, h3 { font-family: 'Helvetica Neue', sans-serif; }
            h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { font-size: 18px; margin-top: 24px; }
            p { margin: 8px 0; }
            .signature-block { margin-top: 60px; display: flex; justify-content: space-between; }
            .signature-box { width: 45%; border-top: 1px solid #333; padding-top: 10px; }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          ${DOMPurify.sanitize(content)}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  function handleDownloadPDF() {
    // Use print dialog as PDF export (native browser capability)
    handlePrint();
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Apercu du contrat
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="h-3.5 w-3.5" />}
          >
            Imprimer
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadPDF}
            icon={<Download className="h-3.5 w-3.5" />}
          >
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={contentRef}
          className="prose prose-sm max-w-none border border-border/50 rounded-xl p-6 bg-white min-h-[400px]"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
      </CardContent>
    </Card>
  );
}
