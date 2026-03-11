"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useContracts, useContractTemplates } from "@/hooks/use-contracts";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import type { ContractStatus, ContractTemplate } from "@/types/billing";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Send,
  CheckCircle,
  XCircle,
  X,
  ChevronDown,
  Eye,
} from "lucide-react";

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_TABS: { label: string; value: ContractStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Brouillons", value: "draft" },
  { label: "Envoyes", value: "sent" },
  { label: "Signes", value: "signed" },
  { label: "Annules", value: "cancelled" },
];

export default function ContractsPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { contracts, isLoading, createContract, sendContract, updateContract } =
    useContracts({
      status: statusFilter === "all" ? undefined : statusFilter,
    });

  const filtered = search
    ? contracts.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.client?.full_name?.toLowerCase().includes(search.toLowerCase()),
      )
    : contracts;

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
          <h1 className="text-3xl font-semibold text-foreground">Contrats</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestion des contrats clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau contrat
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un contrat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface border border-border rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun contrat trouve
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Contrat
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Client
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Statut
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Date
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contract) => (
                  <tr
                    key={contract.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {contract.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">
                        {contract.client?.full_name ?? "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contract.client?.email ?? ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={contract.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(contract.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/billing/contracts/${contract.id}`}
                          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {contract.status === "draft" && (
                          <button
                            onClick={() => sendContract.mutate(contract.id)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-blue-500"
                            title="Envoyer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {contract.status === "sent" && (
                          <button
                            onClick={() =>
                              updateContract.mutate({
                                id: contract.id,
                                status: "cancelled",
                              })
                            }
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-red-500"
                            title="Annuler"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateContractModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => {
            createContract.mutate(
              { ...data, created_by: user?.id ?? "" },
              { onSuccess: () => setShowCreateModal(false) },
            );
          }}
          isCreating={createContract.isPending}
        />
      )}
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
    sent: { label: "Envoye", className: "bg-blue-500/10 text-blue-600" },
    signed: { label: "Signe", className: "bg-emerald-500/10 text-emerald-600" },
    cancelled: { label: "Annule", className: "bg-red-500/10 text-red-600" },
  };
  const c = config[status] ?? config.draft;
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function CreateContractModal({
  onClose,
  onCreate,
  isCreating,
}: {
  onClose: () => void;
  onCreate: (data: {
    client_id: string;
    title: string;
    content: string;
    template_id?: string;
  }) => void;
  isCreating: boolean;
}) {
  const { templates } = useContractTemplates();
  const { students: clients } = useStudents();
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContractTemplate | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [clientId, setClientId] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.title);
    setContent(template.content);
    const vars: Record<string, string> = {};
    template.variables.forEach((v) => {
      vars[v.key] = "";
    });
    setVariables(vars);
  };

  const renderContent = () => {
    let rendered = content;
    Object.entries(variables).forEach(([key, value]) => {
      rendered = rendered.replaceAll(`{{${key}}}`, value || `{{${key}}}`);
    });
    return rendered;
  };

  const handleCreate = () => {
    if (!clientId || !title) return;
    onCreate({
      client_id: clientId,
      title,
      content: renderContent(),
      template_id: selectedTemplate?.id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
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

        <div className="p-6 space-y-4">
          {/* Template selector */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Modele (optionnel)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                      selectedTemplate?.id === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contrat de coaching..."
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Template variables */}
          {selectedTemplate && selectedTemplate.variables.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Variables du modele
              </p>
              {selectedTemplate.variables.map((v) => (
                <div key={v.key}>
                  <label className="block text-xs text-muted-foreground mb-1">
                    {v.label}
                  </label>
                  <input
                    type={
                      v.type === "number"
                        ? "number"
                        : v.type === "date"
                          ? "date"
                          : "text"
                    }
                    value={variables[v.key] ?? ""}
                    onChange={(e) =>
                      setVariables((prev) => ({
                        ...prev,
                        [v.key]: e.target.value,
                      }))
                    }
                    className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contenu
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Contenu du contrat..."
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={!clientId || !title || isCreating}
            className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isCreating ? "Creation..." : "Creer le contrat"}
          </button>
        </div>
      </div>
    </div>
  );
}
