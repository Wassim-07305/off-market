"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink, Globe, Loader2 } from "lucide-react";

interface LinkPreviewProps {
  url: string;
}

interface OgData {
  title: string;
  description: string;
  image: string | null;
  siteName: string;
  favicon: string | null;
}

// Simple client-side OG metadata extraction via a CORS proxy
// Falls back to basic domain display if fetch fails
const OG_CACHE = new Map<string, OgData | null>();

async function fetchOgData(url: string): Promise<OgData | null> {
  if (OG_CACHE.has(url)) return OG_CACHE.get(url) ?? null;

  try {
    // Use allorigins as a CORS proxy for OG data
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      OG_CACHE.set(url, null);
      return null;
    }

    const html = await response.text();

    const getMetaContent = (property: string): string => {
      // Match og: and twitter: meta tags
      const patterns = [
        new RegExp(
          `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`,
          "i",
        ),
        new RegExp(
          `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`,
          "i",
        ),
        new RegExp(
          `<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`,
          "i",
        ),
        new RegExp(
          `<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`,
          "i",
        ),
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match?.[1]) return match[1];
      }
      return "";
    };

    const title =
      getMetaContent("og:title") ||
      getMetaContent("twitter:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      "";

    const description =
      getMetaContent("og:description") ||
      getMetaContent("twitter:description") ||
      getMetaContent("description") ||
      "";

    const image =
      getMetaContent("og:image") || getMetaContent("twitter:image") || null;

    const siteName =
      getMetaContent("og:site_name") ||
      new URL(url).hostname.replace("www.", "");

    // Resolve relative image URLs
    let resolvedImage = image;
    if (image && !image.startsWith("http")) {
      try {
        resolvedImage = new URL(image, url).href;
      } catch {
        resolvedImage = null;
      }
    }

    const origin = new URL(url).origin;
    const favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;

    const data: OgData = {
      title: decodeHtmlEntities(title).slice(0, 120),
      description: decodeHtmlEntities(description).slice(0, 200),
      image: resolvedImage,
      siteName,
      favicon,
    };

    OG_CACHE.set(url, data);
    return data;
  } catch {
    OG_CACHE.set(url, null);
    return null;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const [data, setData] = useState<OgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchOgData(url).then((result) => {
      if (cancelled) return;
      if (result && (result.title || result.description)) {
        setData(result);
      } else {
        setError(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30 max-w-sm">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Aperçu en cours...
        </span>
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block max-w-sm rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors overflow-hidden group"
    >
      {/* Preview image */}
      {data.image && (
        <div className="relative w-full h-36 overflow-hidden bg-muted">
          <Image
            src={data.image}
            alt=""
            fill
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="px-3 py-2.5">
        {/* Site info */}
        <div className="flex items-center gap-1.5 mb-1">
          {data.favicon ? (
            <Image
              src={data.favicon}
              alt=""
              width={14}
              height={14}
              className="w-3.5 h-3.5 rounded-sm"
              unoptimized
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Globe className="w-3 h-3 text-muted-foreground" />
          )}
          <span className="text-[10px] text-muted-foreground font-medium truncate">
            {data.siteName}
          </span>
          <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/50 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Title */}
        {data.title && (
          <h4 className="text-[13px] font-medium text-foreground line-clamp-2 leading-snug">
            {data.title}
          </h4>
        )}

        {/* Description */}
        {data.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
            {data.description}
          </p>
        )}
      </div>
    </a>
  );
}

/**
 * Extract the first URL from a text string.
 */
export function extractFirstUrl(text: string): string | null {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/;
  const match = text.match(urlPattern);
  return match ? match[0] : null;
}
