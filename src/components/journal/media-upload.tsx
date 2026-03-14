"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useJournal } from "@/hooks/use-journal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface MediaUploadProps {
  mediaUrls: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function MediaUpload({
  mediaUrls,
  onChange,
  maxFiles = 5,
}: MediaUploadProps) {
  const { uploadMedia } = useJournal();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = maxFiles - mediaUrls.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxFiles} images autorisees`);
      return;
    }

    const toUpload = files.slice(0, remaining);

    // Validate files
    for (const file of toUpload) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Format non supporte : ${file.name}`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Fichier trop volumineux : ${file.name} (max 10 Mo)`);
        return;
      }
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of toUpload) {
      try {
        const url = await uploadMedia.mutateAsync(file);
        newUrls.push(url);
      } catch {
        // Error handled by mutation
      }
    }

    if (newUrls.length > 0) {
      onChange([...mediaUrls, ...newUrls]);
    }
    setUploading(false);

    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeMedia = (index: number) => {
    const updated = mediaUrls.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Thumbnails */}
      {mediaUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mediaUrls.map((url, i) => (
            <div
              key={url}
              className="relative group w-20 h-20 rounded-xl overflow-hidden border border-border"
            >
              <img
                src={url}
                alt={`Media ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeMedia(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {mediaUrls.length < maxFiles && (
        <label
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border",
            "text-sm text-muted-foreground cursor-pointer",
            "hover:border-primary/50 hover:text-foreground hover:bg-muted/50 transition-all",
            uploading && "pointer-events-none opacity-50",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
          {uploading ? "Upload en cours..." : "Ajouter des images"}
        </label>
      )}

      {/* Counter */}
      {mediaUrls.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {mediaUrls.length}/{maxFiles} images
        </p>
      )}
    </div>
  );
}
