"use client";

import { useState, useCallback } from "react";
import type { EmbedType } from "@/types/database";
import {
  Maximize2,
  Minimize2,
  ExternalLink,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmbedViewerProps {
  url: string;
  embedType?: EmbedType | null;
  title?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Auto-detect embed type from URL
// ---------------------------------------------------------------------------

export function detectEmbedType(url: string): EmbedType {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes("figma.com")) return "figma";
    if (hostname.includes("miro.com")) return "miro";
    if (hostname.includes("docs.google.com") || hostname.includes("drive.google.com"))
      return "google_docs";
    if (hostname.includes("canva.com")) return "canva";
    if (hostname.includes("notion.so") || hostname.includes("notion.site"))
      return "notion";

    return "generic";
  } catch {
    return "generic";
  }
}

// ---------------------------------------------------------------------------
// Transform URL for embedding
// ---------------------------------------------------------------------------

function getEmbedUrl(url: string, type: EmbedType): string {
  switch (type) {
    case "figma": {
      // Figma embed URL format
      if (url.includes("embed")) return url;
      return `https://www.figma.com/embed?embed_host=off-market&url=${encodeURIComponent(url)}`;
    }
    case "miro": {
      // Miro board embed
      if (url.includes("embed")) return url;
      const boardMatch = url.match(/miro\.com\/app\/board\/([^/?]+)/);
      if (boardMatch) {
        return `https://miro.com/app/embed/${boardMatch[1]}/`;
      }
      return url;
    }
    case "google_docs": {
      // Google Docs/Sheets/Slides — append /preview or /pub
      if (url.includes("/pub") || url.includes("/preview") || url.includes("/embed")) return url;
      if (url.includes("/edit")) return url.replace("/edit", "/preview");
      return url + (url.includes("?") ? "&" : "?") + "embedded=true";
    }
    case "canva": {
      // Canva design embed
      if (url.includes("/watch") || url.includes("/embed")) return url;
      return url;
    }
    case "notion": {
      // Notion pages can be embedded directly
      return url;
    }
    default:
      return url;
  }
}

// ---------------------------------------------------------------------------
// Embed type labels and icons
// ---------------------------------------------------------------------------

const EMBED_LABELS: Record<EmbedType, string> = {
  figma: "Figma",
  miro: "Miro",
  google_docs: "Google Docs",
  canva: "Canva",
  notion: "Notion",
  generic: "Contenu externe",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EmbedViewer({ url, embedType, title, className }: EmbedViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const type = embedType ?? detectEmbedType(url);
  const embedUrl = getEmbedUrl(url, type);
  const label = EMBED_LABELS[type];

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  if (hasError) {
    return (
      <div
        className={cn(
          "bg-surface rounded-2xl border border-border p-8 flex flex-col items-center justify-center text-center",
          className,
        )}
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Impossible de charger le contenu
        </h3>
        <p className="text-xs text-muted-foreground mb-4 max-w-sm">
          Le contenu {label} n&apos;a pas pu etre charge. Il est possible que le lien soit
          invalide ou que le contenu ne soit pas public.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 px-4 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all active:scale-[0.97]"
          style={{ backgroundColor: "#DC2626" }}
        >
          <ExternalLink className="w-4 h-4" />
          Ouvrir dans un nouvel onglet
        </a>
      </div>
    );
  }

  const iframeContent = (
    <div
      className={cn(
        "relative bg-surface rounded-2xl border border-border overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none border-none",
        className,
      )}
      style={!isFullscreen ? { boxShadow: "var(--shadow-card)" } : undefined}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {label}
          </span>
          {title && (
            <span className="text-sm text-foreground font-medium truncate max-w-[200px]">
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={toggleFullscreen}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={isFullscreen ? "Quitter le plein ecran" : "Plein ecran"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Iframe container */}
      <div className={cn("relative", isFullscreen ? "h-[calc(100vh-45px)]" : "aspect-video")}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Chargement du contenu {label}...</span>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title ?? `${label} embed`}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );

  return iframeContent;
}
