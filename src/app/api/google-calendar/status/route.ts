import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { data } = await supabase
    .from("google_calendar_tokens")
    .select("google_email, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  return NextResponse.json({
    connected: !!data,
    google_email: data?.google_email ?? null,
  });
}
