import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public API — no auth required. Returns contract data for signing page.
// Only returns contracts with status "sent" or "signed" (never draft or cancelled content).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: contract, error } = await supabase
      .from("contracts")
      .select(
        "id, title, content, status, signature_image, signature_data, signed_at, created_at, expires_at, client:profiles!contracts_client_id_fkey(id, full_name, email, avatar_url)",
      )
      .eq("id", id)
      .single();

    if (error || !contract) {
      return NextResponse.json(
        { error: "Contrat introuvable" },
        { status: 404 },
      );
    }

    // Only expose sent or signed contracts publicly
    if (contract.status !== "sent" && contract.status !== "signed") {
      return NextResponse.json(
        { error: "Ce contrat n'est pas disponible" },
        { status: 403 },
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Public contract fetch error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
