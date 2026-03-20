import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/assign-coach
 * Auto-assigns a coach to a client, bypassing RLS using admin client.
 * Called from browser-side hooks (use-onboarding, etc.)
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

    // Verify the user is authenticated
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

    // Use admin client to bypass RLS
    const admin = createAdminClient();

    // 1. Fetch all coaches
    const { data: coaches, error: coachError } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("role", "coach");

    if (coachError) {
      console.error(
        "[assign-coach API] Erreur chargement coaches:",
        coachError.message,
      );
      return NextResponse.json(
        { error: "Erreur lors du chargement des coaches" },
        { status: 500 },
      );
    }

    if (!coaches || coaches.length === 0) {
      console.warn("[assign-coach API] Aucun coach disponible");
      return NextResponse.json(
        { coach_id: null, message: "Aucun coach disponible" },
        { status: 200 },
      );
    }

    // 2. Count active assignments per coach
    const coachIds = coaches.map((c: { id: string }) => c.id);
    const { data: assignments, error: assignError } = await admin
      .from("coach_assignments")
      .select("coach_id")
      .in("coach_id", coachIds);

    if (assignError) {
      console.error(
        "[assign-coach API] Erreur chargement assignments:",
        assignError.message,
      );
      return NextResponse.json(
        { error: "Erreur lors du chargement des assignments" },
        { status: 500 },
      );
    }

    // Count assignments per coach
    const loadMap = new Map<string, number>();
    for (const a of (assignments ?? []) as { coach_id: string }[]) {
      loadMap.set(a.coach_id, (loadMap.get(a.coach_id) ?? 0) + 1);
    }

    // 3. Score each coach
    interface CoachCandidate {
      id: string;
      activeClients: number;
      score: number;
    }

    const candidates: CoachCandidate[] = coaches.map((coach: { id: string }) => {
      const activeClients = loadMap.get(coach.id) ?? 0;
      const inverseLoad = Math.max(0, 50 - activeClients);

      return {
        id: coach.id,
        activeClients,
        score: inverseLoad,
      };
    });

    // 4. Sort by score (desc), then by load (asc) for tie-breaking
    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.activeClients - b.activeClients;
    });

    const bestCoach = candidates[0];
    if (!bestCoach) {
      return NextResponse.json(
        { coach_id: null, message: "Aucun coach disponible" },
        { status: 200 },
      );
    }

    // 5. Check if assignment already exists
    const { data: existingAssignment } = await admin
      .from("coach_assignments")
      .select("id")
      .eq("client_id", client_id)
      .maybeSingle();

    if (existingAssignment) {
      console.info("[assign-coach API] Client deja assigne, skip");
      return NextResponse.json(
        { coach_id: bestCoach.id, message: "Client deja assigne" },
        { status: 200 },
      );
    }

    // 6. Create assignment (admin bypass)
    const { data: newAssignment, error: insertError } = await admin
      .from("coach_assignments")
      .insert({
        coach_id: bestCoach.id,
        client_id,
      })
      .select()
      .single();

    if (insertError) {
      console.error(
        "[assign-coach API] Erreur creation assignment:",
        insertError.message,
      );
      return NextResponse.json(
        { error: "Erreur lors de la création de l'assignment" },
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
      message: "Coach assigne avec succes",
    });
  } catch (error) {
    console.error("[assign-coach API] Erreur non geree:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 },
    );
  }
}
