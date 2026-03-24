import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { withErrorLogging } from "@/lib/error-logger-server";

const captureSchema = z.object({
  full_name: z.string().min(2, "Le nom est requis").max(200, "Nom trop long"),
  email: z.string().email("Email invalide").max(320, "Email trop long"),
  phone: z.string().max(30, "Numéro trop long").optional().default(""),
  company: z
    .string()
    .max(200, "Nom d'entreprise trop long")
    .optional()
    .default(""),
  revenue_range: z.enum(["less_5k", "5k_10k", "10k_20k", "20k_plus"]),
  goals: z.string().max(2000, "Texte trop long").optional().default(""),
});

function calculateQualificationScore(
  data: z.infer<typeof captureSchema>,
): number {
  let score = 0;

  // Revenue-based scoring
  if (data.revenue_range === "20k_plus") score += 40;
  else if (data.revenue_range === "10k_20k") score += 40;
  else if (data.revenue_range === "5k_10k") score += 20;
  else score += 5;

  // Phone provided
  if (data.phone && data.phone.length > 0) score += 15;

  // Goals detail richness
  if (data.goals && data.goals.length > 50) score += 15;
  else if (data.goals && data.goals.length > 20) score += 8;

  // Company name provided
  if (data.company && data.company.length > 0) score += 10;

  // Email domain check (non-free email = more likely business)
  const freeProviders = [
    "gmail.com",
    "hotmail.com",
    "yahoo.com",
    "outlook.com",
    "live.com",
    "orange.fr",
    "free.fr",
    "sfr.fr",
  ];
  const domain = data.email.split("@")[1]?.toLowerCase();
  if (domain && !freeProviders.includes(domain)) score += 20;

  return Math.min(score, 100);
}

async function postHandler(request: Request) {
  try {
    const body = await request.json();
    const parsed = captureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Donnees invalides",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const qualificationScore = calculateQualificationScore(data);

    // Map revenue_range to estimated value
    const estimatedValueMap: Record<string, number> = {
      less_5k: 2000,
      "5k_10k": 5000,
      "10k_20k": 12000,
      "20k_plus": 25000,
    };

    const supabase = createAdminClient();

    // Check for duplicate email
    const { data: existing } = await supabase
      .from("crm_contacts")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();

    // Return generic success to prevent email enumeration
    if (existing) {
      return NextResponse.json(
        { success: true, id: existing.id, score: 0 },
        { status: 201 },
      );
    }

    const { data: contact, error } = await supabase
      .from("crm_contacts")
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        source: "lead_magnet",
        stage: "prospect",
        estimated_value: estimatedValueMap[data.revenue_range] ?? 0,
        lead_score: qualificationScore,
        qualification_score: qualificationScore,
        revenue_range: data.revenue_range,
        goals: data.goals || null,
        notes: data.goals ? `Objectifs: ${data.goals}` : null,
        captured_at: new Date().toISOString(),
        tags: ["lead_magnet"],
      })
      .select("id")
      .single();

    if (error) {
      console.error("Lead capture insert error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, id: contact.id, score: qualificationScore },
      { status: 201 },
    );
  } catch (err) {
    console.error("Lead capture error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export const POST = withErrorLogging("/api/leads/capture", postHandler);
