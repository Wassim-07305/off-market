import { NextRequest, NextResponse } from "next/server";

const B2_CONFIGURED = !!(
  process.env.B2_KEY_ID &&
  process.env.B2_APP_KEY &&
  process.env.B2_BUCKET_NAME &&
  process.env.B2_REGION &&
  process.env.B2_ENDPOINT
);

// SVG placeholder retourné quand B2 n'est pas configuré ou fichier introuvable
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#f3f4f6"/>
  <rect x="150" y="100" width="100" height="70" rx="8" fill="#d1d5db"/>
  <circle cx="175" cy="120" r="12" fill="#9ca3af"/>
  <polygon points="155,165 200,125 245,165" fill="#9ca3af"/>
</svg>`;

/**
 * Proxy pour servir les fichiers B2 privés.
 * Redirige vers un signed URL temporaire.
 * Si B2 n'est pas configuré, retourne une image placeholder.
 *
 * Usage: /api/storage/proxy?key=avatars/user-123/photo.jpg
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  // Si B2 n'est pas configuré, retourner un placeholder immédiatement
  if (!B2_CONFIGURED) {
    return new NextResponse(PLACEHOLDER_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  try {
    const { getSignedUrl } = await import("@/lib/b2");
    const url = await getSignedUrl(key, 4 * 3600); // 4 heures
    return NextResponse.redirect(url);
  } catch {
    // Fichier introuvable sur B2 — retourner un placeholder
    return new NextResponse(PLACEHOLDER_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
}
