"use client";

import { create } from "zustand";
import type { FormField } from "@/types/database";

interface FormBuilderState {
  fields: FormField[];
  setFields: (fields: FormField[]) => void;
  addField: (field: FormField) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  reorderFields: (activeId: string, overId: string) => void;

  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;

  previewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  fields: [],
  setFields: (fields) => set({ fields }),
  addField: (field) =>
    set((state) => ({ fields: [...state.fields, field] })),
  updateField: (id, updates) =>
    set((state) => ({
      fields: state.fields.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
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
}));
