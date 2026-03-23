"use client";

import { useState } from "react";
import Image from "next/image";
import { cn, getInitials, formatCurrency } from "@/lib/utils";
import {
  Users,
  DollarSign,
  CalendarCheck,
  Heart,
  AlertTriangle,
  ChevronRight,
  Eye,
  TrendingUp,
  ShieldCheck,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { CoachWithStats } from "@/hooks/use-csm-management";
import { useUpdateCoachSpecialties } from "@/hooks/use-csm-management";
import type { Profile, StudentDetail } from "@/types/database";
import { SPECIALTIES } from "@/lib/specialties";

interface CoachCardProps {
  data: CoachWithStats;
  onViewDetails?: (coachId: string) => void;
  onReassignClient?: (clientId: string, clientName: string) => void;
  onUnassignClient?: (clientId: string) => void;
}

function getWorkloadColor(clientCount: number): {
  bar: string;
  text: string;
  label: string;
} {
  if (clientCount > 20)
    return {
      bar: "bg-red-500",
      text: "text-red-600",
      label: "Surcharge",
    };
  if (clientCount >= 10)
    return {
      bar: "bg-amber-500",
      text: "text-amber-600",
      label: "Charge elevee",
    };
  return {
    bar: "bg-emerald-500",
    text: "text-emerald-600",
    label: "Optimal",
  };
}

export function CoachCard({
  data,
  onViewDetails,
  onReassignClient,
  onUnassignClient,
}: CoachCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingSpecs, setEditingSpecs] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const updateSpecialties = useUpdateCoachSpecialties();
  const {
    coach,
    clientCount,
    totalRevenue,
    sessionsThisMonth,
    averageHealthScore,
    atRiskClients,
    retentionRate,
    clients,
  } = data;
  const workload = getWorkloadColor(clientCount);
  const coachSpecs = (coach as Profile & { specialties?: string[] }).specialties ?? [];

  const handleEditSpecs = () => {
    setSelectedSpecs([...coachSpecs]);
    setEditingSpecs(true);
  };

  const handleSaveSpecs = () => {
    updateSpecialties.mutate(
      { coachId: coach.id, specialties: selectedSpecs },
      { onSuccess: () => setEditingSpecs(false) },
    );
  };

  const toggleSpec = (value: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  };

  return (
    <div
      className="bg-surface rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Workload indicator bar */}
      <div className={cn("h-1", workload.bar)} />

      <div className="p-5">
        {/* Coach header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm text-primary font-medium shrink-0">
            {coach.avatar_url ? (
              <Image
                src={coach.avatar_url}
                alt={coach.full_name}
                width={48}
                height={48}
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
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              {coachSpecs.length > 0 ? (
                coachSpecs.map((s) => (
                  <span
                    key={s}
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                  >
                    {SPECIALTIES.find((sp) => sp.value === s)?.label ?? s}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-muted-foreground">
                  Aucune specialite
                </span>
              )}
              <button
                onClick={handleEditSpecs}
                className="w-4 h-4 rounded flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                title="Modifier les specialites"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              clientCount > 20
                ? "bg-red-100 text-red-700"
                : clientCount >= 10
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700",
            )}
          >
            {workload.label}
          </span>
        </div>

        {/* Specialties editor */}
        {editingSpecs && (
          <div className="mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-foreground">Specialites</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingSpecs(false)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleSaveSpecs}
                  disabled={updateSpecialties.isPending || selectedSpecs.length === 0}
                  className="h-6 px-2 rounded-md bg-primary text-white text-[10px] font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Sauvegarder
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {SPECIALTIES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleSpec(s.value)}
                  className={cn(
                    "h-7 px-2 rounded-md text-[10px] font-medium transition-all border",
                    selectedSpecs.includes(s.value)
                      ? "bg-primary/15 border-primary/30 text-primary"
                      : "bg-surface border-border text-muted-foreground hover:border-primary/20",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {selectedSpecs.length === 0 && (
              <p className="text-[10px] text-amber-500 mt-1.5">Min. 1 specialite</p>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-lg font-bold text-foreground font-mono tabular-nums leading-tight">
                {clientCount}
              </p>
              <p className="text-[10px] text-muted-foreground">Clients</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30">
            <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-lg font-bold text-foreground font-mono tabular-nums leading-tight">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-[10px] text-muted-foreground">Revenus</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30">
            <CalendarCheck className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-lg font-bold text-foreground font-mono tabular-nums leading-tight">
                {sessionsThisMonth}
              </p>
              <p className="text-[10px] text-muted-foreground">Sessions/mois</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30">
            <Heart className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-lg font-bold text-foreground font-mono tabular-nums leading-tight">
                {averageHealthScore}
                <span className="text-xs font-normal text-muted-foreground">
                  %
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground">Sante moy.</p>
            </div>
          </div>
        </div>

        {/* Performance indicators */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            Retention:{" "}
            <span className="font-mono font-semibold text-foreground">
              {retentionRate}%
            </span>
          </span>
          {atRiskClients > 0 && (
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {atRiskClients} à risque
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(coach.id)}
              className="flex-1 h-8 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Voir details
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
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
            Clients
          </button>
        </div>
      </div>

      {/* Expanded client list */}
      {isExpanded && clients.length > 0 && (
        <div className="border-t border-border bg-muted/20 px-5 py-3 space-y-2 max-h-64 overflow-y-auto">
          {clients.map((client) => {
            const d = client.student_details?.[0];
            return (
              <ClientRow
                key={client.id}
                client={client}
                details={d}
                onReassign={onReassignClient}
                onUnassign={onUnassignClient}
              />
            );
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

// ─── Client Row ─────────────────────────────────────────────

function ClientRow({
  client,
  details,
  onReassign,
  onUnassign,
}: {
  client: Profile | null;
  details?: StudentDetail;
  onReassign?: (clientId: string, clientName: string) => void;
  onUnassign?: (clientId: string) => void;
}) {
  if (!client) return null;
  const flag = details?.flag ?? "green";
  const flagColors: Record<string, string> = {
    green: "bg-emerald-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-3 py-1.5 group">
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
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onReassign && (
          <button
            onClick={() => onReassign(client.id, client.full_name)}
            className="text-[10px] text-primary hover:underline"
          >
            Reassigner
          </button>
        )}
        {onUnassign && (
          <button
            onClick={() => onUnassign(client.id)}
            className="text-[10px] text-red-500 hover:underline"
          >
            Retirer
          </button>
        )}
      </div>
    </div>
  );
}
