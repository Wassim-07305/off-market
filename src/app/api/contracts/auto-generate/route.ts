import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/contracts/auto-generate
 *
 * Auto-generates a contract for the authenticated user after onboarding.
 * Fetches the default active template, replaces variables with client info,
 * and inserts a contract with status "sent".
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const serverSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await serverSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    // Use admin client to bypass RLS for contract insertion
    const supabase = createAdminClient();

    // Check if a contract already exists for this client (avoid duplicates)
    const { data: existingContracts } = await supabase
      .from("contracts")
      .select("id")
      .eq("client_id", user.id)
      .limit(1);

    if (existingContracts && existingContracts.length > 0) {
      return NextResponse.json(
        {
          message: "Un contrat existe deja",
          contract_id: existingContracts[0].id,
        },
        { status: 200 },
      );
    }

    // Fetch client profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profil introuvable" },
        { status: 404 },
      );
    }

    // Fetch default active contract template
    const { data: template, error: templateError } = await supabase
      .from("contract_templates")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (templateError || !template) {
      console.error("No active contract template found:", templateError);
      return NextResponse.json(
        { error: "Aucun modele de contrat actif" },
        { status: 404 },
      );
    }

    // Format date in French
    const now = new Date();
    const frenchDate = now.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Extract default values from template variables
    const variables = (template.variables ?? []) as Array<{
      key: string;
      defaultValue?: string;
    }>;
    const defaults: Record<string, string> = {};
    for (const v of variables) {
      if (v.defaultValue) {
        defaults[v.key] = v.defaultValue;
      }
    }

    // Replace variables in template content
    const clientName = profile.full_name ?? user.email ?? "Client";
    const clientEmail = profile.email ?? user.email ?? "";

    let content = template.content as string;
    content = content.replace(/\{\{client_name\}\}/g, clientName);
    content = content.replace(/\{\{client_email\}\}/g, clientEmail);
    content = content.replace(/\{\{date\}\}/g, frenchDate);
    content = content.replace(
      /\{\{montant\}\}/g,
      defaults.montant ?? "4 000 EUR",
    );
    content = content.replace(/\{\{duree\}\}/g, defaults.duree ?? "4 mois");

    // Insert contract with status "sent"
    const { data: contract, error: insertError } = await supabase
      .from("contracts")
      .insert({
        template_id: template.id,
        client_id: user.id,
        title: template.title,
        content,
        status: "sent",
        sent_at: now.toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Contract insert error:", insertError);
      return NextResponse.json(
        { error: "Erreur lors de la creation du contrat" },
        { status: 500 },
      );
    }

    // Notify admins that a contract was generated
    try {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      if (admins && admins.length > 0) {
        await supabase.from("notifications").insert(
          admins.map((admin: { id: string }) => ({
            recipient_id: admin.id,
            type: "contract_generated",
            title: "Contrat genere automatiquement",
            body: `Un contrat a ete genere pour ${clientName} suite a la fin de l'onboarding.`,
            action_url: `/admin/billing`,
            data: { contract_id: contract.id, client_id: user.id },
          })),
        );
      }
    } catch (notifError) {
      // Non-critical
      console.warn("Admin notification skipped:", notifError);
    }

    return NextResponse.json({
      success: true,
      contract_id: contract.id,
    });
  } catch (error) {
    console.error("Auto-generate contract error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
