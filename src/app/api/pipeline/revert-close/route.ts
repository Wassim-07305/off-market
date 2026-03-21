import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Reverts a closed deal: deletes the auto-generated contract and cancels commissions.
 * Called when a closer changes a closed deal's stage back to something else.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { contactId, newStage } = await request.json();
  if (!contactId) {
    return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get the contact's profile link
  const { data: contact } = await admin
    .from("crm_contacts")
    .select("converted_profile_id")
    .eq("id", contactId)
    .single();

  // Delete any auto-generated contract for this prospect (status = sent, not signed)
  if (contact?.converted_profile_id) {
    await admin
      .from("contracts")
      .delete()
      .eq("client_id", contact.converted_profile_id)
      .eq("status", "sent");
  }

  // Cancel commissions tied to this deal
  await admin
    .from("commissions")
    .update({ status: "cancelled" })
    .eq("sale_id", contactId);

  // Update the contact stage
  if (newStage) {
    await admin
      .from("crm_contacts")
      .update({ closer_stage: newStage })
      .eq("id", contactId);
  }

  return NextResponse.json({ success: true });
}
