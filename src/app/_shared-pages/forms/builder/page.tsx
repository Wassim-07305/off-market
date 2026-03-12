"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormMutations } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import {
  useFormBuilderStore,
  type BuilderField,
} from "@/stores/form-builder-store";
import { FORM_FIELD_TYPES } from "@/lib/constants";
import { CONDITIONAL_OPERATORS } from "@/lib/conditional-logic";
import { toast } from "sonner";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { cn } from "@/lib/utils";
import type { ConditionalLogic, ConditionalRule } from "@/types/database";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  GitBranch,
  X,
  Eye,
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Star,
  BarChart,
  Sliders,
  Calendar,
  Clock,
  Upload,
  Heading,
  Text,
  Minus,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Star,
  BarChart,
  Sliders,
  Calendar,
  Clock,
  Upload,
  Heading,
  Text,
  Minus,
};

function getFieldIcon(iconName: string) {
  return ICON_MAP[iconName] ?? Type;
}

export default function FormBuilderPage() {
  const router = useRouter();
  const { createForm, saveFields } = useFormMutations();
  const { user } = useAuth();
  const prefix = useRoutePrefix();

  const {
    title,
    description,
    fields,
    selectedFieldId,
    previewMode,
    setTitle,
    setDescription,
    setFields,
    addField,
    updateField,
    removeField,
    reorderFields,
    setSelectedFieldId,
    setPreviewMode,
    reset,
  } = useFormBuilderStore();

  // Reset store on mount for new form
  useEffect(() => {
    reset();
  }, [reset]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderFields(active.id as string, over.id as string);
    }
  };

  const handleAddField = (type: string) => {
    const typeConfig = FORM_FIELD_TYPES.find((t) => t.value === type);
    const newField: BuilderField = {
      id: crypto.randomUUID(),
      field_type: type,
      label: typeConfig?.label ?? "",
      description: "",
      placeholder: "",
      is_required: false,
      options: ["single_select", "multi_select", "dropdown"].includes(type)
        ? [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
          ]
        : [],
      conditional_logic: {},
      sort_order: fields.length,
    };
    addField(newField);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    if (!user) return;

    try {
      const form = await createForm.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        created_by: user.id,
      });

      if (fields.length > 0) {
        await saveFields.mutateAsync({
          formId: form.id,
          fields: fields.map((f, i) => ({
            field_type: f.field_type,
            label: f.label || "Sans titre",
            description: f.description || null,
            placeholder: f.placeholder || null,
            is_required: f.is_required,
            options: f.options.length > 0 ? f.options : [],
            conditional_logic: f.conditional_logic,
            sort_order: i,
          })),
        });
      }

      toast.success("Formulaire cree avec succes");
      router.push(`${prefix}/forms`);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const inputFields = fields.filter(
    (f) => !["heading", "paragraph", "divider"].includes(f.field_type),
  );

  if (previewMode) {
    return (
      <FormPreview
        title={title}
        description={description}
        fields={fields}
        onExit={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`${prefix}/forms`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(true)}
            className="h-9 px-4 rounded-[10px] border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Apercu
          </button>
          <button
            onClick={handleSave}
            disabled={createForm.isPending || saveFields.isPending}
            className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {createForm.isPending ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-4 min-h-[calc(100vh-12rem)]">
        {/* Left: Field type palette */}
        <div className="hidden lg:block">
          <div className="bg-surface border border-border rounded-xl p-4 sticky top-24">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Types de champs
            </h3>
            <div className="space-y-1">
              {FORM_FIELD_TYPES.map((type) => {
                const Icon = getFieldIcon(type.icon);
                return (
                  <button
                    key={type.value}
                    onClick={() => handleAddField(type.value)}
                    className="w-full h-8 px-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2 text-left"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Form canvas */}
        <div className="space-y-3">
          {/* Form title & description */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du formulaire"
              className="w-full text-2xl font-bold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optionnel)"
              className="w-full text-sm text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Sortable fields */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <SortableFieldCard
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => setSelectedFieldId(field.id)}
                  onRemove={() => removeField(field.id)}
                  onUpdate={(updates) => updateField(field.id, updates)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {fields.length === 0 && (
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
              <Type className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Aucun champ pour le moment
              </p>
              <p className="text-xs text-muted-foreground/60">
                Clique sur un type dans le panneau de gauche ou utilise le
                bouton ci-dessous
              </p>
            </div>
          )}

          {/* Mobile add field */}
          <div className="lg:hidden bg-surface border border-border border-dashed rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Ajouter un champ
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FORM_FIELD_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleAddField(type.value)}
                  className="h-7 px-2.5 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Configuration panel */}
        <div className="hidden lg:block">
          {selectedField ? (
            <FieldConfigPanel
              field={selectedField}
              onUpdate={(updates) => updateField(selectedField.id, updates)}
              inputFields={inputFields}
            />
          ) : (
            <div className="bg-surface border border-border rounded-xl p-5 text-center text-sm text-muted-foreground sticky top-24">
              <Type className="w-6 h-6 mx-auto mb-2 opacity-30" />
              Selectionne un champ pour le configurer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sortable Field Card ─── */

function SortableFieldCard({
  field,
  isSelected,
  onSelect,
  onRemove,
  onUpdate,
}: {
  field: BuilderField;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<BuilderField>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeConfig = FORM_FIELD_TYPES.find((t) => t.value === field.field_type);
  const Icon = typeConfig ? getFieldIcon(typeConfig.icon) : Type;
  const hasCondition =
    field.conditional_logic &&
    "enabled" in field.conditional_logic &&
    field.conditional_logic.enabled;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "bg-surface border rounded-xl p-4 cursor-pointer transition-all",
        isDragging && "opacity-50 shadow-lg",
        isSelected
          ? "border-primary ring-1 ring-primary/20"
          : "border-border hover:border-primary/30",
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-0.5 rounded hover:bg-muted transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-primary/60" />
          <span className="text-xs text-muted-foreground font-medium">
            {typeConfig?.label ?? field.field_type}
          </span>
        </div>
        {field.is_required && (
          <span className="text-[10px] text-primary font-medium bg-primary/5 px-1.5 py-0.5 rounded">
            Requis
          </span>
        )}
        {hasCondition && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
            <GitBranch className="w-3 h-3" />
            Conditionnel
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inline label edit */}
      <input
        value={field.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder="Label du champ..."
        className="w-full text-sm font-medium text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40 mb-2"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Field preview */}
      <FieldMiniPreview field={field} />
    </div>
  );
}

/* ─── Field Mini Preview ─── */

function FieldMiniPreview({ field }: { field: BuilderField }) {
  const type = field.field_type;

  if (type === "heading") {
    return (
      <div className="text-lg font-semibold text-foreground/30">
        {field.label || "Titre"}
      </div>
    );
  }
  if (type === "paragraph") {
    return (
      <div className="text-sm text-muted-foreground/50">
        {field.label || "Texte de paragraphe"}
      </div>
    );
  }
  if (type === "divider") {
    return <hr className="border-border" />;
  }
  if (type === "short_text" || type === "email" || type === "phone") {
    return (
      <div className="h-9 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center">
        <span className="text-xs text-muted-foreground/40">
          {field.placeholder || "Saisir une reponse..."}
        </span>
      </div>
    );
  }
  if (type === "long_text") {
    return (
      <div className="h-16 px-3 pt-2 bg-muted/50 border border-border/50 rounded-lg">
        <span className="text-xs text-muted-foreground/40">
          {field.placeholder || "Saisir une reponse longue..."}
        </span>
      </div>
    );
  }
  if (type === "number") {
    return (
      <div className="h-9 w-32 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center">
        <span className="text-xs text-muted-foreground/40">0</span>
      </div>
    );
  }
  if (type === "single_select" || type === "multi_select") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {(field.options.length > 0
          ? field.options
          : [{ label: "Option 1", value: "1" }]
        ).map((opt, i) => (
          <div
            key={i}
            className="h-8 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center gap-2 text-xs text-muted-foreground"
          >
            {type === "single_select" ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-border/60" />
            ) : (
              <div className="w-3.5 h-3.5 rounded border-2 border-border/60" />
            )}
            {opt.label}
          </div>
        ))}
      </div>
    );
  }
  if (type === "dropdown") {
    return (
      <div className="h-9 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center justify-between">
        <span className="text-xs text-muted-foreground/40">
          Selectionner...
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
      </div>
    );
  }
  if (type === "rating") {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className="w-6 h-6 text-muted-foreground/20" />
        ))}
      </div>
    );
  }
  if (type === "nps") {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center text-[10px] text-muted-foreground/40"
          >
            {i}
          </div>
        ))}
      </div>
    );
  }
  if (type === "scale") {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="w-9 h-8 rounded-md border border-border/50 flex items-center justify-center text-xs text-muted-foreground/40"
          >
            {n}
          </div>
        ))}
      </div>
    );
  }
  if (type === "date") {
    return (
      <div className="h-9 w-44 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground/40">jj/mm/aaaa</span>
      </div>
    );
  }
  if (type === "time") {
    return (
      <div className="h-9 w-32 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground/40">hh:mm</span>
      </div>
    );
  }
  if (type === "file_upload") {
    return (
      <div className="h-20 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center gap-1">
        <Upload className="w-5 h-5 text-muted-foreground/30" />
        <span className="text-[10px] text-muted-foreground/40">
          Glisser un fichier ici
        </span>
      </div>
    );
  }

  return null;
}

