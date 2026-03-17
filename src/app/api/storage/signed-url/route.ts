import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/b2";

export async function GET(request: Request) {
  // Verifier l'auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Parametre 'key' manquant" },
        { status: 400 },
      );
    }

    const url = await getSignedUrl(key);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[storage/signed-url] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur lors de la generation du signed URL" },
      { status: 500 },
    );
  }
}
