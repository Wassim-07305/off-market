"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormMutations } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import { FORM_FIELD_TYPES } from "@/lib/constants";
import { CONDITIONAL_OPERATORS } from "@/lib/conditional-logic";
import { toast } from "sonner";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { cn } from "@/lib/utils";
import type { ConditionalLogic, ConditionalRule } from "@/types/database";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  GitBranch,
  X,
} from "lucide-react";

interface BuilderField {
  id: string;
  field_type: string;
  label: string;
  description: string;
  placeholder: string;
  is_required: boolean;
  options: Array<{ label: string; value: string }>;
  conditional_logic: ConditionalLogic | Record<string, never>;
}

const EMPTY_LOGIC: ConditionalLogic = {
  enabled: false,
  action: "show",
  rules: [{ fieldId: "", operator: "equals", value: "" }],
  logic: "and",
};

export default function FormBuilderPage() {
  const router = useRouter();
  const { createForm, saveFields } = useFormMutations();
  const { user } = useAuth();
  const prefix = useRoutePrefix();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addField = (type: string) => {
    const newField: BuilderField = {
      id: crypto.randomUUID(),
      field_type: type,
      label: "",
      description: "",
      placeholder: "",
      is_required: false,
      options: [],
      conditional_logic: {},
    };
    setFields([...fields, newField]);
    setSelectedId(newField.id);
  };

  const updateField = (id: string, updates: Partial<BuilderField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    if (!user) return;

    const form = await createForm.mutateAsync({
      title,
      description,
      created_by: user.id,
    });

    if (fields.length > 0) {
      await saveFields.mutateAsync({
        formId: form.id,
        fields: fields.map((f) => ({
          field_type: f.field_type,
          label: f.label || "Sans titre",
          description: f.description || null,
          placeholder: f.placeholder || null,
          is_required: f.is_required,
          options: f.options.length > 0 ? f.options : [],
          conditional_logic: f.conditional_logic,
        })),
      });
    }

    toast.success("Formulaire cree");
    router.push(`${prefix}/forms`);
  };

  const selectedField = fields.find((f) => f.id === selectedId);

  // Fields that can be referenced in conditions (only input fields, not structural)
  const inputFields = fields.filter(
    (f) => !["heading", "paragraph", "divider"].includes(f.field_type),
  );

  // Get conditional logic for selected field (or empty default)
  const getLogic = (field: BuilderField): ConditionalLogic => {
    if (field.conditional_logic && "enabled" in field.conditional_logic) {
      return field.conditional_logic as ConditionalLogic;
    }
    return EMPTY_LOGIC;
  };

  const updateLogic = (id: string, logic: ConditionalLogic) => {
    updateField(id, { conditional_logic: logic });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`${prefix}/forms`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <button
          onClick={handleSave}
          disabled={createForm.isPending}
          className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main builder */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du formulaire"
              className="w-full text-xl font-semibold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground font-bold"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optionnel)"
              className="w-full text-sm text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground"
            />
          </div>

          {fields.map((field) => {
            const typeConfig = FORM_FIELD_TYPES.find(
              (t) => t.value === field.field_type,
            );
            const logic = getLogic(field);
            const hasCondition = logic.enabled;
            return (
              <div
                key={field.id}
                onClick={() => setSelectedId(field.id)}
                className={cn(
                  "bg-surface border rounded-xl p-4 cursor-pointer transition-all",
                  selectedId === field.id
                    ? "border-primary shadow-sm"
                    : "border-border hover:border-border/80",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {typeConfig?.label ?? field.field_type}
                  </span>
                  {hasCondition && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/5 px-1.5 py-0.5 rounded">
                      <GitBranch className="w-3 h-3" />
                      Conditionnel
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(field.id);
                    }}
                    className="ml-auto w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-error transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  value={field.label}
                  onChange={(e) =>
                    updateField(field.id, { label: e.target.value })
                  }
                  placeholder="Label du champ"
                  className="w-full text-sm font-medium text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );
          })}

          {/* Add field buttons */}
          <div className="bg-surface border border-border border-dashed rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Ajouter un champ
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FORM_FIELD_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => addField(type.value)}
                  className="h-7 px-2.5 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Config sidebar */}
        <div className="hidden lg:block">
          {selectedField ? (
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h3 className="text-sm font-semibold text-foreground">
                Configuration
              </h3>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Label
                </label>
                <input
                  value={selectedField.label}
                  onChange={(e) =>
                    updateField(selectedField.id, { label: e.target.value })
                  }
                  className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <input
                  value={selectedField.description}
                  onChange={(e) =>
                    updateField(selectedField.id, {
                      description: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Placeholder
                </label>
                <input
                  value={selectedField.placeholder}
                  onChange={(e) =>
                    updateField(selectedField.id, {
                      placeholder: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedField.is_required}
                  onChange={(e) =>
                    updateField(selectedField.id, {
                      is_required: e.target.checked,
                    })
                  }
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">Requis</span>
              </label>

              {/* ─── Conditional Logic ─── */}
              {inputFields.filter((f) => f.id !== selectedField.id).length >
                0 && (
                <div className="pt-3 border-t border-border/50">
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={getLogic(selectedField).enabled}
                      onChange={(e) => {
                        const current = getLogic(selectedField);
                        updateLogic(selectedField.id, {
                          ...current,
                          enabled: e.target.checked,
                        });
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

                  {getLogic(selectedField).enabled && (
                    <ConditionalLogicEditor
                      logic={getLogic(selectedField)}
                      onChange={(logic) => updateLogic(selectedField.id, logic)}
                      availableFields={inputFields.filter(
                        (f) => f.id !== selectedField.id,
                      )}
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-5 text-center text-sm text-muted-foreground">
              Selectionne un champ pour le configurer
            </div>
          )}
        </div>
      </div>
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
    onChange({
      ...logic,
      rules: logic.rules.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-3">
      {/* Action */}
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

      {/* Rules */}
      {logic.rules.map((rule, idx) => {
        const operatorConfig = CONDITIONAL_OPERATORS.find(
          (o) => o.value === rule.operator,
        );
        return (
          <div
            key={idx}
            className="space-y-1.5 p-2.5 bg-muted/50 rounded-lg border border-border/30"
          >
            {/* Field selector */}
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

            {/* Operator */}
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

            {/* Value (if operator needs it) */}
            {operatorConfig?.needsValue !== false && (
              <input
                value={rule.value}
                onChange={(e) => updateRule(idx, { value: e.target.value })}
                placeholder="Valeur..."
                className="w-full h-8 px-2 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            )}

            {/* Remove rule */}
            {logic.rules.length > 1 && (
              <button
                onClick={() => removeRule(idx)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-error transition-colors mt-1"
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
