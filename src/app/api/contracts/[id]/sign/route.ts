import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public API — no auth required. Used by the public signing page.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { signature_image } = body as { signature_image: string };

    if (!signature_image) {
      return NextResponse.json(
        { error: "Signature manquante" },
        { status: 400 },
      );
    }

    // Use admin client since this is a public endpoint (no user session)
    const supabase = createAdminClient();

    // Fetch the contract
    const { data: contract, error: fetchError } = await supabase
      .from("contracts")
      .select("id, status")
      .eq("id", id)
      .single();

    if (fetchError || !contract) {
      return NextResponse.json(
        { error: "Contrat introuvable" },
        { status: 404 },
      );
    }

    if (contract.status === "signed") {
      return NextResponse.json(
        { error: "Ce contrat est deja signe" },
        { status: 400 },
      );
    }

    if (contract.status !== "sent") {
      return NextResponse.json(
        {
          error:
            "Ce contrat ne peut pas etre signe (statut: " +
            contract.status +
            ")",
        },
        { status: 400 },
      );
    }

    // Record signature with metadata
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const userAgent = req.headers.get("user-agent") ?? "unknown";
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("contracts")
      .update({
        status: "signed",
        signed_at: now,
        signature_image,
        signature_data: {
          signed_at: now,
          ip_address: ip,
          user_agent: userAgent,
        },
      })
      .eq("id", id);

    if (updateError) {
      console.error("Contract sign error:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la signature" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, signed_at: now });
  } catch (error) {
    console.error("Contract sign error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
