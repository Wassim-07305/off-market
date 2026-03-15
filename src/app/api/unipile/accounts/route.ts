import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UNIPILE_BASE =
  process.env.UNIPILE_BASE_URL ?? "https://api33.unipile.com:16338";

export async function GET() {
  // Auth check — admin/coach only
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  try {
    const res = await fetch(`${UNIPILE_BASE}/api/v1/accounts`, {
      headers: { "X-API-KEY": apiKey },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur de connexion au service de messagerie" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unipile accounts error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion a Unipile" },
      { status: 500 },
    );
  }
}
