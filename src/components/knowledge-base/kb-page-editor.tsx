"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Save,
  Eye,
  Pencil,
  Trash2,
  Image,
  Loader2,
  ChevronRight,
  Copy,
  MoreHorizontal,
  BookTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  useKnowledgeBasePage,
  useUpdatePage,
  useDeletePage,
  usePageBreadcrumb,
  useAllKnowledgeBasePages,
} from "@/hooks/use-knowledge-base";
import { useAuth } from "@/hooks/use-auth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { KBPageViewer } from "./kb-page-viewer";
import { KBIconPicker } from "./kb-icon-picker";
import type { KBCategory } from "@/types/database";

// ─── Categories ──────────────────────────────────────────────────

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "marche", label: "Marche" },
  { value: "offre", label: "Offre" },
  { value: "communication", label: "Communication" },
  { value: "acquisition", label: "Acquisition" },
  { value: "conversion", label: "Conversion" },
  { value: "faq", label: "FAQ" },
] as const;

// ─── Props ───────────────────────────────────────────────────────

interface KBPageEditorProps {
  pageId: string;
  onNavigate: (pageId: string) => void;
  onDeleted: () => void;
}

export function KBPageEditor({
  pageId,
  onNavigate,
  onDeleted,
}: KBPageEditorProps) {
  const { isStaff } = useAuth();
  const { data: page, isLoading } = useKnowledgeBasePage(pageId);
  const { data: allPages } = useAllKnowledgeBasePages();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();

  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<KBCategory>("general");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef<string | null>(null);

  const breadcrumb = usePageBreadcrumb(pageId, allPages);

  // Charger les donnees de la page
  useEffect(() => {
    if (page && initializedRef.current !== page.id) {
      setTitle(page.title);
      setContent(page.content ?? "");
      setIcon(page.icon);
      setCoverUrl(page.cover_image_url);
      setCategory(page.category);
      initializedRef.current = page.id;
    }
  }, [page]);

  // Sauvegarde auto avec debounce
  const autoSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await updatePage.mutateAsync({
            id: pageId,
            title: newTitle,
            content: newContent,
          });
          setLastSaved(new Date());
        } finally {
          setIsSaving(false);
        }
      }, 2000);
    },
    [pageId, updatePage],
  );

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    autoSave(value, content);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    autoSave(title, value);
  };

  const handleIconSelect = async (emoji: string) => {
    setIcon(emoji);
    setShowIconPicker(false);
    await updatePage.mutateAsync({ id: pageId, icon: emoji });
  };

  const handleCategoryChange = async (value: KBCategory) => {
    setCategory(value);
    await updatePage.mutateAsync({ id: pageId, category: value });
  };

  const handleCoverChange = async () => {
    const url = prompt("URL de l'image de couverture :");
    if (url !== null) {
      setCoverUrl(url || null);
      await updatePage.mutateAsync({
        id: pageId,
        cover_image_url: url || null,
      });
    }
  };

  const handleToggleTemplate = async () => {
    if (!page) return;
    await updatePage.mutateAsync({
      id: pageId,
      is_template: !page.is_template,
    });
  };

  const handleDelete = async () => {
    await deletePage.mutateAsync(pageId);
    setShowDeleteConfirm(false);
    onDeleted();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Page introuvable</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cover image */}
      {coverUrl && (
        <div className="relative h-40 w-full overflow-hidden group">
          <img
            src={coverUrl}
            alt="Couverture"
            className="w-full h-full object-cover"
          />
          {isStaff && (
            <button
              onClick={handleCoverChange}
              className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity"
            >
              Modifier la couverture
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface/50">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto min-w-0">
          {breadcrumb.map((crumb, index) => (
            <span key={crumb.id} className="flex items-center gap-1 shrink-0">
              {index > 0 && <ChevronRight className="w-3 h-3" />}
              <button
                onClick={() => onNavigate(crumb.id)}
                className={cn(
                  "hover:text-foreground transition-colors truncate max-w-[120px]",
                  crumb.id === pageId && "text-foreground font-medium",
                )}
              >
                {crumb.icon && <span className="mr-1">{crumb.icon}</span>}
                {crumb.title || "Sans titre"}
              </button>
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Save status */}
          <span className="text-[11px] text-muted-foreground mr-1">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Sauvegarde...
              </span>
            ) : lastSaved ? (
              `Sauvegarde ${formatDate(lastSaved, "relative")}`
            ) : null}
          </span>

          {isStaff && (
            <>
              {/* Mode toggle */}
              <button
                onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors",
                  mode === "preview"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {mode === "edit" ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Apercu
                  </>
                ) : (
                  <>
                    <Pencil className="w-3.5 h-3.5" />
                    Editer
                  </>
                )}
              </button>

              {/* More actions */}
              <DropdownMenu
                trigger={
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                }
                align="right"
              >
                <DropdownMenuItem
                  icon={<Image className="w-3.5 h-3.5" />}
                  onClick={handleCoverChange}
                >
                  {coverUrl
                    ? "Modifier la couverture"
                    : "Ajouter une couverture"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  icon={<BookTemplate className="w-3.5 h-3.5" />}
                  onClick={handleToggleTemplate}
                >
                  {page.is_template
                    ? "Retirer des templates"
                    : "Sauver comme template"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  icon={<Copy className="w-3.5 h-3.5" />}
                  onClick={() => {
                    navigator.clipboard.writeText(content);
                  }}
                >
                  Copier le contenu
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  destructive
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Supprimer la page
                </DropdownMenuItem>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {mode === "preview" || !isStaff ? (
          <KBPageViewer
            title={title}
            content={content}
            icon={icon}
            category={category}
            updatedAt={page.updated_at}
            creator={page.creator}
            onNavigate={onNavigate}
            allPages={allPages}
          />
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
            {/* Icon + Category */}
            <div className="flex items-center gap-3">
              {/* Icon picker */}
              <div className="relative">
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-xl transition-colors"
                  title="Choisir une icone"
                >
                  {icon || "📄"}
                </button>
                {showIconPicker && (
                  <KBIconPicker
                    onSelect={handleIconSelect}
                    onClose={() => setShowIconPicker(false)}
                  />
                )}
              </div>

              {/* Category */}
              <select
                value={category}
                onChange={(e) =>
                  handleCategoryChange(e.target.value as KBCategory)
                }
                className="h-7 px-2 text-xs bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {page.is_template && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Template
                </span>
              )}
            </div>

            {/* Title */}
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Sans titre"
              className="w-full text-3xl font-bold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40 leading-tight"
            />

            {/* Content textarea */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Ecrivez en Markdown...&#10;&#10;# Titre&#10;## Sous-titre&#10;**Gras**, *Italique*&#10;- Liste&#10;```code```&#10;> Citation&#10;[lien](url)"
                className="w-full min-h-[calc(100vh-350px)] bg-transparent border-none outline-none resize-none text-sm text-foreground leading-relaxed placeholder:text-muted-foreground/30 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer cette page ?"
        description="Cette action est irreversible. Les sous-pages seront orphelines."
        confirmLabel="Supprimer"
        loading={deletePage.isPending}
      />
    </div>
  );
}
