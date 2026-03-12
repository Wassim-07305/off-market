import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { contractSignEmail } from "@/lib/email/templates";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { data: contract, error } = await supabase
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

    if (!contract.client?.email) {
      return NextResponse.json(
        { error: "Email client manquant" },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const signUrl = `${appUrl}/contracts/${contract.id}/sign`;

    const formatDate = (d: string | null) => {
      if (!d) return "-";
      return new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const { subject, html } = contractSignEmail({
      clientName: contract.client.full_name ?? "Client",
      contractTitle: contract.title,
      createdDate: formatDate(contract.created_at),
      expiresDate: contract.expires_at ? formatDate(contract.expires_at) : null,
      signUrl,
    });

    const result = await sendEmail({
      to: contract.client.email,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Echec de l'envoi de l'email" },
        { status: 500 },
      );
    }

    // Update contract status to "sent" if still draft
    if (contract.status === "draft") {
      await supabase
        .from("contracts")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send contract email error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
