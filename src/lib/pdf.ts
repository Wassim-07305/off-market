import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";

// Info business d'Alexia
const BUSINESS = {
  name: "Alexia Laneau",
  company: "Get Your Goals",
  email: "contact@get-your-goals.fr",
  address: "Paris, France",
  siret: "", // a remplir plus tard
};

const PRIMARY_COLOR: [number, number, number] = [59, 130, 246]; // #3b82f6

interface InvoicePDFData {
  invoice_number: string;
  client_name: string;
  client_email?: string;
  amount: number;
  tax: number;
  total: number;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  items?: Array<{ description: string; quantity: number; unit_price: number }>;
}

interface ContractPDFData {
  title: string;
  client_name: string;
  client_email?: string;
  content: string | null;
  amount?: number;
  duration?: string;
  conditions?: string;
  created_at: string;
}

export function generateInvoicePDF(invoice: InvoicePDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── En-tete ────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Titre FACTURE
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("FACTURE", 20, 30);

  // Numero facture
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text(`N° ${invoice.invoice_number}`, 20, 40);

  // Date emission
  doc.setFontSize(10);
  doc.text(`Date : ${formatDate(invoice.created_at)}`, 20, 48);

  if (invoice.due_date) {
    doc.text(`Echeance : ${formatDate(invoice.due_date)}`, 20, 55);
  }

  // ── Bloc emetteur (gauche) ─────────────────────
  const startY = 70;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("EMETTEUR", 20, startY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text(BUSINESS.name, 20, startY + 7);
  doc.text(BUSINESS.company, 20, startY + 14);
  doc.text(BUSINESS.email, 20, startY + 21);
  doc.text(BUSINESS.address, 20, startY + 28);
  if (BUSINESS.siret) {
    doc.text(`SIRET : ${BUSINESS.siret}`, 20, startY + 35);
  }

  // ── Bloc client (droite) ───────────────────────
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("CLIENT", 120, startY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text(invoice.client_name, 120, startY + 7);
  if (invoice.client_email) {
    doc.text(invoice.client_email, 120, startY + 14);
  }

  // ── Tableau des lignes ─────────────────────────
  const tableStartY = startY + 50;

  const items =
    invoice.items && invoice.items.length > 0
      ? invoice.items
      : [
          {
            description: "Prestation de coaching / accompagnement",
            quantity: 1,
            unit_price: invoice.amount,
          },
        ];

  const tableBody = items.map((item) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unit_price),
    formatCurrency(item.quantity * item.unit_price),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [["Description", "Qte", "Prix unitaire HT", "Total HT"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 20, right: 20 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? tableStartY + 50;

  // ── Totaux ─────────────────────────────────────
  const totalsX = 130;
  let totalsY = finalY + 15;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text("Sous-total HT :", totalsX, totalsY);
  doc.text(formatCurrency(invoice.amount), pageWidth - 20, totalsY, {
    align: "right",
  });

  totalsY += 8;
  doc.text(`TVA (${invoice.tax}%) :`, totalsX, totalsY);
  doc.text(
    formatCurrency((invoice.amount * invoice.tax) / 100),
    pageWidth - 20,
    totalsY,
    { align: "right" },
  );

  totalsY += 10;
  doc.setFillColor(248, 250, 252);
  doc.rect(totalsX - 5, totalsY - 6, pageWidth - totalsX - 10, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  doc.text("Total TTC :", totalsX, totalsY);
  doc.text(formatCurrency(invoice.total), pageWidth - 20, totalsY, {
    align: "right",
  });

  // ── Notes ──────────────────────────────────────
  if (invoice.notes) {
    totalsY += 20;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(107, 114, 128);
    doc.text("Notes :", 20, totalsY);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(noteLines, 20, totalsY + 7);
  }

  // ── Mentions legales ───────────────────────────
  const mentionsY = 265;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(156, 163, 175);
  doc.text(
    "Paiement a 30 jours. Pas d'escompte pour paiement anticipe. Penalite de retard : 3 fois le taux d'interet legal.",
    20,
    mentionsY,
  );
  doc.text(
    `${BUSINESS.company} - ${BUSINESS.name} - ${BUSINESS.email}`,
    20,
    mentionsY + 5,
  );

  // ── Footer ─────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, doc.internal.pageSize.getHeight() - 4, pageWidth, 4, "F");

  // Telecharger
  doc.save(`${invoice.invoice_number || "facture"}.pdf`);
}

export function generateContractPDF(contract: ContractPDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── En-tete ────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Titre
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("CONTRAT DE PRESTATION", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text(BUSINESS.company, pageWidth / 2, 34, { align: "center" });

  // Titre du contrat
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(contract.title, pageWidth / 2, 48, { align: "center" });

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Etabli le ${formatDate(contract.created_at, "long")}`,
    pageWidth / 2,
    56,
    { align: "center" },
  );

  // ── Parties ────────────────────────────────────
  let currentY = 70;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("ENTRE", 20, currentY);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(10);
  doc.text(`${BUSINESS.name}, ${BUSINESS.company}`, 20, currentY);
  currentY += 6;
  doc.text(`Adresse : ${BUSINESS.address}`, 20, currentY);
  currentY += 6;
  doc.text(`Email : ${BUSINESS.email}`, 20, currentY);
  if (BUSINESS.siret) {
    currentY += 6;
    doc.text(`SIRET : ${BUSINESS.siret}`, 20, currentY);
  }
  currentY += 4;
  doc.setTextColor(107, 114, 128);
  doc.text('Ci-apres denomme "le Prestataire"', 20, currentY + 4);

  currentY += 14;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("ET", 20, currentY);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(10);
  doc.text(contract.client_name, 20, currentY);
  if (contract.client_email) {
    currentY += 6;
    doc.text(`Email : ${contract.client_email}`, 20, currentY);
  }
  currentY += 4;
  doc.setTextColor(107, 114, 128);
  doc.text('Ci-apres denomme "le Client"', 20, currentY + 4);

  // ── Contenu / Articles ─────────────────────────
  currentY += 18;

  // Article 1 - Objet
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Article 1 - Objet du contrat", 20, currentY);
  currentY += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);

  if (contract.content) {
    const contentLines = doc.splitTextToSize(contract.content, pageWidth - 40);
    doc.text(contentLines, 20, currentY);
    currentY += contentLines.length * 5 + 5;
  } else {
    doc.text(
      "Prestation de coaching et accompagnement personnalise.",
      20,
      currentY,
    );
    currentY += 10;
  }

  // Article 2 - Duree
  if (contract.duration) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text("Article 2 - Duree", 20, currentY);
    currentY += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.text(
      `La duree de la prestation est de ${contract.duration}.`,
      20,
      currentY,
    );
    currentY += 10;
  }

  // Article 3 - Montant
  if (contract.amount) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(
      contract.duration ? "Article 3 - Montant" : "Article 2 - Montant",
      20,
      currentY,
    );
    currentY += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.text(
      `Le montant de la prestation est de ${formatCurrency(contract.amount)} TTC.`,
      20,
      currentY,
    );
    currentY += 10;
  }

  // Conditions particulieres
  if (contract.conditions) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text("Conditions particulieres", 20, currentY);
    currentY += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    const condLines = doc.splitTextToSize(contract.conditions, pageWidth - 40);
    doc.text(condLines, 20, currentY);
    currentY += condLines.length * 5 + 5;
  }

  // ── Zone signature ─────────────────────────────
  // S'assurer qu'il y a assez de place, sinon nouvelle page
  if (currentY > 220) {
    doc.addPage();
    currentY = 30;
  }

  currentY = Math.max(currentY + 10, 220);

  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.5);
  doc.line(20, currentY, pageWidth - 20, currentY);

  currentY += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);

  // Colonne gauche - Prestataire
  doc.text("Le Prestataire", 40, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.text(BUSINESS.name, 40, currentY + 7);
  doc.text("Signature :", 40, currentY + 20);
  doc.setDrawColor(209, 213, 219);
  doc.rect(30, currentY + 25, 60, 25);

  // Colonne droite - Client
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Le Client", 140, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.text(contract.client_name, 140, currentY + 7);
  doc.text("Signature :", 140, currentY + 20);
  doc.rect(130, currentY + 25, 60, 25);

  // ── Mentions legales ───────────────────────────
  const mentionsY = 270;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(156, 163, 175);
  doc.text(
    "Fait en deux exemplaires, dont un pour chaque partie. Chaque partie reconnait avoir recu un exemplaire.",
    pageWidth / 2,
    mentionsY,
    { align: "center" },
  );

  // ── Footer ─────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, doc.internal.pageSize.getHeight() - 4, pageWidth, 4, "F");

  // Telecharger
  const safeTitle = contract.title.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`contrat_${safeTitle}.pdf`);
}
