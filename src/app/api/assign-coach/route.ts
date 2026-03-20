import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/assign-coach
 * Smart coach assignment based on specialties + load balancing.
 *
 * Logic:
 * 1. If client chose a niche (business_type) that matches a coach's specialties
 *    → assign the matching coach with the fewest clients
 * 2. If client chose "other" or no coach matches their niche
 *    → assign the coach with the fewest clients overall
 */
export async function POST(request: NextRequest) {
  try {
    const { client_id, business_type } = await request.json();

    if (!client_id) {
      return NextResponse.json(
        { error: "client_id requis" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifie" },
        { status: 401 },
      );
    }

    const admin = createAdminClient();

    // 1. Check if already assigned
    const { data: existingAssignment } = await admin
      .from("coach_assignments")
      .select("id, coach_id")
      .eq("client_id", client_id)
      .maybeSingle();

    if (existingAssignment) {
      return NextResponse.json({
        coach_id: existingAssignment.coach_id,
        message: "Client deja assigne",
      });
    }

    // 2. Fetch all coaches with their specialties
    const { data: coaches, error: coachError } = await admin
      .from("profiles")
      .select("id, full_name, specialties")
      .eq("role", "coach");

    if (coachError || !coaches?.length) {
      return NextResponse.json({
        coach_id: null,
        message: "Aucun coach disponible",
      });
    }

    // 3. Count active assignments per coach
    const coachIds = coaches.map((c) => c.id);
    const { data: assignments } = await admin
      .from("coach_assignments")
      .select("coach_id")
      .in("coach_id", coachIds);

    const loadMap = new Map<string, number>();
    for (const a of (assignments ?? []) as { coach_id: string }[]) {
      loadMap.set(a.coach_id, (loadMap.get(a.coach_id) ?? 0) + 1);
    }

    // 4. Score each coach — specialty match + inverse load
    interface ScoredCoach {
      id: string;
      activeClients: number;
      matchesSpecialty: boolean;
      score: number;
    }

    const isOther = !business_type || business_type === "other";

    const scored: ScoredCoach[] = coaches.map((coach) => {
      const activeClients = loadMap.get(coach.id) ?? 0;
      const specs = (coach.specialties as string[] | null) ?? [];
      const matchesSpecialty = !isOther && specs.includes(business_type);

      // Specialty match = +100 points, then inverse load for tie-breaking
      const score = (matchesSpecialty ? 100 : 0) + Math.max(0, 50 - activeClients);

      return { id: coach.id, activeClients, matchesSpecialty, score };
    });

    // 5. Sort: specialty match first, then fewest clients
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.activeClients - b.activeClients;
    });

    const bestCoach = scored[0];
    if (!bestCoach) {
      return NextResponse.json({
        coach_id: null,
        message: "Aucun coach disponible",
      });
    }

    // 6. Create assignment
    const { data: newAssignment, error: insertError } = await admin
      .from("coach_assignments")
      .insert({
        coach_id: bestCoach.id,
        client_id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[assign-coach] Insert error:", insertError.message);
      return NextResponse.json(
        { error: "Erreur lors de l'assignment" },
        { status: 500 },
      );
    }

    // 7. Update profiles.assigned_coach for backward compat
    await admin
      .from("profiles")
      .update({ assigned_coach: bestCoach.id } as never)
      .eq("id", client_id);

    return NextResponse.json({
      coach_id: bestCoach.id,
      assignment: newAssignment,
      matched_by: bestCoach.matchesSpecialty ? "specialty" : "load_balance",
      message: bestCoach.matchesSpecialty
        ? "Coach assigne par specialite"
        : "Coach assigne par disponibilite",
    });
  } catch (error) {
    console.error("[assign-coach] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 },
    );
  }
}
