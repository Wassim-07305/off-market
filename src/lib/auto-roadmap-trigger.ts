/**
 * Auto-roadmap generation trigger.
 *
 * After a kickoff call is completed, this module checks whether the client
 * already has a roadmap.  If not it fires a request to the AI endpoint so a
 * personalised roadmap is generated automatically.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

/**
 * Check if a client already has an active roadmap.  If not, call the
 * `/api/ai/generate-roadmap` endpoint and persist the result.
 *
 * @returns `true` when a new roadmap was generated, `false` when one already
 *   existed or an error occurred.
 */
export async function triggerRoadmapGeneration(
  supabase: SupabaseClient,
  callId: string,
  clientId: string,
): Promise<boolean> {
  try {
    // 1. Check if client already has any active roadmap
    const { data: existing, error: checkError } = await (
      supabase as SupabaseClient
    )
      .from("client_roadmaps")
      .select("id")
      .eq("client_id", clientId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error(
        "[auto-roadmap] Error checking existing roadmap:",
        checkError,
      );
      return false;
    }

    if (existing) {
      // Client already has a roadmap — skip generation
      return false;
    }

    // 2. Call the AI generation endpoint
    const res = await fetch("/api/ai/generate-roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, callId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[auto-roadmap] Generation endpoint error:", err);
      return false;
    }

    const generated = await res.json();

    // 3. Persist — deactivate any old roadmaps then create the new one
    await (supabase as SupabaseClient)
      .from("client_roadmaps")
      .update({ is_active: false })
      .eq("client_id", clientId)
      .eq("is_active", true);

    // Get current user for created_by
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: roadmap, error: insertError } = await (
      supabase as SupabaseClient
    )
      .from("client_roadmaps")
      .insert({
        client_id: clientId,
        title: generated.title,
        description: generated.description ?? null,
        generated_from: "kickoff_call" as const,
        source_call_id: callId,
        created_by: user?.id ?? null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[auto-roadmap] Insert roadmap error:", insertError);
      return false;
    }

    // 4. Insert milestones
    if (generated.milestones?.length && roadmap) {
      const milestonesData = generated.milestones.map(
        (
          m: {
            title: string;
            description?: string;
            validation_criteria?: string[];
            order_index?: number;
          },
          i: number,
        ) => ({
          roadmap_id: roadmap.id,
          title: m.title,
          description: m.description ?? null,
          validation_criteria: m.validation_criteria ?? [],
          order_index: m.order_index ?? i,
        }),
      );

      const { error: milError } = await (supabase as SupabaseClient)
        .from("roadmap_milestones")
        .insert(milestonesData);

      if (milError) {
        console.error("[auto-roadmap] Insert milestones error:", milError);
      }
    }

    return true;
  } catch (error) {
    console.error("[auto-roadmap] Unexpected error:", error);
    return false;
  }
}

/**
 * Check whether a given call is the FIRST completed call for the client.
 */
export async function isFirstCompletedCall(
  supabase: SupabaseClient,
  callId: string,
  clientId: string,
): Promise<boolean> {
  try {
    const { data, error } = await (supabase as SupabaseClient)
      .from("call_calendar")
      .select("id")
      .eq("client_id", clientId)
      .eq("status", "realise")
      .order("date", { ascending: true })
      .limit(2);

    if (error) {
      console.error("[auto-roadmap] Error checking first call:", error);
      return false;
    }

    // If there's exactly 1 completed call and it matches the current one,
    // or if this is about to become the first completed call
    if (!data || data.length === 0) {
      // The current call hasn't been saved yet — treat as first
      return true;
    }

    if (data.length === 1 && data[0].id === callId) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
