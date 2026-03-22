import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const REVENUE_MAP: Record<string, number> = {
  // Keys matching frontend REVENUE_RANGES values (about-you-step.tsx)
  "0-1k": 500,
  "1k-3k": 2000,
  "3k-5k": 4000,
  "5k-10k": 7500,
  "10k+": 15000,
  // Legacy keys (keep for backwards compatibility with existing data)
  "0-1000": 500,
  "1000-3000": 2000,
  "3000-5000": 4000,
  "5000-10000": 7500,
  "10000+": 15000,
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { business_type, current_revenue, goals, how_found_alexia } =
    await request.json();

  const admin = createAdminClient();

  // 1. Save onboarding_answers in profiles (JSONB)
  const { error: profileErr } = await admin
    .from("profiles")
    .update({
      onboarding_answers: {
        business_type,
        current_revenue,
        goals,
        how_found_alexia,
      },
    })
    .eq("id", user.id);

  if (profileErr) {
    console.error("[onboarding] Profile update error:", profileErr.message);
  }

  // 2. Upsert student_details with niche, source, goals, revenue
  const { error: detailsErr } = await admin.from("student_details").upsert(
    {
      profile_id: user.id,
      niche: business_type,
      acquisition_source: how_found_alexia,
      goals,
      current_revenue: REVENUE_MAP[current_revenue] ?? 0,
    },
    { onConflict: "profile_id" },
  );

  if (detailsErr) {
    console.error("[onboarding] Student details error:", detailsErr.message);
  }

  // 3. Mark about_you step completed
  await admin
    .from("onboarding_progress")
    .upsert(
      {
        user_id: user.id,
        step: "about_you",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,step", ignoreDuplicates: true },
    )
    .then(() => {});

  return NextResponse.json({
    success: true,
    saved: { business_type, current_revenue, goals, how_found_alexia },
    errors: {
      profile: profileErr?.message ?? null,
      details: detailsErr?.message ?? null,
    },
  });
}
