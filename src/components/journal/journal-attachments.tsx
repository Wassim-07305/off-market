"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Paperclip,
  X,
  Loader2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { JournalAttachment } from "@/types/coaching";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_ATTACHMENTS = 5;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ACCEPTED_DOC_TYPES = ["application/pdf"];
const ALL_ACCEPTED = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES];
const ACCEPT_STRING =
  "image/jpeg,image/png,image/gif,image/webp,application/pdf";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function isImageType(type: string): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(type);
}

interface JournalAttachmentsProps {
  attachments: JournalAttachment[];
  onChange: (attachments: JournalAttachment[]) => void;
  readOnly?: boolean;
}

export function JournalAttachments({
  attachments,
  onChange,
  readOnly = false,
}: JournalAttachmentsProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<JournalAttachment | null> => {
      if (!user) return null;

      if (!ALL_ACCEPTED.includes(file.type)) {
        toast.error(`Format non supporte : ${file.name}`);
        return null;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `Fichier trop volumineux : ${file.name} (max ${formatFileSize(MAX_FILE_SIZE)})`,
        );
        return null;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${user.id}/journal/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", `journal-attachments/${path}`);
      const uploadRes = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        toast.error(`Erreur upload : ${file.name}`);
        return null;
      }

      const { url } = await uploadRes.json();

      return {
        url,
        type: file.type,
        name: file.name,
        size: file.size,
      };
    },
    [user],
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const remaining = MAX_ATTACHMENTS - attachments.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_ATTACHMENTS} fichiers autorises`);
        return;
      }

      const toUpload = files.slice(0, remaining);
      setUploading(true);

      const results: JournalAttachment[] = [];
      for (const file of toUpload) {
        const result = await uploadFile(file);
        if (result) results.push(result);
      }

      if (results.length > 0) {
        onChange([...attachments, ...results]);
        toast.success(
          results.length === 1
            ? "Fichier ajoute"
            : `${results.length} fichiers ajoutes`,
        );
      }

      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    },
    [attachments, onChange, uploadFile],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    handleFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeAttachment = (index: number) => {
    onChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Thumbnails / file list */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div
              key={att.url}
              className="relative group rounded-xl overflow-hidden border border-border"
            >
              {isImageType(att.type) ? (
                <div className="w-20 h-20">
                  <Image
                    src={att.url}
                    alt={att.name}
                    fill
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-20 h-20 flex flex-col items-center justify-center bg-muted/50 p-2">
                  <FileText className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-[9px] text-muted-foreground text-center truncate w-full">
                    {att.name}
                  </span>
                  <span className="text-[8px] text-muted-foreground/60">
                    {formatFileSize(att.size)}
                  </span>
                </div>
              )}
              {!readOnly && (
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {!readOnly && attachments.length < MAX_ATTACHMENTS && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "rounded-xl border-2 border-dashed p-4 text-center transition-all cursor-pointer",
            dragOver
              ? "border-[#DC2626] bg-[#DC2626]/5"
              : "border-border hover:border-[#DC2626]/30 hover:bg-muted/30",
            uploading && "pointer-events-none opacity-50",
          )}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_STRING}
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <div className="flex flex-col items-center gap-1.5">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {uploading
                ? "Upload en cours..."
                : "Glisser-deposer ou cliquer pour ajouter"}
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              Images (JPG, PNG, GIF) et PDF — max{" "}
              {formatFileSize(MAX_FILE_SIZE)} par fichier
            </p>
          </div>
        </div>
      )}

      {/* Counter */}
      {!readOnly && attachments.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {attachments.length}/{MAX_ATTACHMENTS} fichiers
        </p>
      )}
    </div>
  );
}
