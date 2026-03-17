"use client";

import { useRef, useState, useCallback } from "react";
import {
  useCoachDocuments,
  useUploadDocument,
  useDeleteDocument,
} from "@/hooks/use-alexia";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  File,
} from "lucide-react";

export function AlexiaKnowledgePanel() {
  const { data: documents, isLoading } = useCoachDocuments();
  const upload = useUploadDocument();
  const deleteDoc = useDeleteDocument();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      for (const file of Array.from(files)) {
        upload.mutate(file);
      }
    },
    [upload],
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground">
          Base de connaissances
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Uploade tes documents (PDF, texte) pour qu&apos;AlexIA puisse repondre
          en se basant sur ton expertise.
        </p>
      </div>

      {/* Upload zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40",
          upload.isPending && "pointer-events-none opacity-60",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
        {upload.isPending ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Traitement en cours (extraction, decoupage, indexation)...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Glisse tes fichiers ici ou clique pour parcourir
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, TXT, MD — Max 10 Mo par fichier
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Documents list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : !documents?.length ? (
        <div className="text-center py-8">
          <File className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucun document uploade
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {documents.length} document{documents.length > 1 ? "s" : ""}
          </p>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {doc.file_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    {formatSize(doc.file_size)}
                  </span>
                  {doc.chunk_count > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {doc.chunk_count} morceaux
                    </span>
                  )}
                </div>
              </div>
              {/* Status badge */}
              <div className="shrink-0">
                {doc.status === "ready" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Indexe
                  </span>
                )}
                {doc.status === "processing" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    En cours
                  </span>
                )}
                {doc.status === "error" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    Erreur
                  </span>
                )}
              </div>
              {/* Delete */}
              <button
                onClick={() => {
                  if (confirm("Supprimer ce document ?")) {
                    deleteDoc.mutate(doc.id);
                  }
                }}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
