import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

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

    const admin = createAdminClient();
    const { data: contract, error } = await admin
      .from("contracts")
      .select(
        "*, client:profiles!contracts_client_id_fkey(id, full_name, email)",
      )
      .eq("id", id)
      .single();

    if (error || !contract) {
      return NextResponse.json(
        { error: "Contrat introuvable" },
        { status: 404 },
      );
    }

    // Only allow the client or admin to download
    if (user && user.id !== contract.client_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin" && profile?.role !== "coach") {
        return NextResponse.json({ error: "Non autorise" }, { status: 403 });
      }
    }

    // Load the original styled PDF
    const pdfPath = path.join(
      process.cwd(),
      "public",
      "contrat-off-market.pdf",
    );
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const lastPage = pages[pages.length - 1];

    const sigData = contract.signature_data as Record<string, string> | null;
    const clientName = contract.client?.full_name ?? "Client";
    const clientAddress = sigData?.signer_address ?? "";
    const clientCity = sigData?.signer_city ?? "";

    // Fill in client info on first page (right column "LE CLIENT")
    // Page 1: encadré client - "Nom et Prénom:" label ends ~x=375, fields at y≈395/375/355
    firstPage.drawText(clientName, {
      x: 378,
      y: 393,
      size: 9,
      font: font,
      color: rgb(0.15, 0.15, 0.15),
    });

    if (clientAddress) {
      firstPage.drawText(clientAddress, {
        x: 348,
        y: 370,
        size: 9,
        font: font,
        color: rgb(0.15, 0.15, 0.15),
      });
    }

    if (clientCity) {
      firstPage.drawText(clientCity, {
        x: 390,
        y: 347,
        size: 9,
        font: font,
        color: rgb(0.15, 0.15, 0.15),
      });
    }

    // Add signature on last page
    if (contract.status === "signed") {
      const signedDate = contract.signed_at
        ? new Date(contract.signed_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";

      // Page 9: "Fait a Plaisance du Touch, le ___" — date after "le"
      lastPage.drawText(signedDate, {
        x: 208,
        y: 270,
        size: 9,
        font: font,
        color: rgb(0.15, 0.15, 0.15),
      });

      // Right box "Le Client" — "Lu et approuve" text
      const signerName = sigData?.signer_name ?? clientName;
      lastPage.drawText("Lu et approuve", {
        x: 320,
        y: 165,
        size: 8,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });

      // Signer name below "Lu et approuve"
      lastPage.drawText(signerName, {
        x: 320,
        y: 145,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      // If there's a signature image (canvas), embed it in the right box
      if (contract.signature_image) {
        try {
          const sigImageBytes = Buffer.from(
            contract.signature_image.replace(/^data:image\/\w+;base64,/, ""),
            "base64",
          );
          const sigImage = await pdfDoc.embedPng(sigImageBytes);
          // Scale to fit in the signature box (~160px wide, ~40px tall)
          const maxW = 140;
          const maxH = 40;
          const scale = Math.min(maxW / sigImage.width, maxH / sigImage.height);
          lastPage.drawImage(sigImage, {
            x: 320,
            y: 88,
            width: sigImage.width * scale,
            height: sigImage.height * scale,
          });
        } catch {
          // If image embedding fails, skip it
        }
      }

      // "Signe le" date under the signature
      lastPage.drawText(`Signe le ${signedDate}`, {
        x: 320,
        y: 75,
        size: 7,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();
    const fileName = `contrat-off-market-${clientName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`;

    return new NextResponse(modifiedPdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": modifiedPdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("[SignedPDF] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du PDF" },
      { status: 500 },
    );
  }
}
