import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToB2, getPublicB2Url } from "@/lib/b2";

export async function POST(request: Request) {
  // Verifier l'auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }
    if (!path) {
      return NextResponse.json(
        { error: "Chemin non specifie" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToB2(path, buffer, file.type || "application/octet-stream");

    // Retourner une URL proxy (le bucket B2 est privé)
    const url = `/api/storage/proxy?key=${encodeURIComponent(path)}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[storage/upload] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 },
    );
  }
}
