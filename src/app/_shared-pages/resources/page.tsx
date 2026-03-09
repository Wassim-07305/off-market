"use client";

import { useState, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useResources,
  useUploadResource,
  useUpdateResource,
  useDeleteResource,
  useTrackDownload,
} from "@/hooks/use-resources";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  FolderOpen,
  Upload,
  Search,
  FileText,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Pin,
  PinOff,
  Eye,
  Users,
  Lock,
  X,
  Loader2,
  MoreVertical,
} from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "Toutes" },
  { value: "general", label: "General" },
  { value: "templates", label: "Templates" },
  { value: "guides", label: "Guides" },
  { value: "contracts", label: "Contrats" },
  { value: "marketing", label: "Marketing" },
  { value: "training", label: "Formation" },
] as const;

const VISIBILITY_OPTIONS = [
  { value: "all", label: "Tout le monde", icon: Eye },
  { value: "staff", label: "Staff uniquement", icon: Lock },
  { value: "clients", label: "Clients", icon: Users },
] as const;

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return FileVideo;
  if (type.includes("spreadsheet") || type.includes("csv") || type.includes("excel"))
    return FileSpreadsheet;
  if (type.includes("pdf") || type.includes("document") || type.includes("text"))
    return FileText;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function ResourcesPage() {
  const { isStaff } = useAuth();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data: resources, isLoading } = useResources(category);
  const uploadResource = useUploadResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();
  const trackDownload = useTrackDownload();

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadCategory, setUploadCategory] = useState("general");
  const [uploadVisibility, setUploadVisibility] = useState<"all" | "staff" | "clients">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!resources) return [];
    if (!search.trim()) return resources;
    const q = search.trim().toLowerCase();
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.file_name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [resources, search]);

  const resetUpload = () => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadDesc("");
    setUploadCategory("general");
    setUploadVisibility("all");
    setShowUpload(false);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) return;
    await uploadResource.mutateAsync({
      file: uploadFile,
      title: uploadTitle.trim(),
      description: uploadDesc.trim() || undefined,
      category: uploadCategory,
      visibility: uploadVisibility,
    });
    resetUpload();
  };

  const handleDownload = (resource: { id: string; file_url: string; file_name: string }) => {
    trackDownload.mutate(resource.id);
    const a = document.createElement("a");
    a.href = resource.file_url;
    a.download = resource.file_name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Ressources
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bibliotheque de documents et fichiers partages
          </p>
        </div>
        {isStaff && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Ajouter une ressource
          </button>
        )}
      </motion.div>

      {/* Upload form */}
      {showUpload && (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-6 space-y-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Nouvelle ressource</h2>
            <button onClick={resetUpload} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* File drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
              uploadFile
                ? "border-primary/30 bg-primary/5"
                : "border-border hover:border-primary/30 hover:bg-muted/30"
            )}
          >
            {uploadFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{uploadFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(uploadFile.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadFile(null);
                  }}
                  className="ml-2 text-muted-foreground hover:text-error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique ou glisse un fichier ici
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  PDF, images, documents, videos — max 50 Mo
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  if (f.size > 50 * 1024 * 1024) {
                    return;
                  }
                  setUploadFile(f);
                  if (!uploadTitle) setUploadTitle(f.name.replace(/\.[^.]+$/, ""));
                }
              }}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Titre</label>
              <input
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Nom de la ressource"
                className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Categorie</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description (optionnel)
            </label>
            <input
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              placeholder="Breve description..."
              className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Visibilite</label>
            <div className="flex gap-2">
              {VISIBILITY_OPTIONS.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setUploadVisibility(v.value as typeof uploadVisibility)}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                    uploadVisibility === v.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <v.icon className="w-3 h-3" />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploadResource.isPending || !uploadFile || !uploadTitle.trim()}
            className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {uploadResource.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {uploadResource.isPending ? "Upload..." : "Ajouter"}
          </button>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                category === c.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>
      </motion.div>

      {/* Resource list */}
      <motion.div variants={staggerItem} className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-surface rounded-2xl animate-shimmer"
              style={{ boxShadow: "var(--shadow-card)" }}
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-surface rounded-2xl p-12 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <FolderOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search.trim() ? "Aucun resultat" : "Aucune ressource disponible"}
            </p>
          </div>
        ) : (
          filtered.map((resource) => {
            const IconComponent = getFileIcon(resource.file_type);
            const date = new Date(resource.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={resource.id}
                className="bg-surface rounded-2xl p-4 hover:bg-muted/20 transition-colors group"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {resource.title}
                      </h3>
                      {resource.is_pinned && (
                        <Pin className="w-3 h-3 text-amber-500 shrink-0" />
                      )}
                      {resource.visibility === "staff" && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                          Staff
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{formatFileSize(resource.file_size)}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{date}</span>
                      {resource.download_count > 0 && (
                        <>
                          <span aria-hidden="true">&middot;</span>
                          <span>{resource.download_count} telechargement{resource.download_count > 1 ? "s" : ""}</span>
                        </>
                      )}
                      <span aria-hidden="true">&middot;</span>
                      <span className="capitalize">
                        {CATEGORIES.find((c) => c.value === resource.category)?.label ?? resource.category}
                      </span>
                    </div>
                    {resource.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDownload(resource)}
                      className="h-8 px-3 rounded-lg text-xs font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Telecharger
                    </button>

                    {isStaff && (
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === resource.id ? null : resource.id)}
                          className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>

                        {menuOpen === resource.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-lg py-1 w-44">
                              <button
                                onClick={() => {
                                  updateResource.mutate({
                                    id: resource.id,
                                    is_pinned: !resource.is_pinned,
                                  });
                                  setMenuOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted flex items-center gap-2 transition-colors"
                              >
                                {resource.is_pinned ? (
                                  <>
                                    <PinOff className="w-3.5 h-3.5" /> Desepingler
                                  </>
                                ) : (
                                  <>
                                    <Pin className="w-3.5 h-3.5" /> Epingler
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  deleteResource.mutate({
                                    id: resource.id,
                                    file_url: resource.file_url,
                                  });
                                  setMenuOpen(null);
                                }}
                                className="w-full px-3 py-2 text-left text-xs text-error hover:bg-error/5 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
