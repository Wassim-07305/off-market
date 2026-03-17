import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFromB2 } from "@/lib/b2";

export async function DELETE(request: Request) {
  // Verifier l'auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const { key } = (await request.json()) as { key?: string };

    if (!key) {
      return NextResponse.json(
        { error: "Parametre 'key' manquant" },
        { status: 400 },
      );
    }

    await deleteFromB2(key);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[storage/delete] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
