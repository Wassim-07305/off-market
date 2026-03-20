import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
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

  // 3. Only the student themselves (or admin/coach) can issue their certificate
  if (user.id !== studentId) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !["admin", "coach"].includes(profile.role)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }
  }

  const admin = createAdminClient();

  // 4. Check for existing certificate (avoid duplicate attempt)
  const { data: existing } = await admin
    .from("certificates")
    .select("*")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(existing);
  }

  // 5. Generate certificate number
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const certificateNumber = `CERT-${date}-${rand}`;

  // 6. Insert using admin client (bypasses RLS entirely)
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
    console.error("[Certificate] Insert error:", JSON.stringify(error));
    return NextResponse.json(
      {
        error: error.message ?? "Erreur lors de la generation",
        detail: error.details ?? error.hint ?? error.code ?? null,
      },
      { status: 500 },
    );
  }

  // 7. Award XP (non-blocking — never fail the request)
  void admin
    .rpc("award_xp", {
      p_profile_id: studentId,
      p_action: "complete_course",
      p_metadata: { course_id: courseId, course_title: courseTitle },
    })
    .then(() => {});

  return NextResponse.json(data);
}
