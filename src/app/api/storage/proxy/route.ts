import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@/lib/b2";

/**
 * Proxy pour servir les fichiers B2 privés.
 * Redirige vers un signed URL temporaire.
 *
 * Usage: /api/storage/proxy?key=avatars/user-123/photo.jpg
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  try {
    const url = await getSignedUrl(key, 4 * 3600); // 4 heures
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
