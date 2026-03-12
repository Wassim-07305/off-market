"use client";

import { create } from "zustand";
import type { FormField, ConditionalLogic } from "@/types/database";

export interface BuilderField {
  id: string;
  field_type: string;
  label: string;
  description: string;
  placeholder: string;
  is_required: boolean;
  options: Array<{ label: string; value: string }>;
  conditional_logic: ConditionalLogic | Record<string, never>;
  sort_order: number;
}

interface FormBuilderState {
  // Form metadata
  title: string;
  description: string;
  status: "draft" | "active" | "closed" | "archived";
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setStatus: (status: "draft" | "active" | "closed" | "archived") => void;

  // Fields
  fields: BuilderField[];
  setFields: (fields: BuilderField[]) => void;
  addField: (field: BuilderField) => void;
  updateField: (id: string, updates: Partial<BuilderField>) => void;
  removeField: (id: string) => void;
  reorderFields: (activeId: string, overId: string) => void;

  // Selection
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;

  // Preview
  previewMode: boolean;
  setPreviewMode: (mode: boolean) => void;

  // Reset
  reset: () => void;

  // Load from existing form
  loadForm: (form: {
    title: string;
    description: string | null;
    status: string;
    form_fields: FormField[];
  }) => void;
}

function formFieldToBuilderField(f: FormField): BuilderField {
  return {
    id: f.id,
    field_type: f.field_type,
    label: f.label,
    description: f.description ?? "",
    placeholder: f.placeholder ?? "",
    is_required: f.is_required,
    options: f.options ?? [],
    conditional_logic: f.conditional_logic,
    sort_order: f.sort_order,
  };
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  title: "",
  description: "",
  status: "draft",
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setStatus: (status) => set({ status }),

  fields: [],
  setFields: (fields) => set({ fields }),
  addField: (field) =>
    set((state) => ({
      fields: [...state.fields, field],
      selectedFieldId: field.id,
    })),
  updateField: (id, updates) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  removeField: (id) =>
    set((state) => ({
      fields: state.fields.filter((f) => f.id !== id),
      selectedFieldId:
        state.selectedFieldId === id ? null : state.selectedFieldId,
    })),
  reorderFields: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.fields.findIndex((f) => f.id === activeId);
      const newIndex = state.fields.findIndex((f) => f.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      const newFields = [...state.fields];
      const [removed] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, removed);
      return {
        fields: newFields.map((f, i) => ({ ...f, sort_order: i })),
      };
    }),

  selectedFieldId: null,
  setSelectedFieldId: (id) => set({ selectedFieldId: id }),

  previewMode: false,
  setPreviewMode: (mode) => set({ previewMode: mode }),

  reset: () =>
    set({
      title: "",
      description: "",
      status: "draft",
      fields: [],
      selectedFieldId: null,
      previewMode: false,
    }),

  loadForm: (form) =>
    set({
      title: form.title,
      description: form.description ?? "",
      status:
        (form.status as "draft" | "active" | "closed" | "archived") ?? "draft",
      fields: (form.form_fields ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(formFieldToBuilderField),
      selectedFieldId: null,
      previewMode: false,
    }),
}));
