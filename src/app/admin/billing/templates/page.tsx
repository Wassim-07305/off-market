"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useContractTemplates } from "@/hooks/use-contracts";
import { useAuth } from "@/hooks/use-auth";
import type { TemplateVariable } from "@/types/billing";
import {
  FileText,
  Plus,
  X,
  Trash2,
  Edit3,
  Copy,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const VARIABLE_TYPES: { value: TemplateVariable["type"]; label: string }[] = [
  { value: "text", label: "Texte" },
  { value: "number", label: "Nombre" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
];

export default function TemplatesPage() {
  const { user } = useAuth();
  const { templates, isLoading, createTemplate, updateTemplate } = useContractTemplates();
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [variables, setVariables] = useState<TemplateVariable[]>([]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setVariables([]);
    setEditingId(null);
    setShowEditor(false);
  };

  const openEditor = (template?: (typeof templates)[0]) => {
    if (template) {
      setEditingId(template.id);
      setTitle(template.title);
      setContent(template.content);
      setVariables(template.variables ?? []);
    } else {
      setEditingId(null);
      setTitle("");
      setContent("");
      setVariables([]);
    }
    setShowEditor(true);
  };

  const addVariable = () => {
    setVariables((prev) => [...prev, { key: "", label: "", type: "text" }]);
  };

  const updateVariable = (index: number, field: keyof TemplateVariable, value: string) => {
    setVariables((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        const updated = { ...v, [field]: value };
        // Auto-generate key from label
        if (field === "label") {
          updated.key = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "");
        }
        return updated;
      })
    );
  };

  const removeVariable = (index: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title || !content || !user) return;
    if (editingId) {
      updateTemplate.mutate(
        { id: editingId, title, content, variables },
        { onSuccess: resetForm }
      );
    } else {
      createTemplate.mutate(
        { title, content, variables, created_by: user.id },
        { onSuccess: resetForm }
      );
    }
  };

  const handleToggleActive = (id: string, currentlyActive: boolean) => {
    updateTemplate.mutate({ id, is_active: !currentlyActive });
  };

  const insertVariable = (key: string) => {
    setContent((prev) => prev + `{{${key}}}`);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Modeles de contrats</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Creez des modeles reutilisables avec des variables dynamiques
          </p>
        </div>
        <button
          onClick={() => openEditor()}
          className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau modele
        </button>
      </motion.div>

      {/* Templates grid */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun modele cree</p>
            <button
              onClick={() => openEditor()}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Creer votre premier modele
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-surface border border-border rounded-xl p-5 space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{template.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {template.variables?.length ?? 0} variable{(template.variables?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(template.id, template.is_active)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title={template.is_active ? "Desactiver" : "Activer"}
                  >
                    {template.is_active ? (
                      <ToggleRight className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">{template.content}</p>
                {template.variables && template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((v) => (
                      <span
                        key={v.key}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono"
                      >
                        {`{{${v.key}}}`}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditor(template)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    title="Modifier"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const cloned = { ...template };
                      openEditor({ ...cloned, id: "", title: cloned.title + " (copie)" });
                    }}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    title="Dupliquer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? "Modifier le modele" : "Nouveau modele"}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nom du modele
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contrat de coaching standard..."
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Variables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Variables dynamiques</label>
                  <button
                    onClick={addVariable}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Ajouter
                  </button>
                </div>
                {variables.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Ajoutez des variables pour personnaliser chaque contrat (ex: nom, montant, date)
                  </p>
                ) : (
                  <div className="space-y-2">
                    {variables.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={v.label}
                          onChange={(e) => updateVariable(i, "label", e.target.value)}
                          placeholder="Label (ex: Montant)"
                          className="flex-1 h-9 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-xs text-muted-foreground font-mono min-w-[80px]">
                          {v.key ? `{{${v.key}}}` : "..."}
                        </span>
                        <select
                          value={v.type}
                          onChange={(e) => updateVariable(i, "type", e.target.value)}
                          className="h-9 px-2 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {VARIABLE_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeVariable(i)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => insertVariable(v.key)}
                          disabled={!v.key}
                          className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-30"
                        >
                          Inserer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Contenu du modele
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  placeholder="Redigez le contenu du contrat. Utilisez {{variable}} pour les champs dynamiques..."
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={resetForm}
                className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!title || !content || createTemplate.isPending || updateTemplate.isPending}
                className="h-10 px-6 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {createTemplate.isPending || updateTemplate.isPending
                  ? "Enregistrement..."
                  : editingId
                  ? "Mettre a jour"
                  : "Creer le modele"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
