import { google } from "googleapis";
import type { Readable } from "stream";

// ---------------------------------------------------------------------------
// YouTube OAuth2 client (server-only)
// ---------------------------------------------------------------------------

function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
  );
  client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });
  return client;
}

/**
 * Retourne un client YouTube Data API v3 authentifie via OAuth2 refresh token.
 */
export function getYouTubeClient() {
  const auth = getOAuth2Client();
  return google.youtube({ version: "v3", auth });
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

/**
 * Upload une video sur YouTube en mode "unlisted" (non repertoriee).
 * @returns L'ID YouTube de la video uploadee.
 */
export async function uploadToYouTube(
  fileStream: Readable | Buffer,
  title: string,
  description?: string,
): Promise<string> {
  const youtube = getYouTubeClient();

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description: description ?? "",
      },
      status: {
        privacyStatus: "unlisted",
      },
    },
    media: {
      body: fileStream,
    },
  });

  const videoId = res.data.id;
  if (!videoId) {
    throw new Error("YouTube upload failed — no video ID returned");
  }

  return videoId;
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/**
 * Retourne l'URL embed YouTube pour un ID donne.
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Verifie si une reference est au format `youtube:VIDEO_ID` (format de migration DB).
 */
export function isYouTubeRef(url: string): boolean {
  return url.startsWith("youtube:");
}

/**
 * Extrait l'ID YouTube depuis :
 * - `youtube:VIDEO_ID` (format DB migre)
 * - `https://www.youtube.com/watch?v=VIDEO_ID`
 * - `https://youtu.be/VIDEO_ID`
 * - `https://www.youtube.com/embed/VIDEO_ID`
 *
 * Retourne `null` si l'URL n'est pas une reference YouTube reconnue.
 */
export function extractYouTubeId(ref: string): string | null {
  // Format DB migre : youtube:VIDEO_ID
  if (ref.startsWith("youtube:")) {
    return ref.slice("youtube:".length);
  }

  try {
    const url = new URL(ref);
    const hostname = url.hostname.toLowerCase();

    // youtu.be/VIDEO_ID
    if (hostname.includes("youtu.be")) {
      return url.pathname.slice(1).split("/")[0] || null;
    }

    // youtube.com/watch?v=VIDEO_ID
    if (hostname.includes("youtube.com")) {
      // /embed/VIDEO_ID
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/")[2] || null;
      }
      // ?v=VIDEO_ID
      return url.searchParams.get("v") || null;
    }
  } catch {
    // Pas une URL valide
  }

  return null;
}
