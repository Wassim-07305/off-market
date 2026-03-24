import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withErrorLogging } from "@/lib/error-logger-server";

async function handler() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get profile data
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email, role, onboarding_answers")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "prospect") {
    return NextResponse.json({ error: "Not a prospect" }, { status: 400 });
  }

  const email = profile.email ?? user.email ?? "";
  const fullName = profile.full_name ?? user.user_metadata?.full_name ?? email;
  const answers = profile.onboarding_answers as Record<string, string> | null;

  try {
    // Check if a crm_contact with this email already exists
    const { data: existing } = await admin
      .from("crm_contacts")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      // Link existing contact to this profile
      const { error: updateError } = await admin
        .from("crm_contacts")
        .update({ converted_profile_id: user.id })
        .eq("id", existing.id);

      if (updateError) {
        console.error("[onboarding] CRM contact link error:", updateError.message);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: "linked", id: existing.id });
    }

    // Create new crm_contact
    const { data: contact, error } = await admin
      .from("crm_contacts")
      .insert({
        full_name: fullName,
        email,
        source: "website",
        stage: "prospect",
        converted_profile_id: user.id,
        goals: answers?.goals ?? null,
        revenue_range: answers?.current_revenue ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[onboarding] CRM contact creation error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: "created", id: contact.id });
  } catch (err) {
    console.error("[onboarding] CRM contact error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export const POST = withErrorLogging("/api/onboarding/create-crm-contact", handler);
