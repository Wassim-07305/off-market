"use client";

import { useState, useMemo } from "react";
import {
  useFormTemplates,
  useCreateFormFromTemplate,
  type FormTemplate,
} from "@/hooks/use-form-templates";
import { cn } from "@/lib/utils";
import { FORM_FIELD_TYPES } from "@/lib/constants";
import {
  Search,
  FileText,
  Plus,
  ArrowLeft,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fadeInUp,
  staggerContainer,
  defaultTransition,
} from "@/lib/animations";

interface TemplateGalleryProps {
  onSelectTemplate: (formId: string) => void;
  onCreateBlank: () => void;
  onBack?: () => void;
}

const CATEGORIES = [
  { value: "all", label: "Tous" },
  { value: "onboarding", label: "Onboarding" },
  { value: "feedback", label: "Feedback" },
  { value: "evaluation", label: "Evaluation" },
  { value: "intake", label: "Intake" },
  { value: "survey", label: "Sondage" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  onboarding: "bg-blue-50 text-blue-700 border-blue-200",
  feedback: "bg-amber-50 text-amber-700 border-amber-200",
  evaluation: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intake: "bg-purple-50 text-purple-700 border-purple-200",
  survey: "bg-rose-50 text-rose-700 border-rose-200",
};

const CATEGORY_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  feedback: "Feedback",
  evaluation: "Evaluation",
  intake: "Intake",
  survey: "Sondage",
};

export function TemplateGallery({
  onSelectTemplate,
  onCreateBlank,
  onBack,
}: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(
    null,
  );

  const { data: templates, isLoading } = useFormTemplates(activeCategory);
  const createFromTemplate = useCreateFormFromTemplate();

  const filtered = useMemo(() => {
    if (!templates) return [];
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false),
    );
  }, [templates, search]);

  const handleUseTemplate = async (template: FormTemplate) => {
    const form = await createFromTemplate.mutateAsync({ template });
    if (form) {
      onSelectTemplate(form.id);
    }
  };

  const getFieldLabel = (fieldType: string) => {
    return (
      FORM_FIELD_TYPES.find((t) => t.value === fieldType)?.label ?? fieldType
    );
  };

  const countInputFields = (template: FormTemplate) => {
    return template.fields.filter(
      (f) => !["heading", "paragraph", "divider"].includes(f.field_type),
    ).length;
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
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Nouveau formulaire
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Choisissez un template ou creez depuis zero
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search bar */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="relative"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un template..."
          className="w-full h-10 pl-10 pr-4 bg-surface border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/40"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* Category tabs */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center gap-1.5 overflow-x-auto pb-1"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              "h-8 px-3.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
              activeCategory === cat.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Template grid */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Create from scratch card */}
        <button
          onClick={onCreateBlank}
          className="group bg-surface border-2 border-dashed border-border/50 hover:border-primary/30 rounded-2xl p-6 text-left transition-all hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            Creer depuis zero
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Commencez avec un formulaire vierge et ajoutez vos propres champs
          </p>
        </button>

        {/* Loading skeletons */}
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border/50 rounded-2xl p-6 animate-pulse space-y-3"
            >
              <div className="w-12 h-12 bg-muted rounded-2xl" />
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          ))}

        {/* Template cards */}
        {!isLoading &&
          filtered.map((template) => (
            <div
              key={template.id}
              className="group bg-surface border border-border/50 rounded-2xl p-6 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => setPreviewTemplate(template)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  {template.thumbnail_emoji}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                    CATEGORY_COLORS[template.category] ??
                      "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {CATEGORY_LABELS[template.category] ?? template.category}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              {template.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {template.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                  <FileText className="w-3 h-3" />
                  {countInputFields(template)} champ
                  {countInputFields(template) > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun template trouve
            </p>
          </div>
        )}
      </motion.div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewTemplate && (
          <TemplatePreviewModal
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onUse={handleUseTemplate}
            isPending={createFromTemplate.isPending}
            getFieldLabel={getFieldLabel}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Template Preview Modal ─── */

function TemplatePreviewModal({
  template,
  onClose,
  onUse,
  isPending,
  getFieldLabel,
}: {
  template: FormTemplate;
  onClose: () => void;
  onUse: (template: FormTemplate) => void;
  isPending: boolean;
  getFieldLabel: (type: string) => string;
}) {
  const inputFields = template.fields.filter(
    (f) => !["heading", "paragraph", "divider"].includes(f.field_type),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-2xl">
                {template.thumbnail_emoji}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {template.name}
                </h2>
                <span
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full border inline-block mt-1",
                    CATEGORY_COLORS[template.category] ??
                      "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {CATEGORY_LABELS[template.category] ?? template.category}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {template.description && (
            <p className="text-sm text-muted-foreground mt-3">
              {template.description}
            </p>
          )}
        </div>

        {/* Fields list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {inputFields.length} champ{inputFields.length > 1 ? "s" : ""} inclus
          </p>
          {template.fields.map((field, idx) => {
            const isLayout = ["heading", "paragraph", "divider"].includes(
              field.field_type,
            );

            if (field.field_type === "divider") {
              return <hr key={idx} className="border-border/50 my-2" />;
            }

            if (field.field_type === "heading") {
              return (
                <div key={idx} className="pt-2">
                  <p className="text-sm font-semibold text-foreground">
                    {field.label}
                  </p>
                </div>
              );
            }

            if (field.field_type === "paragraph") {
              return (
                <p key={idx} className="text-xs text-muted-foreground">
                  {field.label}
                </p>
              );
            }

            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
              >
                <div className="w-7 h-7 rounded-lg bg-surface border border-border/50 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {field.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {getFieldLabel(field.field_type)}
                    {field.is_required && (
                      <span className="text-primary ml-1">* requis</span>
                    )}
                  </p>
                </div>
                {field.is_required && (
                  <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Annuler
          </button>
          <button
            onClick={() => onUse(template)}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl bg-[#DC2626] text-white text-sm font-medium hover:bg-[#B91C1C] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creation...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Utiliser ce template
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
