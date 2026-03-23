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

const FILE_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  image: { bg: "bg-purple-500/10", color: "text-purple-600" },
  video: { bg: "bg-blue-500/10", color: "text-blue-600" },
  spreadsheet: { bg: "bg-emerald-500/10", color: "text-emerald-600" },
  document: { bg: "bg-[#AF0000]/10", color: "text-[#AF0000]" },
  default: { bg: "bg-gray-500/10", color: "text-gray-600" },
};

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return FileVideo;
  if (
    type.includes("spreadsheet") ||
    type.includes("csv") ||
    type.includes("excel")
  )
    return FileSpreadsheet;
  if (
    type.includes("pdf") ||
    type.includes("document") ||
    type.includes("text")
  )
    return FileText;
  return File;
}

function getFileTypeColor(type: string) {
  if (type.startsWith("image/")) return FILE_TYPE_COLORS.image;
  if (type.startsWith("video/")) return FILE_TYPE_COLORS.video;
  if (
    type.includes("spreadsheet") ||
    type.includes("csv") ||
    type.includes("excel")
  )
    return FILE_TYPE_COLORS.spreadsheet;
  if (
    type.includes("pdf") ||
    type.includes("document") ||
    type.includes("text")
  )
    return FILE_TYPE_COLORS.document;
  return FILE_TYPE_COLORS.default;
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
  const [uploadVisibility, setUploadVisibility] = useState<
    "all" | "staff" | "clients"
  >("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!resources) return [];
    if (!search.trim()) return resources;
    const q = search.trim().toLowerCase();
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.file_name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
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

  const handleDownload = (resource: {
    id: string;
    file_url: string;
    file_name: string;
  }) => {
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
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Ressources
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bibliotheque de documents et fichiers partages
          </p>
        </div>
        {isStaff && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white text-sm font-medium hover:shadow-lg hover:shadow-[#AF0000]/25 transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Ajouter une ressource
          </button>
        )}
      </motion.div>

      {/* Upload form */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-surface rounded-2xl p-6 space-y-4 border border-border"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Nouvelle ressource
            </h2>
            <button
              onClick={resetUpload}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* File drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
              uploadFile
                ? "border-[#AF0000]/30 bg-[#AF0000]/5"
                : "border-border hover:border-[#AF0000]/30 hover:bg-muted/30",
            )}
          >
            {uploadFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-5 h-5 text-[#AF0000]" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    {uploadFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadFile.size)}
                  </p>
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
                  if (!uploadTitle)
                    setUploadTitle(f.name.replace(/\.[^.]+$/, ""));
                }
              }}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Titre
              </label>
              <input
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Nom de la ressource"
                className="w-full h-9 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Catégorie
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full h-9 px-3 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
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
              className="w-full h-9 px-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Visibilite
            </label>
            <div className="flex gap-2">
              {VISIBILITY_OPTIONS.map((v) => (
                <button
                  key={v.value}
                  onClick={() =>
                    setUploadVisibility(v.value as typeof uploadVisibility)
                  }
                  className={cn(
                    "h-8 px-3 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5",
                    uploadVisibility === v.value
                      ? "bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground",
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
            disabled={
              uploadResource.isPending || !uploadFile || !uploadTitle.trim()
            }
            className="h-9 px-4 bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-[#AF0000]/25 transition-all disabled:opacity-50 flex items-center gap-2"
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
                "h-8 px-3 rounded-full text-xs font-medium transition-all whitespace-nowrap relative",
                category === c.value
                  ? "text-[#AF0000] bg-[#AF0000]/5 font-semibold"
                  : "bg-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {c.label}
              {category === c.value && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-[#AF0000] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20 transition-shadow"
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
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-12 text-center border border-dashed border-border">
            <FolderOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search.trim() ? "Aucun résultat" : "Aucune ressource disponible"}
            </p>
          </div>
        ) : (
          filtered.map((resource) => {
            const IconComponent = getFileIcon(resource.file_type);
            const fileColors = getFileTypeColor(resource.file_type);
            const date = new Date(resource.created_at).toLocaleDateString(
              "fr-FR",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            );

            return (
              <div
                key={resource.id}
                className="bg-surface rounded-2xl p-4 hover:shadow-md hover:-translate-y-px transition-all duration-200 group border border-transparent hover:border-border"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon with colored background */}
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                      fileColors.bg,
                    )}
                  >
                    <IconComponent
                      className={cn("w-5 h-5", fileColors.color)}
                    />
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
                          <span>
                            {resource.download_count} telechargement
                            {resource.download_count > 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">&middot;</span>
                      <span className="capitalize">
                        {CATEGORIES.find((c) => c.value === resource.category)
                          ?.label ?? resource.category}
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
                      className="h-8 px-3 rounded-xl text-xs font-medium text-[#AF0000] border border-[#AF0000]/20 hover:bg-[#AF0000]/5 hover:border-[#AF0000]/40 transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Telecharger
                    </button>

                    {isStaff && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpen(
                              menuOpen === resource.id ? null : resource.id,
                            )
                          }
                          className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors md:opacity-0 md:group-hover:opacity-100"
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
                                    <PinOff className="w-3.5 h-3.5" />{" "}
                                    Desepingler
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
