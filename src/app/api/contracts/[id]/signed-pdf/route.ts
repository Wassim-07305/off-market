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
    // These coordinates are approximate for the PDF layout — adjust as needed
    firstPage.drawText(clientName, {
      x: 340,
      y: 510,
      size: 10,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });

    if (clientAddress) {
      firstPage.drawText(clientAddress, {
        x: 340,
        y: 494,
        size: 10,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    if (clientCity) {
      firstPage.drawText(clientCity, {
        x: 340,
        y: 478,
        size: 10,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
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

      // "Lu et approuve" + client name in the signature box (right side)
      lastPage.drawText("Lu et approuve", {
        x: 340,
        y: 238,
        size: 9,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });

      // Signer name (typed signature)
      const signerName = sigData?.signer_name ?? clientName;
      lastPage.drawText(signerName, {
        x: 340,
        y: 218,
        size: 12,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Date
      if (signedDate) {
        lastPage.drawText(`Signe le ${signedDate}`, {
          x: 340,
          y: 200,
          size: 8,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      // If there's a signature image (canvas), embed it
      if (contract.signature_image) {
        try {
          const sigImageBytes = Buffer.from(
            contract.signature_image.replace(/^data:image\/\w+;base64,/, ""),
            "base64",
          );
          const sigImage = await pdfDoc.embedPng(sigImageBytes);
          const sigDims = sigImage.scale(0.3);
          lastPage.drawImage(sigImage, {
            x: 340,
            y: 160,
            width: Math.min(sigDims.width, 150),
            height: Math.min(sigDims.height, 50),
          });
        } catch {
          // If image embedding fails, skip it
        }
      }

      // Fill in the date field "Fait a Plaisance du Touch, le ..."
      lastPage.drawText(signedDate, {
        x: 270,
        y: 310,
        size: 10,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
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
