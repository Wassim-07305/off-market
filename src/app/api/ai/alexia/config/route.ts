import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("coach_ai_config")
    .select("*")
    .eq("coach_id", user.id)
    .single();

  return NextResponse.json({
    config: data ?? {
      ai_name: "AlexIA",
      system_instructions: "",
      tone: "professionnel",
      greeting_message:
        "Bonjour ! Je suis AlexIA, l'assistante de ton coach. Comment puis-je t'aider ?",
    },
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("coach_ai_config")
    .upsert(
      {
        coach_id: user.id,
        ai_name: body.ai_name ?? "AlexIA",
        system_instructions: body.system_instructions ?? "",
        tone: body.tone ?? "professionnel",
        greeting_message: body.greeting_message ?? "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "coach_id" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}
