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

    if (!signature_image || typeof signature_image !== "string") {
      return NextResponse.json(
        { error: "Signature manquante" },
        { status: 400 },
      );
    }

    // Validate signature size (max 5MB) and format
    const MAX_SIGNATURE_SIZE = 5 * 1024 * 1024;
    if (signature_image.length > MAX_SIGNATURE_SIZE) {
      return NextResponse.json(
        { error: "Signature trop volumineuse" },
        { status: 413 },
      );
    }

    if (!signature_image.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Format de signature invalide" },
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

    // Notifier tous les admins de la signature
    try {
      const { data: contract } = await supabase
        .from("contracts")
        .select(
          "title, client_id, client:profiles!contracts_client_id_fkey(full_name)",
        )
        .eq("id", id)
        .single();

      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      if (admins && admins.length > 0) {
        const client = contract?.client as unknown as {
          full_name: string;
        } | null;
        const clientName = client?.full_name ?? "Un client";
        const contractTitle = contract?.title ?? "Contrat";

        const notifications = admins.map((admin: { id: string }) => ({
          recipient_id: admin.id,
          type: "contract_signed",
          title: "Contrat signe",
          body: `${clientName} a signe le contrat "${contractTitle}"`,
          data: { contract_id: id, client_id: contract?.client_id },
          action_url: `/admin/billing`,
        }));

        await supabase.from("notifications").insert(notifications);
      }
    } catch (notifError) {
      // Ne pas bloquer la reponse si la notification echoue
      console.error("Notification error after contract sign:", notifError);
    }

    return NextResponse.json({ success: true, signed_at: now });
  } catch (error) {
    console.error("Contract sign error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
