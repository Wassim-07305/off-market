import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createCoachAssignmentSchema,
  updateCoachAssignmentSchema,
} from "@/lib/validations";

// GET /api/coach-assignments — List assignments (filtered by role)
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const coachId = searchParams.get("coach_id");
  const clientId = searchParams.get("client_id");

  let query = supabase
    .from("coach_assignments")
    .select(
      "*, coach:profiles!coach_assignments_coach_id_fkey(id, full_name, email, avatar_url), client:profiles!coach_assignments_client_id_fkey(id, full_name, email, avatar_url)"
    )
    .order("assigned_at", { ascending: false });

  // RLS handles row-level access, but we also scope the query per role
  if (profile.role === "coach") {
    query = query.eq("coach_id", user.id);
  } else if (profile.role === "client") {
    query = query.eq("client_id", user.id);
  } else if (!["admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (status) query = query.eq("status", status);
  if (coachId && profile.role === "admin") query = query.eq("coach_id", coachId);
  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/coach-assignments — Create a new assignment (admin only)
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Seuls les administrateurs peuvent créer des assignations" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = createCoachAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Verify coach role
  const { data: coachProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", parsed.data.coach_id)
    .single();

  if (coachProfile?.role !== "coach") {
    return NextResponse.json(
      { error: "L'utilisateur spécifié n'est pas un coach" },
      { status: 400 }
    );
  }

  // Verify client role
  const { data: clientProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", parsed.data.client_id)
    .single();

  if (clientProfile?.role !== "client") {
    return NextResponse.json(
      { error: "L'utilisateur spécifié n'est pas un client" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("coach_assignments")
    .insert({
      coach_id: parsed.data.coach_id,
      client_id: parsed.data.client_id,
      notes: parsed.data.notes ?? null,
    })
    .select(
      "*, coach:profiles!coach_assignments_coach_id_fkey(id, full_name, email, avatar_url), client:profiles!coach_assignments_client_id_fkey(id, full_name, email, avatar_url)"
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ce client est déjà assigné à ce coach" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/coach-assignments — Update an assignment (admin or assigned coach)
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateCoachAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Build the update object with only provided fields
  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  let query = supabase
    .from("coach_assignments")
    .update(updateData)
    .eq("id", parsed.data.id);

  // Coaches can only update their own assignments
  if (profile.role === "coach") {
    query = query.eq("coach_id", user.id);
  }

  const { data, error } = await query
    .select(
      "*, coach:profiles!coach_assignments_coach_id_fkey(id, full_name, email, avatar_url), client:profiles!coach_assignments_client_id_fkey(id, full_name, email, avatar_url)"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Assignation introuvable" }, { status: 404 });
  }

  return NextResponse.json(data);
}