/* ─── Field Configuration Panel ─── */

function FieldConfigPanel({
  field,
  onUpdate,
  inputFields,
}: {
  field: BuilderField;
  onUpdate: (updates: Partial<BuilderField>) => void;
  inputFields: BuilderField[];
}) {
  const hasOptions = ["single_select", "multi_select", "dropdown"].includes(
    field.field_type,
  );

  const getLogic = (): ConditionalLogic => {
    if (field.conditional_logic && "enabled" in field.conditional_logic) {
      return field.conditional_logic as ConditionalLogic;
    }
    return {
      enabled: false,
      action: "show",
      rules: [{ fieldId: "", operator: "equals", value: "" }],
      logic: "and",
    };
  };

  const updateLogic = (logic: ConditionalLogic) => {
    onUpdate({ conditional_logic: logic });
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="text-sm font-semibold text-foreground">Configuration</h3>

      {/* Label */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Label
        </label>
        <input
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Description
        </label>
        <input
          value={field.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Texte d'aide..."
          className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
        />
      </div>

      {/* Placeholder */}
      {![
        "heading",
        "paragraph",
        "divider",
        "rating",
        "nps",
        "scale",
        "file_upload",
        "single_select",
        "multi_select",
      ].includes(field.field_type) && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Placeholder
          </label>
          <input
            value={field.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* Required toggle */}
      {!["heading", "paragraph", "divider"].includes(field.field_type) && (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={field.is_required}
              onChange={(e) => onUpdate({ is_required: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-foreground">Requis</span>
        </label>
      )}

      {/* Options editor */}
      {hasOptions && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Options
          </label>
          <div className="space-y-1.5">
            {field.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  value={opt.label}
                  onChange={(e) => {
                    const newOptions = [...field.options];
                    newOptions[i] = {
                      label: e.target.value,
                      value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    };
                    onUpdate({ options: newOptions });
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 h-8 px-2.5 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => {
                    const newOptions = field.options.filter((_, j) => j !== i);
                    onUpdate({ options: newOptions });
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const newOptions = [
                ...field.options,
                {
                  label: `Option ${field.options.length + 1}`,
                  value: `option_${field.options.length + 1}`,
                },
              ];
              onUpdate({ options: newOptions });
            }}
            className="mt-2 text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Ajouter une option
          </button>
        </div>
      )}

      {/* Conditional Logic */}
      {inputFields.filter((f) => f.id !== field.id).length > 0 && (
        <div className="pt-3 border-t border-border/50">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={getLogic().enabled}
              onChange={(e) => {
                updateLogic({ ...getLogic(), enabled: e.target.checked });
              }}
              className="rounded border-border"
            />
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-foreground">
                Logique conditionnelle
              </span>
            </div>
          </label>

          {getLogic().enabled && (
            <ConditionalLogicEditor
              logic={getLogic()}
              onChange={updateLogic}
              availableFields={inputFields.filter((f) => f.id !== field.id)}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Conditional Logic Editor ─── */

function ConditionalLogicEditor({
  logic,
  onChange,
  availableFields,
}: {
  logic: ConditionalLogic;
  onChange: (logic: ConditionalLogic) => void;
  availableFields: BuilderField[];
}) {
  const updateRule = (idx: number, updates: Partial<ConditionalRule>) => {
    const newRules = logic.rules.map((r, i) =>
      i === idx ? { ...r, ...updates } : r,
    );
    onChange({ ...logic, rules: newRules });
  };

  const addRule = () => {
    onChange({
      ...logic,
      rules: [...logic.rules, { fieldId: "", operator: "equals", value: "" }],
    });
  };

  const removeRule = (idx: number) => {
    if (logic.rules.length <= 1) return;
    onChange({ ...logic, rules: logic.rules.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={logic.action}
          onChange={(e) =>
            onChange({ ...logic, action: e.target.value as "show" | "hide" })
          }
          className="h-8 px-2 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none"
        >
          <option value="show">Afficher si</option>
          <option value="hide">Masquer si</option>
        </select>
        {logic.rules.length > 1 && (
          <select
            value={logic.logic}
            onChange={(e) =>
              onChange({ ...logic, logic: e.target.value as "and" | "or" })
            }
            className="h-8 px-2 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none"
          >
            <option value="and">toutes les conditions</option>
            <option value="or">une condition</option>
          </select>
        )}
      </div>

      {logic.rules.map((rule, idx) => {
        const operatorConfig = CONDITIONAL_OPERATORS.find(
          (o) => o.value === rule.operator,
        );
        return (
          <div
            key={idx}
            className="space-y-1.5 p-2.5 bg-muted/50 rounded-lg border border-border/30"
          >
            <select
              value={rule.fieldId}
              onChange={(e) => updateRule(idx, { fieldId: e.target.value })}
              className="w-full h-8 px-2 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none"
            >
              <option value="">Champ...</option>
              {availableFields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label || "Sans titre"}
                </option>
              ))}
            </select>
            <select
              value={rule.operator}
              onChange={(e) =>
                updateRule(idx, {
                  operator: e.target.value as ConditionalRule["operator"],
                })
              }
              className="w-full h-8 px-2 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none"
            >
              {CONDITIONAL_OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
            {operatorConfig?.needsValue !== false && (
              <input
                value={rule.value}
                onChange={(e) => updateRule(idx, { value: e.target.value })}
                placeholder="Valeur..."
                className="w-full h-8 px-2 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            )}
            {logic.rules.length > 1 && (
              <button
                onClick={() => removeRule(idx)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-red-500 transition-colors mt-1"
              >
                <X className="w-3 h-3" />
                Supprimer
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={addRule}
        className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
      >
        <Plus className="w-3 h-3" />
        Ajouter une condition
      </button>
    </div>
  );
}

/* ─── Form Preview ─── */

function FormPreview({
  title,
  description,
  fields,
  onExit,
}: {
  title: string;
  description: string;
  fields: BuilderField[];
  onExit: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour a l&apos;editeur
        </button>
        <span className="text-xs font-medium text-primary bg-primary/5 px-3 py-1.5 rounded-full">
          Mode apercu
        </span>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-surface border border-border rounded-xl p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {title || "Sans titre"}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {fields.map((field) => {
          if (field.field_type === "heading") {
            return (
              <h2
                key={field.id}
                className="text-lg font-semibold text-foreground pt-4"
              >
                {field.label}
              </h2>
            );
          }
          if (field.field_type === "paragraph") {
            return (
              <p key={field.id} className="text-sm text-muted-foreground">
                {field.label}
              </p>
            );
          }
          if (field.field_type === "divider") {
            return <hr key={field.id} className="border-border" />;
          }

          return (
            <div
              key={field.id}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <label className="block text-sm font-medium text-foreground mb-1">
                {field.label || "Sans titre"}
                {field.is_required && (
                  <span className="text-primary ml-1">*</span>
                )}
              </label>
              {field.description && (
                <p className="text-xs text-muted-foreground mb-3">
                  {field.description}
                </p>
              )}
              <FieldMiniPreview field={field} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
