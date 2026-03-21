import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { contactId, finalPrice } = await request.json();
  if (!contactId || !finalPrice) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Get contact info
  const { data: contact } = await admin
    .from("crm_contacts")
    .select("id, full_name, email, converted_profile_id, closer_id, created_by")
    .eq("id", contactId)
    .single();

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  // 2. Update contact: set final price + closer_stage = close
  await admin
    .from("crm_contacts")
    .update({
      closer_stage: "close",
      estimated_value: finalPrice,
    })
    .eq("id", contactId);

  // 3. Auto-generate contract if prospect has a profile
  let contractId: string | null = null;
  let contractError: string | null = null;
  const profileId = contact.converted_profile_id;

  if (!profileId) {
    contractError = "Pas de profil lie (converted_profile_id est null) — contrat non genere";
  } else {
    try {
      // Find default template
      const { data: template } = await admin
        .from("contract_templates")
        .select("id, title, content, variables")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!template) {
        contractError = "Aucun template de contrat actif trouve en base";
      } else {
        // Replace variables in template content
        const now = new Date();
        const dateStr = now.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        let content = template.content as string;
        content = content.replace(/\{\{client_name\}\}/g, contact.full_name ?? "");
        content = content.replace(/\{\{client_email\}\}/g, contact.email ?? "");
        content = content.replace(/\{\{date\}\}/g, dateStr);
        content = content.replace(
          /\{\{montant\}\}/g,
          `${Number(finalPrice).toLocaleString("fr-FR")} EUR`,
        );

        const { data: newContract, error: insertErr } = await admin
          .from("contracts")
          .insert({
            template_id: template.id,
            client_id: profileId,
            title: `${template.title} — ${Number(finalPrice).toLocaleString("fr-FR")} EUR`,
            content,
            status: "sent",
            sent_at: now.toISOString(),
          })
          .select("id")
          .single();

        if (insertErr) {
          console.error("[close-deal] Contract insert error:", insertErr);
          contractError = `Insert contrat echoue: ${insertErr.message}`;
        } else {
          contractId = newContract?.id ?? null;
        }
      }
    } catch (err) {
      console.error("[close-deal] Contract generation error:", err);
      contractError = String(err);
    }
  }

  // 4. Notify all admins
  try {
    const { data: admins } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (admins?.length) {
      const closerName = user.user_metadata?.full_name ?? user.email ?? "Un closer";
      const priceStr = Number(finalPrice).toLocaleString("fr-FR");
      const isManual = !profileId;

      let notifBody = `${closerName} a close ${contact.full_name} pour ${priceStr} EUR.`;
      if (contractId) {
        notifBody += " Contrat envoye automatiquement au prospect.";
      } else if (isManual) {
        notifBody += " ⚠️ Prospect non inscrit — contrat a envoyer manuellement (Pipeline Closer > cliquez sur le prospect).";
      } else if (contractError) {
        notifBody += ` Contrat non genere: ${contractError}`;
      }

      await admin.from("notifications").insert(
        admins.map((a) => ({
          recipient_id: a.id,
          type: "system",
          title: isManual ? "Deal close (non inscrit)" : "Deal close !",
          body: notifBody,
          data: { link: "/admin/crm" },
        })),
      );
    }
  } catch {
    console.warn("[close-deal] Admin notification skipped");
  }

  // 5. Create commissions
  try {
    const { count } = await admin
      .from("commissions")
      .select("id", { count: "exact", head: true })
      .eq("sale_id", contactId);

    if (!count || count === 0) {
      const saleAmount = Number(finalPrice);
      const entries: Array<Record<string, unknown>> = [];

      // Closer commission (10%)
      if (contact.closer_id) {
        const rate = 0.1;
        const commAmount = Math.round(saleAmount * rate * 100) / 100;
        entries.push({
          sale_id: contactId,
          contractor_id: contact.closer_id,
          contractor_role: "closer",
          sale_amount: saleAmount,
          commission_rate: rate,
          commission_amount: commAmount,
          percentage: rate * 100,
          amount: commAmount,
        });
      }

      // Setter commission (5%)
      if (contact.created_by && contact.created_by !== contact.closer_id) {
        const rate = 0.05;
        const commAmount = Math.round(saleAmount * rate * 100) / 100;
        entries.push({
          sale_id: contactId,
          contractor_id: contact.created_by,
          contractor_role: "setter",
          sale_amount: saleAmount,
          commission_rate: rate,
          commission_amount: commAmount,
          percentage: rate * 100,
          amount: commAmount,
        });
      }

      if (entries.length > 0) {
        await admin.from("commissions").insert(entries);
      }
    }
  } catch (err) {
    console.error("[close-deal] Commission error:", err);
  }

  return NextResponse.json({
    success: true,
    contractId,
    contractError,
    profileId,
    finalPrice,
  });
}
