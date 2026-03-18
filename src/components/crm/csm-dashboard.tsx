"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn, getInitials, formatCurrency } from "@/lib/utils";
import {
  useClientsGroupedByCoach,
  useUnassignedClients,
  useAutoAssignCoach,
  type CoachMetrics,
} from "@/hooks/use-coach-assignments";
import { AssignCoachModal } from "@/components/crm/assign-coach-modal";
import {
  Users,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Eye,
  Zap,
  Loader2,
  UserX,
  ChevronRight,
  Heart,
} from "lucide-react";
import type { Profile, StudentDetail } from "@/types/database";

interface CsmDashboardProps {
  onFilterByCoach?: (coachId: string) => void;
}

export function CsmDashboard({ onFilterByCoach }: CsmDashboardProps) {
  const { byCoach, coaches, isLoading } = useClientsGroupedByCoach();
  const { data: unassignedClients, isLoading: unassignedLoading } =
    useUnassignedClients();
  const autoAssign = useAutoAssignCoach();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [expandedCoach, setExpandedCoach] = useState<string | null>(null);

  const unassigned = unassignedClients ?? [];
  const totalClients =
    Array.from(byCoach.values()).reduce((sum, m) => sum + m.totalClients, 0) +
    unassigned.length;
  const totalCoaches = coaches.length;
  const totalAtRisk = Array.from(byCoach.values()).reduce(
    (sum, m) => sum + m.atRiskClients,
    0,
  );

  const handleAutoAssignAll = async () => {
    for (const client of unassigned) {
      await autoAssign.mutateAsync({ clientId: client.id });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-shimmer rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ─── Stats globales ─────────────────────────────────── */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={Users}
          label="Total coaches"
          value={totalCoaches}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={UserCheck}
          label="Clients assignes"
          value={totalClients - unassigned.length}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
        />
        <StatCard
          icon={UserX}
          label="Non assignes"
          value={unassigned.length}
          color="text-amber-600"
          bgColor="bg-amber-100"
        />
        <StatCard
          icon={AlertTriangle}
          label="A risque"
          value={totalAtRisk}
          color="text-red-600"
          bgColor="bg-red-100"
        />
      </motion.div>

      {/* ─── Clients non assignes ─────────────────────────── */}
      {unassigned.length > 0 && (
        <motion.div
          variants={staggerItem}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">
                {unassigned.length} client{unassigned.length > 1 ? "s" : ""} non
                assigne{unassigned.length > 1 ? "s" : ""}
              </h3>
            </div>
            <button
              onClick={handleAutoAssignAll}
              disabled={autoAssign.isPending}
              className="h-8 px-3 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {autoAssign.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              Assigner automatiquement
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {unassigned.slice(0, 12).map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  setSelectedClient({ id: client.id, name: client.full_name });
                  setAssignModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-amber-200 text-sm hover:border-primary/40 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[9px] text-amber-700 font-medium">
                  {getInitials(client.full_name)}
                </div>
                <span className="text-xs text-foreground font-medium">
                  {client.full_name}
                </span>
              </button>
            ))}
            {unassigned.length > 12 && (
              <span className="text-xs text-amber-600 self-center">
                +{unassigned.length - 12} autres
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── Cartes par coach ──────────────────────────────── */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {Array.from(byCoach.entries())
          .sort((a, b) => b[1].totalClients - a[1].totalClients)
          .map(([coachId, metrics]) => (
            <CoachCard
              key={coachId}
              metrics={metrics}
              isExpanded={expandedCoach === coachId}
              onToggleExpand={() =>
                setExpandedCoach(expandedCoach === coachId ? null : coachId)
              }
              onFilterByCoach={onFilterByCoach}
              onAssignClient={(client) => {
                setSelectedClient({
                  id: client.id,
                  name: client.full_name,
                });
                setAssignModalOpen(true);
              }}
            />
          ))}
      </motion.div>

      {/* ─── Modal d'assignation ───────────────────────────── */}
      {selectedClient && (
        <AssignCoachModal
          open={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedClient(null);
          }}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
        />
      )}
    </motion.div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className="bg-surface rounded-2xl p-4 border border-border"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            bgColor,
          )}
        >
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground font-mono tabular-nums">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Coach Card ────────────────────────────────────────────

function CoachCard({
  metrics,
  isExpanded,
  onToggleExpand,
  onFilterByCoach,
}: {
  metrics: CoachMetrics;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onFilterByCoach?: (coachId: string) => void;
  onAssignClient: (client: Profile) => void;
}) {
  const {
    coach,
    clients,
    totalClients,
    atRiskClients,
    averageHealthScore,
    totalRevenue,
  } = metrics;

  // Flag breakdown
  const flagCounts = { green: 0, yellow: 0, orange: 0, red: 0 };
  for (const c of clients) {
    const flag = c.student_details?.[0]?.flag ?? "green";
    if (flag in flagCounts) {
      flagCounts[flag as keyof typeof flagCounts]++;
    }
  }

  return (
    <div
      className="bg-surface rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Coach header */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm text-primary font-medium shrink-0">
            {coach.avatar_url ? (
              <Image
                src={coach.avatar_url}
                alt={coach.full_name}
                width={44}
                height={44}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(coach.full_name)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {coach.full_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {coach.role === "admin" ? "Admin" : "Coach"} &middot;{" "}
              {totalClients} client{totalClients !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground font-mono tabular-nums">
              {totalClients}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Clients
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground font-mono tabular-nums">
              {averageHealthScore}
              <span className="text-xs font-normal text-muted-foreground">
                %
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Sante moy.
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground font-mono tabular-nums">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Revenus
            </p>
          </div>
        </div>

        {/* Flag breakdown */}
        <div className="flex items-center gap-2 mb-4">
          {(
            [
              { key: "green", color: "bg-emerald-500", label: "OK" },
              { key: "yellow", color: "bg-yellow-500", label: "Attention" },
              { key: "orange", color: "bg-orange-500", label: "Alerte" },
              { key: "red", color: "bg-red-500", label: "Critique" },
            ] as const
          ).map((f) => (
            <div
              key={f.key}
              className="flex items-center gap-1"
              title={f.label}
            >
              <div className={cn("w-2.5 h-2.5 rounded-full", f.color)} />
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                {flagCounts[f.key]}
              </span>
            </div>
          ))}
          {atRiskClients > 0 && (
            <span className="ml-auto text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {atRiskClients} a risque
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onFilterByCoach && (
            <button
              onClick={() => onFilterByCoach(coach.id)}
              className="flex-1 h-8 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Voir les clients
            </button>
          )}
          <button
            onClick={onToggleExpand}
            className={cn(
              "h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 flex items-center gap-1.5",
              isExpanded && "bg-muted text-foreground",
            )}
          >
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 transition-transform",
                isExpanded && "rotate-90",
              )}
            />
            Details
          </button>
        </div>
      </div>

      {/* Expanded client list */}
      {isExpanded && clients.length > 0 && (
        <div className="border-t border-border bg-muted/20 px-5 py-3 space-y-2 max-h-64 overflow-y-auto">
          {clients.map((client) => {
            const d = client.student_details?.[0];
            return <ClientRow key={client.id} client={client} details={d} />;
          })}
        </div>
      )}

      {isExpanded && clients.length === 0 && (
        <div className="border-t border-border bg-muted/20 px-5 py-6 text-center">
          <p className="text-xs text-muted-foreground">Aucun client assigne</p>
        </div>
      )}
    </div>
  );
}

// ─── Client Row (in expanded coach card) ─────────────────

function ClientRow({
  client,
  details,
}: {
  client: Profile;
  details?: StudentDetail;
}) {
  const flag = details?.flag ?? "green";
  const flagColors = {
    green: "bg-emerald-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div
        className={cn(
          "w-2 h-2 rounded-full shrink-0",
          flagColors[flag] ?? "bg-zinc-400",
        )}
      />
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-[10px] text-primary font-medium shrink-0">
        {getInitials(client.full_name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">
          {client.full_name}
        </p>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1" title="Score sante">
          <Heart className="w-3 h-3" />
          {details?.health_score ?? 0}
        </span>
        <span className="flex items-center gap-1" title="Revenus">
          <TrendingUp className="w-3 h-3" />
          {formatCurrency(details?.revenue ?? 0)}
        </span>
      </div>
    </div>
  );
}
