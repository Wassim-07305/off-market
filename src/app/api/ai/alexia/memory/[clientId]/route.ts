import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("client_ai_memory")
    .select("*, client:profiles!client_id(full_name, avatar_url)")
    .eq("client_id", clientId)
    .eq("coach_id", user.id)
    .single();

  return NextResponse.json({ memory: data });
}
