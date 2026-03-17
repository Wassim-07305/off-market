"use client";

import { useState, useMemo } from "react";
import { useContractTemplates } from "@/hooks/use-contracts";
import { useStudents } from "@/hooks/use-students";
import type { ContractTemplate, TemplateVariable } from "@/types/billing";
import { cn } from "@/lib/utils";
import {
  X,
  FileText,
  User,
  Settings,
  Eye,
  Send,
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
} from "lucide-react";

interface ContractWizardProps {
  onClose: () => void;
  onCreate: (data: {
    client_id: string;
    title: string;
    content: string;
    template_id?: string;
    expires_at?: string;
  }) => void;
  isCreating: boolean;
}

const STEPS = [
  { id: 0, label: "Modele", icon: FileText },
  { id: 1, label: "Client", icon: User },
  { id: 2, label: "Variables", icon: Settings },
  { id: 3, label: "Apercu", icon: Eye },
] as const;

export function ContractWizard({
  onClose,
  onCreate,
  isCreating,
}: ContractWizardProps) {
  const { templates } = useContractTemplates();
  const { students: clients } = useStudents();

  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContractTemplate | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [clientId, setClientId] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [expiryDays, setExpiryDays] = useState("30");
  const [clientSearch, setClientSearch] = useState("");

  const activeTemplates = templates.filter((t) => t.is_active);

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    const lower = clientSearch.toLowerCase();
    return clients.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(lower) ||
        c.email?.toLowerCase().includes(lower),
    );
  }, [clients, clientSearch]);

  const selectedClient = clients.find((c) => c.id === clientId);

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.title);
    setContent(template.content);
    const vars: Record<string, string> = {};
    template.variables.forEach((v) => {
      vars[v.key] = v.defaultValue ?? "";
    });
    setVariables(vars);
  };

  const handleUseBlank = () => {
    setSelectedTemplate(null);
    setTitle("");
    setContent("");
    setVariables({});
  };

  const renderContent = () => {
    let rendered = content;
    Object.entries(variables).forEach(([key, value]) => {
      rendered = rendered.replaceAll(`{{${key}}}`, value || `{{${key}}}`);
    });
    // Auto-fill client info
    if (selectedClient) {
      rendered = rendered.replaceAll("{{nom}}", selectedClient.full_name ?? "");
      rendered = rendered.replaceAll("{{email}}", selectedClient.email ?? "");
    }
    return rendered;
  };

  const handleCreate = () => {
    if (!clientId || !title) return;
    const expiresAt = expiryDays
      ? new Date(Date.now() + parseInt(expiryDays) * 86400000).toISOString()
      : undefined;
    onCreate({
      client_id: clientId,
      title,
      content: renderContent(),
      template_id: selectedTemplate?.id,
      expires_at: expiresAt,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return selectedTemplate !== null || (title && content);
      case 1:
        return !!clientId;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4 flex flex-col">
        {/* Header with steps */}
        <div className="border-b border-border">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-lg font-semibold text-foreground">
              Nouveau contrat
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1 px-6 pb-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === i;
              const isDone = step > i;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (isDone) setStep(i);
                  }}
                  disabled={!isDone && !isActive}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    isActive && "bg-primary/10 text-primary",
                    isDone &&
                      "bg-emerald-500/10 text-emerald-600 cursor-pointer",
                    !isActive &&
                      !isDone &&
                      "text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Template selection */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choisissez un modele existant ou commencez un contrat vierge
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Blank option */}
                <button
                  onClick={handleUseBlank}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    !selectedTemplate
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      Contrat vierge
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Redigez un contrat de zero
                  </p>
                </button>

                {/* Templates */}
                {activeTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      selectedTemplate?.id === t.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {t.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {t.variables.length} variable
                      {t.variables.length !== 1 ? "s" : ""} -{" "}
                      {t.content.slice(0, 80)}...
                    </p>
                  </button>
                ))}
              </div>

              {/* If blank, show title + content fields */}
              {!selectedTemplate && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Titre du contrat
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contrat de coaching..."
                      className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Contenu
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                      placeholder="Redigez le contenu du contrat..."
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Client selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selectionnez le client pour ce contrat
              </p>
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setClientId(c.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      clientId === c.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {c.avatar_url ? (
                        <img
                          src={c.avatar_url}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {c.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.email}
                      </p>
                    </div>
                    {clientId === c.id && (
                      <Check className="w-4 h-4 text-primary ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Variables */}
          {step === 2 && (
            <div className="space-y-4">
              {selectedTemplate && selectedTemplate.variables.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Remplissez les variables du modele
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedTemplate.variables.map((v: TemplateVariable) => (
                      <div key={v.key}>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          {v.label}
                        </label>
                        <input
                          type={
                            v.type === "number"
                              ? "number"
                              : v.type === "date"
                                ? "date"
                                : v.type === "email"
                                  ? "email"
                                  : "text"
                          }
                          value={variables[v.key] ?? ""}
                          onChange={(e) =>
                            setVariables((prev) => ({
                              ...prev,
                              [v.key]: e.target.value,
                            }))
                          }
                          placeholder={v.defaultValue ?? ""}
                          className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {`{{${v.key}}}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Parametres additionnels
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Titre du contrat
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* Expiry */}
              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Expiration du contrat
                </label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Pas d&apos;expiration</option>
                  <option value="7">7 jours</option>
                  <option value="14">14 jours</option>
                  <option value="30">30 jours</option>
                  <option value="60">60 jours</option>
                  <option value="90">90 jours</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Apercu du contrat avant envoi
                </p>
                <span className="text-xs text-muted-foreground">
                  Client : {selectedClient?.full_name}
                </span>
              </div>

              {/* Contract preview card (A4-like) */}
              <div className="bg-surface border border-border rounded-xl p-8 shadow-sm max-h-96 overflow-y-auto">
                <div className="border-b-2 border-gray-900 pb-4 mb-6">
                  <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date().toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {renderContent()}
                </div>
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        Le prestataire
                      </p>
                      <div className="h-16 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <p className="text-xs text-gray-400">Signature</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Le client</p>
                      <div className="h-16 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <p className="text-xs text-gray-400">
                          Signature electronique
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {expiryDays && (
                <p className="text-xs text-muted-foreground text-center">
                  Ce contrat expirera dans {expiryDays} jours si non signe
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
            className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Annuler" : "Retour"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!clientId || !title || isCreating}
              className="h-10 px-6 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isCreating ? (
                "Creation..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Creer le contrat
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
