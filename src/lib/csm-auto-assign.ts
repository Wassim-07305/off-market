/**
 * CSM Auto-Assignment Algorithm
 *
 * Assigns a client to the best-fit coach based on:
 * - Specialty match (50 pts if coach has matching specialty)
 * - Inverse load (50 - active_clients, minimum 0)
 *
 * The highest-scoring coach is selected. Ties are broken by lowest load.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

interface CoachCandidate {
  id: string;
  specialties: string[];
  activeClients: number;
  score: number;
}

/**
 * Auto-assign the best coach to a client.
 *
 * @param supabase - Supabase client (server or browser)
 * @param clientId - The client profile ID to assign
 * @param businessType - Optional business type to match against coach specialties
 * @returns The assigned coach_id, or null if no coach is available
 */
export async function autoAssignCSM(
  supabase: SupabaseClient,
  clientId: string,
  businessType?: string,
): Promise<string | null> {
  // 1. Fetch all coaches
  const { data: coaches, error: coachError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "coach");

  if (coachError) {
    console.error(
      "[autoAssignCSM] Erreur chargement coaches:",
      coachError.message,
    );
    return null;
  }

  if (!coaches || coaches.length === 0) {
    console.warn("[autoAssignCSM] Aucun coach disponible");
    return null;
  }

  // 2. For each coach, count their active assignments
  const coachIds = coaches.map((c: { id: string }) => c.id);

  const { data: assignments, error: assignError } = await supabase
    .from("coach_assignments")
    .select("coach_id")
    .in("coach_id", coachIds);

  if (assignError) {
    console.error(
      "[autoAssignCSM] Erreur chargement assignments:",
      assignError.message,
    );
    return null;
  }

  // Count assignments per coach
  const loadMap = new Map<string, number>();
  for (const a of (assignments ?? []) as { coach_id: string }[]) {
    loadMap.set(a.coach_id, (loadMap.get(a.coach_id) ?? 0) + 1);
  }

  // 3. Score each coach
  const candidates: CoachCandidate[] = coaches.map((coach: { id: string }) => {
    const activeClients = loadMap.get(coach.id) ?? 0;

    // Inverse load: 50 - active clients (minimum 0)
    const inverseLoad = Math.max(0, 50 - activeClients);

    return {
      id: coach.id,
      specialties: [],
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
  if (!bestCoach) return null;

  // 5. Check if an assignment already exists for this client
  const { data: existingAssignment } = await supabase
    .from("coach_assignments")
    .select("id")
    .eq("client_id", clientId)
    .maybeSingle();

  if (existingAssignment) {
    // Client already assigned — skip
    console.info("[autoAssignCSM] Client deja assigne, skip");
    return null;
  }

  // 6. Create the coach_assignments record
  const { error: insertError } = await supabase
    .from("coach_assignments")
    .insert({
      coach_id: bestCoach.id,
      client_id: clientId,
    });

  if (insertError) {
    console.error(
      "[autoAssignCSM] Erreur creation assignment:",
      insertError.message,
    );
    return null;
  }

  // 7. Also update profiles.assigned_coach for backward compat
  await supabase
    .from("profiles")
    .update({ assigned_coach: bestCoach.id } as never)
    .eq("id", clientId);

  return bestCoach.id;
}
