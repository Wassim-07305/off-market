"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import {
  useMessageTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  type MessageTemplate,
} from "@/hooks/use-message-templates";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Zap,
  Hash,
  TrendingUp,
  Share2,
  ArrowLeft,
  Info,
  X,
} from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "Tous" },
  { value: "general", label: "General" },
  { value: "vente", label: "Vente" },
  { value: "support", label: "Support" },
  { value: "onboarding", label: "Onboarding" },
  { value: "relance", label: "Relance" },
] as const;

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c.value !== "all");

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  vente: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  support: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  onboarding:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  relance: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

const VARIABLES = [
  { key: "{{nom}}", desc: "Nom du contact" },
  { key: "{{prenom}}", desc: "Prenom du contact" },
  { key: "{{entreprise}}", desc: "Nom de l'entreprise" },
  { key: "{{date}}", desc: "Date du jour" },
  { key: "{{montant}}", desc: "Montant du devis" },
];

interface TemplateManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export function TemplateManagerModal({
  open,
  onClose,
}: TemplateManagerModalProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"list" | "form">("list");
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showVariableHelp, setShowVariableHelp] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formShortcut, setFormShortcut] = useState("");
  const [formShared, setFormShared] = useState(false);

  const { data: templates = [], isLoading } = useMessageTemplates(
    category !== "all" ? category : undefined,
  );
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const filteredTemplates = search
    ? templates.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.content.toLowerCase().includes(search.toLowerCase()) ||
          (t.shortcut &&
            t.shortcut.toLowerCase().includes(search.toLowerCase())),
      )
    : templates;

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormCategory("general");
    setFormShortcut("");
    setFormShared(false);
    setEditingTemplate(null);
    setShowVariableHelp(false);
  };

  const openCreateForm = () => {
    resetForm();
    setView("form");
  };

  const openEditForm = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormContent(template.content);
    setFormCategory(template.category);
    setFormShortcut(template.shortcut ?? "");
    setFormShared(template.is_shared);
    setView("form");
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formContent.trim()) return;

    const shortcut = formShortcut.trim()
      ? formShortcut.trim().startsWith("/")
        ? formShortcut.trim()
        : `/${formShortcut.trim()}`
      : undefined;

    if (editingTemplate) {
      await updateTemplate.mutateAsync({
        id: editingTemplate.id,
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        shortcut: shortcut ?? null,
        is_shared: formShared,
      });
    } else {
      await createTemplate.mutateAsync({
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        shortcut,
        is_shared: formShared,
      });
    }

    resetForm();
    setView("list");
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate.mutateAsync(id);
    setDeleteConfirm(null);
  };

  const handleClose = () => {
    resetForm();
    setView("list");
    setSearch("");
    setCategory("all");
    onClose();
  };

  const insertVariable = (variable: string) => {
    setFormContent((prev) => prev + variable);
  };

  return (
    <Modal open={open} onClose={handleClose} title="" size="lg">
      {view === "list" ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Templates de messages
              </h3>
            </div>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau
            </button>
          </div>

          {/* Search & filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un template..."
                className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                    category === cat.value
                      ? "bg-primary text-white"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template list */}
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="py-8 text-center">
                <Zap className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucun template trouve
                </p>
                <button
                  onClick={openCreateForm}
                  className="mt-2 text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Creer votre premier template
                </button>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group flex items-start gap-3 p-3 rounded-xl border border-border/20 hover:border-border/40 hover:bg-muted/20 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {template.title}
                      </p>
                      {template.is_shared && (
                        <Share2 className="w-3 h-3 text-primary shrink-0" />
                      )}
                      {template.shortcut && (
                        <span className="flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded shrink-0">
                          <Hash className="w-2.5 h-2.5" />
                          {template.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-1.5">
                      {template.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded",
                          CATEGORY_COLORS[template.category] ??
                            CATEGORY_COLORS.general,
                        )}
                      >
                        {template.category}
                      </span>
                      {template.usage_count > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <TrendingUp className="w-2.5 h-2.5" />
                          {template.usage_count} utilisation
                          {template.usage_count > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openEditForm(template)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirm === template.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="px-2 py-1 text-[10px] font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Supprimer
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(template.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ─── Create/Edit Form ─── */
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetForm();
                setView("list");
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-foreground">
              {editingTemplate ? "Modifier le template" : "Nouveau template"}
            </h3>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Titre
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Ex: Message de bienvenue"
              className="w-full h-9 px-3 bg-muted/40 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-foreground">
                Contenu
              </label>
              <button
                onClick={() => setShowVariableHelp(!showVariableHelp)}
                className={cn(
                  "flex items-center gap-1 text-xs font-medium transition-colors",
                  showVariableHelp
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Info className="w-3 h-3" />
                Variables
              </button>
            </div>

            {showVariableHelp && (
              <div className="mb-2 p-2.5 bg-primary/5 border border-primary/15 rounded-lg">
                <p className="text-[11px] text-muted-foreground mb-1.5">
                  Cliquez sur une variable pour l&apos;inserer :
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => insertVariable(v.key)}
                      className="group flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 border border-border/30 rounded-md hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      title={v.desc}
                    >
                      <code className="text-[11px] font-mono text-primary">
                        {v.key}
                      </code>
                      <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                        {v.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Ecrivez votre message template ici... Utilisez {{nom}}, {{entreprise}} etc. pour les variables."
              className="w-full h-32 px-3 py-2 bg-muted/40 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
            />
          </div>

          {/* Category & Shortcut row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Categorie
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-9 px-3 bg-muted/40 border border-border/30 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Raccourci
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  /
                </span>
                <input
                  type="text"
                  value={formShortcut.replace(/^\//, "")}
                  onChange={(e) =>
                    setFormShortcut(e.target.value.replace(/\s/g, ""))
                  }
                  placeholder="bienvenue"
                  className="w-full h-9 pl-7 pr-3 bg-muted/40 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Shared toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Partager avec l&apos;equipe
                </p>
                <p className="text-xs text-muted-foreground">
                  Visible par tous les membres
                </p>
              </div>
            </div>
            <button
              onClick={() => setFormShared(!formShared)}
              className={cn(
                "relative w-10 h-5.5 rounded-full transition-colors",
                formShared ? "bg-primary" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform",
                  formShared ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/20">
            <button
              onClick={() => {
                resetForm();
                setView("list");
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !formTitle.trim() ||
                !formContent.trim() ||
                createTemplate.isPending ||
                updateTemplate.isPending
              }
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {editingTemplate ? "Enregistrer" : "Creer"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
