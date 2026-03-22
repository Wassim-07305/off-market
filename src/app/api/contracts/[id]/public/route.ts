import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    const { data: contract, error } = await admin
      .from("contracts")
      .select(
        "id, title, content, status, signed_at, expires_at, created_at, signature_data, signature_image, client_id",
      )
      .eq("id", id)
      .single();

    if (error || !contract) {
      return NextResponse.json(
        { error: "Contrat introuvable" },
        { status: 404 },
      );
    }

    // Fetch client name
    let clientName: string | null = null;
    if (contract.client_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", contract.client_id)
        .single();
      clientName = profile?.full_name ?? null;
    }

    return NextResponse.json({
      ...contract,
      client: clientName ? { full_name: clientName } : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
