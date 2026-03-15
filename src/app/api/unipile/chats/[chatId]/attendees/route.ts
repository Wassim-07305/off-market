import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UNIPILE_BASE = process.env.UNIPILE_BASE_URL ?? "https://api33.unipile.com:16338";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  // Auth check — admin/coach only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "coach"].includes(profile.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const apiKey = process.env.UNIPILE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "UNIPILE_API_KEY non configure" },
      { status: 500 },
    );
  }

  const { chatId } = await params;

  try {
    const url = `${UNIPILE_BASE}/api/v1/chats/${encodeURIComponent(chatId)}/attendees`;
    const res = await fetch(url, {
      headers: { "X-API-KEY": apiKey },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur lors du chargement des participants" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unipile attendees error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion a Unipile" },
      { status: 500 },
    );
  }
}
