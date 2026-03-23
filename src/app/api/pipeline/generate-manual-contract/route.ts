import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generates a contract for a manual prospect (no profile on the platform).
 * Returns the contract content as HTML that can be downloaded/shared.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { contactId } = await request.json();
  if (!contactId) {
    return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get contact info
  const { data: contact } = await admin
    .from("crm_contacts")
    .select("id, full_name, email, phone, estimated_value, converted_profile_id")
    .eq("id", contactId)
    .single();

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  // Find default template
  const { data: template } = await admin
    .from("contract_templates")
    .select("id, title, content")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!template) {
    return NextResponse.json(
      { error: "Aucun template de contrat actif" },
      { status: 404 },
    );
  }

  // Replace variables
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const price = Number(contact.estimated_value ?? 0);
  let content = template.content as string;
  content = content.replace(/\{\{client_name\}\}/g, contact.full_name ?? "");
  content = content.replace(/\{\{client_email\}\}/g, contact.email ?? "");
  content = content.replace(/\{\{date\}\}/g, dateStr);
  content = content.replace(
    /\{\{montant\}\}/g,
    `${price.toLocaleString("fr-FR")} EUR`,
  );

  // If prospect has a profile, create a real contract in DB
  if (contact.converted_profile_id) {
    const { data: newContract, error: insertErr } = await admin
      .from("contracts")
      .insert({
        template_id: template.id,
        client_id: contact.converted_profile_id,
        title: `${template.title} — ${price.toLocaleString("fr-FR")} EUR`,
        content,
        status: "sent",
        sent_at: now.toISOString(),
      })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      contractId: newContract?.id,
      mode: "platform",
      message: "Contrat envoye sur la plateforme",
    });
  }

  // No profile — return contract HTML for manual sending
  const fullHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${template.title} — ${contact.full_name}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { color: #AF0000; border-bottom: 2px solid #AF0000; padding-bottom: 10px; }
    .info { background: #f8f8f8; padding: 16px; border-radius: 8px; margin: 20px 0; }
    .amount { font-size: 1.4em; font-weight: bold; color: #AF0000; }
    .signature { margin-top: 60px; display: flex; gap: 40px; }
    .signature div { flex: 1; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <h1>${template.title}</h1>
  <div class="info">
    <p><strong>Client :</strong> ${contact.full_name}</p>
    <p><strong>Email :</strong> ${contact.email ?? "Non renseigne"}</p>
    <p><strong>Telephone :</strong> ${contact.phone ?? "Non renseigne"}</p>
    <p><strong>Date :</strong> ${dateStr}</p>
    <p class="amount">Montant : ${price.toLocaleString("fr-FR")} EUR</p>
  </div>
  ${content}
  <div class="signature">
    <div>Signature du client</div>
    <div>Signature Off Market</div>
  </div>
</body>
</html>`;

  return NextResponse.json({
    success: true,
    mode: "manual",
    html: fullHtml,
    fileName: `contrat-${contact.full_name.replace(/\s+/g, "-").toLowerCase()}-${dateStr.replace(/\s+/g, "-")}.html`,
    message: "Contrat généré — telechargez et envoyez au prospect",
  });
}
