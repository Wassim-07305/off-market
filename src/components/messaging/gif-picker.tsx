"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Loader2, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    gif: { url: string; dims: [number, number] };
    tinygif: { url: string; dims: [number, number] };
    nanogif: { url: string; dims: [number, number] };
  };
}

interface TenorResponse {
  results: TenorGif[];
  next: string;
}

// Tenor API v2 - free tier (no key required for basic use, but we use the shared key)
const TENOR_API_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";
const TENOR_BASE = "https://tenor.googleapis.com/v2";

const TRENDING_CATEGORIES = [
  "reaction",
  "bravo",
  "merci",
  "lol",
  "ok",
  "salut",
  "triste",
  "danse",
  "applaudir",
  "coeur",
];

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load trending on mount
  useEffect(() => {
    fetchTrending();
    inputRef.current?.focus();
  }, []);

  const fetchTrending = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${TENOR_BASE}/featured?key=${TENOR_API_KEY}&client_key=off-market&limit=30&media_filter=gif,tinygif,nanogif&locale=fr_FR`,
      );
      const data: TenorResponse = await res.json();
      setGifs(data.results ?? []);
    } catch {
      // Silently fail, show empty state
    } finally {
      setIsLoading(false);
    }
  };

  const searchGifs = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      fetchTrending();
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(
        `${TENOR_BASE}/search?key=${TENOR_API_KEY}&client_key=off-market&q=${encodeURIComponent(searchQuery)}&limit=30&media_filter=gif,tinygif,nanogif&locale=fr_FR`,
      );
      const data: TenorResponse = await res.json();
      setGifs(data.results ?? []);
    } catch {
      setGifs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchGifs(value), 400);
  };

  const handleCategoryClick = (category: string) => {
    setQuery(category);
    searchGifs(category);
  };

  const handleSelect = (gif: TenorGif) => {
    // Use tinygif for smaller file size in chat
    const url = gif.media_formats.tinygif?.url ?? gif.media_formats.gif?.url;
    if (url) {
      onSelect(url);
      onClose();
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-gif-picker]")) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      data-gif-picker
      className="absolute bottom-full right-0 mb-2 bg-surface border border-border/60 rounded-xl shadow-xl w-80 overflow-hidden z-30 animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40">
        <ImageIcon className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs font-semibold text-foreground">GIF</span>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Rechercher un GIF..."
            className="w-full h-8 pl-8 pr-3 bg-muted/50 border border-border/40 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                fetchTrending();
                setHasSearched(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30"
            >
              <X className="w-2.5 h-2.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      {!hasSearched && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {TRENDING_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="px-2 py-0.5 rounded-full bg-muted/60 text-[10px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors capitalize"
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* GIF Grid */}
      <div className="h-64 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : gifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              {hasSearched ? "Aucun GIF trouve" : "Recherche un GIF"}
            </p>
          </div>
        ) : (
          <div className="columns-2 gap-1.5">
            {gifs.map((gif) => {
              const preview =
                gif.media_formats.nanogif ?? gif.media_formats.tinygif;
              return (
                <button
                  key={gif.id}
                  onClick={() => handleSelect(gif)}
                  className="w-full mb-1.5 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer break-inside-avoid"
                  title={gif.title}
                >
                  <img
                    src={preview.url}
                    alt={gif.title}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Powered by Tenor */}
      <div className="px-3 py-1.5 border-t border-border/30 flex items-center justify-end">
        <span className="text-[9px] text-muted-foreground/60">
          Powered by Tenor
        </span>
      </div>
    </div>
  );
}
