"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useUpsellOpportunities, useUpdateUpsell } from "@/hooks/use-upsell";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Plus,
  Search,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { UpsellFormModal } from "./upsell-form-modal";
import { UpsellStats } from "./upsell-stats";
import { AlumniSection } from "./alumni-section";
import { TabsList, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { UpsellStatus, UpsellOpportunity } from "@/types/database";

const STATUS_CONFIG: Record<
  UpsellStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "destructive";
    icon: typeof Clock;
  }
> = {
  detected: { label: "Detectee", variant: "default", icon: Eye },
  proposed: { label: "Proposee", variant: "warning", icon: Send },
  accepted: { label: "Acceptee", variant: "success", icon: CheckCircle },
  declined: { label: "Declinee", variant: "destructive", icon: XCircle },
};

const FILTER_TABS = [
  { value: "all", label: "Toutes" },
  { value: "detected", label: "Detectees" },
  { value: "proposed", label: "Proposees" },
  { value: "accepted", label: "Acceptees" },
  { value: "declined", label: "Declinees" },
];

export function UpsellDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);

  const { opportunities: rawOpportunities, stats, isLoading } = useUpsellOpportunities();
  const opportunities = rawOpportunities as unknown as UpsellOpportunity[];
  const updateUpsell = useUpdateUpsell();

  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;

    if (filterStatus !== "all") {
      filtered = filtered.filter((o) => o.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.offer_name.toLowerCase().includes(query) ||
          (o.student as any)?.profile?.full_name?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [opportunities, filterStatus, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: UpsellStatus) => {
    try {
      await updateUpsell.mutateAsync({ id, status: newStatus });
      toast.success(
        newStatus === "proposed"
          ? "Offre proposee avec succes"
          : newStatus === "accepted"
            ? "Upsell accepte !"
            : "Statut mis a jour",
      );
    } catch {
      toast.error("Erreur lors de la mise a jour");
    }
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
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Upsell & Fidelisation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerez les opportunites d&apos;upsell et le programme alumni
          </p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowFormModal(true)}
        >
          Nouvelle opportunite
        </Button>
      </motion.div>

      {/* Main tabs */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <TabsList
          tabs={[
            { value: "dashboard", label: "Dashboard" },
            { value: "opportunities", label: "Opportunites" },
            { value: "stats", label: "Statistiques" },
            { value: "alumni", label: "Alumni" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" activeValue={activeTab}>
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                icon={<Target className="w-5 h-5 text-primary" />}
                iconBg="bg-primary/10"
                value={stats.detected + stats.proposed}
                label="Opportunites actives"
                isLoading={isLoading}
              />
              <KPICard
                icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                iconBg="bg-emerald-500/10"
                value={`${stats.conversionRate}%`}
                label="Taux de conversion"
                isLoading={isLoading}
              />
              <KPICard
                icon={<DollarSign className="w-5 h-5 text-amber-500" />}
                iconBg="bg-amber-500/10"
                value={formatCurrency(stats.totalRevenue)}
                label="Revenue upsell"
                isLoading={isLoading}
              />
              <KPICard
                icon={<Users className="w-5 h-5 text-blue-500" />}
                iconBg="bg-blue-500/10"
                value={formatCurrency(stats.averageLTV)}
                label="LTV moyenne"
                isLoading={isLoading}
              />
            </div>

            {/* Recent opportunities */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Dernieres opportunites
                </h2>
                <button
                  onClick={() => setActiveTab("opportunities")}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Voir tout <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              ) : opportunities.length === 0 ? (
                <EmptyState
                  icon={<Target className="w-6 h-6" />}
                  title="Aucune opportunite"
                  description="Les opportunites d'upsell apparaitront ici lorsqu'un eleve atteindra un palier."
                  action={
                    <Button
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => setShowFormModal(true)}
                    >
                      Creer manuellement
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {opportunities.slice(0, 5).map((opp) => (
                    <OpportunityRow
                      key={opp.id}
                      opportunity={opp}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" activeValue={activeTab}>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher un eleve ou une offre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>
              <div className="flex items-center gap-1">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilterStatus(tab.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      filterStatus === tab.value
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <EmptyState
                icon={<Target className="w-6 h-6" />}
                title="Aucune opportunite trouvee"
                description={
                  searchQuery || filterStatus !== "all"
                    ? "Modifiez vos filtres pour voir plus de resultats."
                    : "Creez votre premiere opportunite d'upsell."
                }
                action={
                  <Button
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowFormModal(true)}
                  >
                    Nouvelle opportunite
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {filteredOpportunities.map((opp) => (
                  <OpportunityRow
                    key={opp.id}
                    opportunity={opp}
                    onStatusChange={handleStatusChange}
                    showActions
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" activeValue={activeTab}>
          <UpsellStats stats={stats as any} isLoading={isLoading} />
        </TabsContent>

        {/* Alumni Tab */}
        <TabsContent value="alumni" activeValue={activeTab}>
          <AlumniSection />
        </TabsContent>
      </motion.div>

      {/* Form Modal */}
      <UpsellFormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
      />
    </motion.div>
  );
}

// ─── KPI Card ────────────────────────────────────────────
function KPICard({
  icon,
  iconBg,
  value,
  label,
  isLoading,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            iconBg,
          )}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-foreground">
        {isLoading ? "..." : value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

// ─── Opportunity Row ─────────────────────────────────────
function OpportunityRow({
  opportunity,
  onStatusChange,
  showActions = false,
}: {
  opportunity: UpsellOpportunity;
  onStatusChange: (id: string, status: UpsellStatus) => void;
  showActions?: boolean;
}) {
  const config = STATUS_CONFIG[opportunity.status];
  const studentName =
    (opportunity.student as any)?.profile?.full_name ?? "Eleve inconnu";

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
          {studentName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {studentName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {opportunity.offer_name}
            {(opportunity.amount ?? 0) > 0 && (
              <span className="ml-2 font-medium text-foreground">
                {formatCurrency(opportunity.amount ?? 0)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-muted-foreground hidden sm:block">
          {formatDate(opportunity.created_at)}
        </span>
        <Badge variant={config.variant}>{config.label}</Badge>

        {showActions && opportunity.status === "detected" && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onStatusChange(opportunity.id, "proposed")}
          >
            Proposer
          </Button>
        )}
        {showActions && opportunity.status === "proposed" && (
          <div className="flex gap-1">
            <button
              onClick={() => onStatusChange(opportunity.id, "accepted")}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Accepter"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStatusChange(opportunity.id, "declined")}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              title="Decliner"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
