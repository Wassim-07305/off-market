import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Called after a contract is signed.
 * Notifies admins so they can create the invoice manually.
 * CA only increases when the invoice is marked as "paid".
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { contractId } = await request.json();
  if (!contractId) {
    return NextResponse.json({ error: "Missing contractId" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get contract + client info
  const { data: contract } = await admin
    .from("contracts")
    .select("id, title, client_id, status")
    .eq("id", contractId)
    .single();

  if (!contract || contract.status !== "signed") {
    return NextResponse.json({ error: "Contract not found or not signed" }, { status: 400 });
  }

  // Extract amount from title
  const amountMatch = contract.title?.match(/([\d\s,.]+)\s*EUR/);
  let amount = 0;
  if (amountMatch) {
    amount = Number(amountMatch[1].replace(/\s/g, "").replace(",", "."));
  }

  // Get client name
  const { data: clientProfile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", contract.client_id)
    .single();

  const clientName = clientProfile?.full_name ?? "Un prospect";

  // Notify admins
  try {
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
    console.warn("[on-signed] Admin notification skipped");
  }

  return NextResponse.json({ success: true });
}
