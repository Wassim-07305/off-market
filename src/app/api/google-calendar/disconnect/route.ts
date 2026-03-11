import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { error } = await supabase
    .from("google_calendar_tokens")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to disconnect Google Calendar:", error);
    return NextResponse.json(
      { error: "Erreur lors de la deconnexion" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
