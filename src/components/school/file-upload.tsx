"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Upload, X, FileText, Loader2 } from "lucide-react";

interface FileUploadProps {
  bucket: string;
  path: string;
  accept?: string;
  maxSizeMB?: number;
  onUpload: (url: string, fileName: string) => void;
  currentUrl?: string | null;
  onRemove?: () => void;
  preview?: boolean;
  label?: string;
  className?: string;
}

export function FileUpload({
  bucket,
  path,
  accept,
  maxSizeMB = 100,
  onUpload,
  currentUrl,
  onRemove,
  preview = false,
  label = "Deposer un fichier ou cliquer",
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Fichier trop volumineux (max ${maxSizeMB} Mo)`);
        return;
      }

      // Detection video : router vers YouTube au lieu de B2
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const isVideo =
        file.type.startsWith("video/") ||
        ["mp4", "mov", "avi", "webm", "mkv"].includes(ext);

      setUploading(true);
      try {
        if (isVideo) {
          // Upload vers YouTube via API route
          const formData = new FormData();
          formData.append("file", file);
          formData.append("title", file.name.replace(/\.[^.]+$/, ""));

          const res = await fetch("/api/video/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            const data = await res
              .json()
              .catch(() => ({ error: "Erreur inconnue" }));
            throw new Error(data.error || `Erreur ${res.status}`);
          }

          const { videoId } = await res.json();
          onUpload(`youtube:${videoId}`, file.name);
          toast.success("Video uploadee sur YouTube");
        } else {
          // Upload classique vers B2 via /api/storage/upload
          const fileName = `${bucket}/${path}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

          const formData = new FormData();
          formData.append("file", file);
          formData.append("path", fileName);

          const res = await fetch("/api/storage/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Upload failed");

          const { url } = await res.json();
          onUpload(url, file.name);
          toast.success("Fichier televerse");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[FileUpload] Upload failed:", msg, err);
        toast.error(`Erreur lors du telechargement: ${msg}`);
      } finally {
        setUploading(false);
      }
    },
    [bucket, path, maxSizeMB, onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [uploadFile],
  );

  // If there's a current file and preview is enabled
  if (currentUrl && preview) {
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(currentUrl);
    return (
      <div className={cn("relative group", className)}>
        {isImage ? (
          <div className="w-full h-40 rounded-xl overflow-hidden bg-muted">
            <Image
              src={currentUrl}
              alt="Aperçu"
              fill
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground truncate flex-1">
              {currentUrl.split("/").pop()?.split("?")[0]}
            </span>
          </div>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40",
        uploading && "pointer-events-none opacity-60",
        className,
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground">
            Telechargement...
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
          {maxSizeMB < 100 && (
            <span className="text-[10px] text-muted-foreground/60">
              Max {maxSizeMB} Mo
            </span>
          )}
        </div>
      )}
    </div>
  );
}
