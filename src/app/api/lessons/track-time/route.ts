import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/lessons/track-time
 * Called via sendBeacon when user leaves a lesson page.
 * Adds elapsed seconds to the existing time_spent in lesson_progress.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lesson_id, student_id, elapsed_seconds } = body;

    if (!lesson_id || !student_id || !elapsed_seconds) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (typeof elapsed_seconds !== "number" || elapsed_seconds < 3) {
      return NextResponse.json({ error: "Invalid elapsed" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify the user is authenticated and matches
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== student_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current time_spent
    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("time_spent")
      .eq("lesson_id", lesson_id)
      .eq("student_id", student_id)
      .maybeSingle();

    const currentTime = existing?.time_spent ?? 0;
    const newTime = currentTime + elapsed_seconds;

    await supabase.from("lesson_progress").upsert(
      {
        student_id,
        lesson_id,
        time_spent: newTime,
        last_accessed_at: new Date().toISOString(),
      },
      { onConflict: "lesson_id,student_id" },
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
