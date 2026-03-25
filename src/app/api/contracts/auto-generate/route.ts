import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Génère automatiquement un contrat pour le client connecté.
 * Utilisé lors de l'onboarding prospect.
 * Si un contrat draft/sent existe déjà, le retourne sans en créer un nouveau.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Récupérer le profil du client connecté
    const { data: profile } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("id", user.id)
      .single();

    const clientName = profile?.full_name ?? "Client";

    // Vérifier si un contrat draft ou sent existe déjà pour ce client
    const { data: existingContract } = await admin
      .from("contracts")
      .select("id")
      .eq("client_id", user.id)
      .in("status", ["draft", "sent"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingContract) {
      return NextResponse.json({ contract_id: existingContract.id });
    }

    // Récupérer le template d'accompagnement actif
    const { data: template } = await admin
      .from("contract_templates")
      .select("id, title, content")
      .ilike("title", "%Accompagnement%")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!template) {
      return NextResponse.json(
        { error: "Aucun template de contrat actif trouvé" },
        { status: 404 },
      );
    }

    // Formater la date en français
    const dateStr = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    // Remplacer les variables dans le contenu du template
    let content = template.content as string;
    content = content.replace(/\{\{client_name\}\}/g, clientName);
    content = content.replace(/\{\{client_address\}\}/g, "À compléter");
    content = content.replace(/\{\{client_city\}\}/g, "À compléter");
    content = content.replace(/\{\{date\}\}/g, dateStr);

    // Insérer le contrat
    const { data: newContract, error: insertError } = await admin
      .from("contracts")
      .insert({
        template_id: template.id,
        client_id: user.id,
        title: template.title,
        content,
        status: "sent",
        sent_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[contracts/auto-generate] Insert error:", insertError);
      return NextResponse.json(
        { error: "Erreur lors de la création du contrat" },
        { status: 500 },
      );
    }

    return NextResponse.json({ contract_id: newContract.id });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
