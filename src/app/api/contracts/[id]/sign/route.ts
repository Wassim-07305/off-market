import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signature_image, signer_name } = body;

    if (!signature_image) {
      return NextResponse.json(
        { error: "Signature manquante" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Verify contract exists and is in "sent" status
    const { data: contract, error: fetchError } = await admin
      .from("contracts")
      .select("id, title, status, client_id")
      .eq("id", id)
      .single();

    if (fetchError || !contract) {
      return NextResponse.json(
        { error: "Contrat introuvable" },
        { status: 404 },
      );
    }

    if (contract.status !== "sent") {
      return NextResponse.json(
        { error: "Ce contrat ne peut pas etre signe (statut actuel : " + contract.status + ")" },
        { status: 400 },
      );
    }

    // Build signature metadata
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const signedAt = new Date().toISOString();

    // Update the contract
    const { error: updateError } = await admin
      .from("contracts")
      .update({
        status: "signed",
        signed_at: signedAt,
        signature_image,
        signature_data: {
          ip,
          user_agent: userAgent,
          signed_at: signedAt,
          signer_name: signer_name || null,
        },
      })
      .eq("id", id);

    if (updateError) {
      console.error("[contracts/sign] Update error:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la signature" },
        { status: 500 },
      );
    }

    // Notify admins (inline, same pattern as on-signed route)
    try {
      // Extract amount from title
      const amountMatch = contract.title?.match(/([\d\s,.]+)\s*EUR/);
      let amount = 0;
      if (amountMatch) {
        amount = Number(amountMatch[1].replace(/\s/g, "").replace(",", "."));
      }

      // Get client name
      let clientName = signer_name || "Un prospect";
      if (contract.client_id) {
        const { data: clientProfile } = await admin
          .from("profiles")
          .select("full_name")
          .eq("id", contract.client_id)
          .single();
        if (clientProfile?.full_name) {
          clientName = clientProfile.full_name;
        }
      }

      // Send notifications to admins
      const { data: admins } = await admin
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      if (admins?.length) {
        await admin.from("notifications").insert(
          admins.map((a) => ({
            recipient_id: a.id,
            type: "system",
            title: "Contrat signe !",
            body: `${clientName} a signe son contrat${amount > 0 ? ` (${amount.toLocaleString("fr-FR")} EUR)` : ""}. Creez une facture pour encaisser le paiement.`,
            data: { link: "/admin/billing" },
          })),
        );
      }
    } catch {
      console.error("[contracts/sign] Admin notification skipped");
    }

    return NextResponse.json({ success: true, signed_at: signedAt });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
