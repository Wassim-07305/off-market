"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormMutations } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import { FORM_FIELD_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Eye,
} from "lucide-react";

interface BuilderField {
  id: string;
  field_type: string;
  label: string;
  description: string;
  placeholder: string;
  is_required: boolean;
  options: Array<{ label: string; value: string }>;
}

export default function FormBuilderPage() {
  const router = useRouter();
  const { createForm, saveFields } = useFormMutations();
  const { user } = useAuth();
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
        })),
      });
    }

    toast.success("Formulaire cree");
    router.push("/forms");
  };

  const selectedField = fields.find((f) => f.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/forms"
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main builder */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du formulaire"
              className="w-full text-xl font-semibold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground"
              style={{ fontFamily: "Instrument Serif, serif" }}
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
              (t) => t.value === field.field_type
            );
            return (
              <div
                key={field.id}
                onClick={() => setSelectedId(field.id)}
                className={cn(
                  "bg-surface border rounded-xl p-4 cursor-pointer transition-all",
                  selectedId === field.id
                    ? "border-primary shadow-sm"
                    : "border-border hover:border-border/80"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {typeConfig?.label ?? field.field_type}
                  </span>
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
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4 sticky top-24">
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
