"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  Sparkles,
  DollarSign,
  Receipt,
  Clock,
  Plus,
  Download,
  Upload,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { TabsList, TabsContent } from "@/components/ui/tabs";
import {
  useFinancialEntries,
  useFinancialKPIs,
  useTogglePaid,
  useDeleteEntry,
  useClientProfiles,
  type FinancialEntryFilters,
} from "@/hooks/use-financial-entries";
import { useBillingStats } from "@/hooks/use-invoices";
import { FinancialEntryModal } from "@/components/finances/entry-modal";
import { InvoicesTab } from "@/components/finances/invoices-tab";
import { EcheanciersTab } from "@/components/finances/echeanciers-tab";
import { CommissionsTab } from "@/components/finances/commissions-tab";
import { ProjectionsTab } from "@/components/finances/projections-tab";
import { exportToCSV } from "@/hooks/use-reports";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────

type FinanceTab =
  | "entrees"
  | "échéanciers"
  | "projections"
  | "factures"
  | "commissions";

const TABS = [
  { value: "entrees", label: "Entrees" },
  { value: "échéanciers", label: "Échéanciers" },
  { value: "projections", label: "Projections" },
  { value: "factures", label: "Factures" },
  { value: "commissions", label: "Commissions" },
];

// ─── KPI Card ──────────────────────────────

function KPICard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: string;
  icon: typeof TrendingUp;
  color: string;
  bgColor: string;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center",
            bgColor,
          )}
        >
          <Icon className={cn("w-4 h-4", color)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">
        {value}
      </p>
    </motion.div>
  );
}

// ─── Type badge ────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const isCA = type === "ca" || type === "récurrent";
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-md text-[10px] font-medium",
        isCA
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      )}
    >
      {type === "ca"
        ? "CA"
        : type === "récurrent"
          ? "Recurrent"
          : type === "charge"
            ? "Charge"
            : "Prestataire"}
    </span>
  );
}

// ─── Entrees tab content ───────────────────

function EntreesTab() {
  const [filters, setFilters] = useState<FinancialEntryFilters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: entries = [], isLoading } = useFinancialEntries(filters);
  const { data: clients = [] } = useClientProfiles();
  const togglePaid = useTogglePaid();
  const deleteEntry = useDeleteEntry();

  const clientOptions = [
    { value: "", label: "Tous les clients" },
    ...clients.map((c) => ({ value: c.id, label: c.full_name || c.email })),
  ];

  const typeOptions = [
    { value: "", label: "Tous les types" },
    { value: "ca", label: "CA" },
    { value: "récurrent", label: "Recurrent" },
    { value: "charge", label: "Charge" },
    { value: "prestataire", label: "Prestataire" },
  ];

  const handleExport = useCallback(() => {
    if (entries.length === 0) {
      toast.error("Aucune entree a exporter");
      return;
    }
    exportToCSV(
      `finances_entrees_${new Date().toISOString().split("T")[0]}.csv`,
      [
        "Description",
        "Type",
        "Montant",
        "Client",
        "Prestataire",
        "Paye",
        "Date",
      ],
      entries.map((e) => [
        e.label,
        e.type,
        String(e.amount),
        e.client?.full_name ?? "",
        e.prestataire ?? "",
        e.is_paid ? "Oui" : "Non",
        e.date,
      ]),
    );
    toast.success("Export CSV terminé");
  }, [entries]);

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm("Supprimer cette entree ?")) {
        deleteEntry.mutate(id);
      }
    },
    [deleteEntry],
  );

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap items-end gap-3">
        <Select
          options={clientOptions}
          value={filters.clientId ?? ""}
          onChange={(v) =>
            setFilters((prev) => ({ ...prev, clientId: v || undefined }))
          }
          placeholder="Tous les clients"
          wrapperClassName="w-48"
        />
        <Select
          options={typeOptions}
          value={filters.type ?? ""}
          onChange={(v) =>
            setFilters((prev) => ({ ...prev, type: v || undefined }))
          }
          placeholder="Tous les types"
          wrapperClassName="w-40"
        />
        <Input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              dateFrom: e.target.value || undefined,
            }))
          }
          placeholder="Date debut"
          wrapperClassName="w-40"
        />
        <Input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              dateTo: e.target.value || undefined,
            }))
          }
          placeholder="Date fin"
          wrapperClassName="w-40"
        />
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => toast.info("Import CSV bientot disponible")}
          >
            Import
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setEditingId(null);
              setModalOpen(true);
            }}
          >
            Nouvelle entree
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Montant
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Client
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Prestataire
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Paye
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt className="w-8 h-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        Aucune entree financiere
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setEditingId(null);
                          setModalOpen(true);
                        }}
                      >
                        Ajouter une entree
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {entry.label}
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={entry.type} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      <span
                        className={cn(
                          entry.type === "charge" ||
                            entry.type === "prestataire"
                            ? "text-red-600 dark:text-red-400"
                            : "text-foreground",
                        )}
                      >
                        {entry.type === "charge" || entry.type === "prestataire"
                          ? "- "
                          : ""}
                        {formatCurrency(entry.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {entry.client?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {entry.prestataire ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Checkbox
                        checked={entry.is_paid}
                        onChange={() =>
                          togglePaid.mutate({
                            id: entry.id,
                            is_paid: !entry.is_paid,
                          })
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(entry.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FinancialEntryModal
        open={modalOpen}
        onClose={handleCloseModal}
        entryId={editingId}
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("entrees");
  const { data: kpis } = useFinancialKPIs();
  const { data: billingStats } = useBillingStats();

  // Fallback to billing stats if KPI data is all zeros
  const caTotal = kpis?.caTotal ?? billingStats?.totalRevenue ?? 0;
  const newCash = kpis?.newCash ?? 0;
  const mrr = kpis?.mrr ?? 0;
  const chargesTotales = kpis?.chargesTotales ?? 0;
  const marge = kpis?.marge ?? 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Finances
          </span>
        </h1>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Suivi financier, entrees, échéanciers, factures et commissions.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <KPICard
          title="CA Total"
          value={formatCurrency(caTotal)}
          icon={TrendingUp}
          color="text-emerald-600"
          bgColor="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <KPICard
          title="New Cash"
          value={formatCurrency(newCash)}
          icon={Sparkles}
          color="text-amber-600"
          bgColor="bg-amber-100 dark:bg-amber-900/30"
        />
        <KPICard
          title="MRR"
          value={formatCurrency(mrr)}
          icon={DollarSign}
          color="text-emerald-600"
          bgColor="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <KPICard
          title="Charges Totales"
          value={formatCurrency(chargesTotales)}
          icon={Receipt}
          color="text-orange-600"
          bgColor="bg-orange-100 dark:bg-orange-900/30"
        />
        <KPICard
          title="Marge"
          value={`${marge}%`}
          icon={Clock}
          color="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={staggerItem}>
        <TabsList
          tabs={TABS}
          value={activeTab}
          onChange={(v) => setActiveTab(v as FinanceTab)}
        />
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={staggerItem}>
        <TabsContent value="entrees" activeValue={activeTab}>
          <EntreesTab />
        </TabsContent>
        <TabsContent value="échéanciers" activeValue={activeTab}>
          <EcheanciersTab />
        </TabsContent>
        <TabsContent value="projections" activeValue={activeTab}>
          <ProjectionsTab />
        </TabsContent>
        <TabsContent value="factures" activeValue={activeTab}>
          <InvoicesTab />
        </TabsContent>
        <TabsContent value="commissions" activeValue={activeTab}>
          <CommissionsTab />
        </TabsContent>
      </motion.div>
    </motion.div>
  );
}
