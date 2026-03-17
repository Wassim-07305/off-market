import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToYouTube, getYouTubeEmbedUrl } from "@/lib/youtube";
import { Readable } from "stream";

export async function POST(request: Request) {
  // --- Auth check ---
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Seuls admin et coach peuvent uploader des videos
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "coach") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  // --- Parse multipart form data ---
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || "Video Off-Market";

  if (!file) {
    return NextResponse.json(
      { error: "Aucun fichier fourni" },
      { status: 400 },
    );
  }

  // Verifier que c'est bien une video
  if (!file.type.startsWith("video/")) {
    return NextResponse.json(
      { error: "Le fichier doit etre une video" },
      { status: 400 },
    );
  }

  try {
    // Convertir le File en Buffer puis en Readable stream pour googleapis
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    const videoId = await uploadToYouTube(stream, title);
    const embedUrl = getYouTubeEmbedUrl(videoId);

    return NextResponse.json({ videoId, embedUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[video/upload] YouTube upload failed:", message);
    return NextResponse.json(
      { error: `Erreur lors de l'upload YouTube: ${message}` },
      { status: 500 },
    );
  }
}
