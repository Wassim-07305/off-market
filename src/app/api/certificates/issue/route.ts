import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // 1. Authenticate the caller
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    // 2. Parse body
    let body: {
      studentId: string;
      courseId: string;
      courseTitle: string;
      studentName: string;
      totalLessons: number;
      totalModules: number;
      quizAverage?: number | null;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
    }

    const {
      studentId,
      courseId,
      courseTitle,
      studentName,
      totalLessons,
      totalModules,
      quizAverage,
    } = body;

    const admin = createAdminClient();

    // 3. Diagnostic — verify admin client works and table exists
    const { error: tableCheck } = await admin
      .from("certificates")
      .select("id")
      .limit(0);

    if (tableCheck) {
      return NextResponse.json(
        {
          error: "Table certificates inaccessible",
          debug: {
            message: tableCheck.message,
            code: tableCheck.code,
            details: tableCheck.details,
            hint: tableCheck.hint,
          },
        },
        { status: 500 },
      );
    }

    // 4. Only the student themselves (or admin/coach) can issue
    if (user.id !== studentId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || !["admin", "coach"].includes(profile.role)) {
        return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
      }
    }

    // 5. Check for existing certificate
    const { data: existing, error: existErr } = await admin
      .from("certificates")
      .select("*")
      .eq("student_id", studentId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existErr) {
      return NextResponse.json(
        {
          error: "Erreur verification existant",
          debug: {
            message: existErr.message,
            code: existErr.code,
            details: existErr.details,
          },
        },
        { status: 500 },
      );
    }

    if (existing) {
      return NextResponse.json(existing);
    }

    // 6. Verify course exists
    const { data: course, error: courseErr } = await admin
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .maybeSingle();

    if (courseErr || !course) {
      return NextResponse.json(
        {
          error: "Cours introuvable",
          debug: {
            courseId,
            courseError: courseErr
              ? {
                  message: courseErr.message,
                  code: courseErr.code,
                }
              : "no row found",
          },
        },
        { status: 500 },
      );
    }

    // 7. Generate certificate number
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const certificateNumber = `CERT-${date}-${rand}`;

    // 8. Insert
    const { data, error } = await admin
      .from("certificates")
      .insert({
        student_id: studentId,
        course_id: courseId,
        certificate_number: certificateNumber,
        course_title: courseTitle,
        student_name: studentName,
        total_lessons: totalLessons,
        total_modules: totalModules,
        quiz_average: quizAverage ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: "Erreur insertion certificat",
          debug: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
        },
        { status: 500 },
      );
    }

    // 9. Award XP (non-blocking)
    void admin
      .rpc("award_xp", {
        p_profile_id: studentId,
        p_action: "complete_course",
        p_metadata: { course_id: courseId, course_title: courseTitle },
      })
      .then(() => {});

    return NextResponse.json(data);
  } catch (err) {
    // Catch-all for unexpected errors (env vars missing, network, etc.)
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[Certificate] Unexpected error:", message, stack);
    return NextResponse.json(
      {
        error: "Erreur inattendue",
        debug: { message, stack: stack?.split("\n").slice(0, 3) },
      },
      { status: 500 },
    );
  }
}
