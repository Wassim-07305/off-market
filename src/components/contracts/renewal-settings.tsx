"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  useContractRenewalStatus,
  useToggleAutoRenew,
  useRenewalHistory,
  useManualRenew,
} from "@/hooks/use-contract-renewal";
import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Loader2,
  Calendar,
  RotateCcw,
} from "lucide-react";

// ─── Renewal Status Badge ────────────────────────────────────────────────

const RENEWAL_STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending_renewal: {
    label: "Renouvellement en attente",
    className: "bg-amber-500/10 text-amber-600",
    icon: Clock,
  },
  renewed: {
    label: "Renouvele",
    className: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle,
  },
  expired: {
    label: "Expire",
    className: "bg-red-500/10 text-red-600",
    icon: XCircle,
  },
  cancelled: {
    label: "Annule",
    className: "bg-muted text-muted-foreground",
    icon: XCircle,
  },
};

const LOG_ACTION_CONFIG: Record<
  string,
  { label: string; icon: typeof Clock; color: string }
> = {
  reminder_sent: {
    label: "Rappel envoye",
    icon: Bell,
    color: "text-blue-500",
  },
  auto_renewed: {
    label: "Renouvellement automatique",
    icon: RefreshCw,
    color: "text-emerald-500",
  },
  cancelled: {
    label: "Renouvellement annule",
    icon: XCircle,
    color: "text-red-500",
  },
  expired: {
    label: "Contrat expire",
    icon: Clock,
    color: "text-amber-500",
  },
};

const PERIOD_OPTIONS = [
  { value: 3, label: "3 mois" },
  { value: 6, label: "6 mois" },
  { value: 12, label: "12 mois" },
];

// ─── Main Component ──────────────────────────────────────────────────────

interface RenewalSettingsProps {
  contractId: string;
  contractStatus: string;
}

export function RenewalSettings({
  contractId,
  contractStatus,
}: RenewalSettingsProps) {
  const { data: renewalStatus, isLoading } =
    useContractRenewalStatus(contractId);
  const { data: history, isLoading: historyLoading } =
    useRenewalHistory(contractId);
  const toggleAutoRenew = useToggleAutoRenew();
  const manualRenew = useManualRenew();

  const [autoRenew, setAutoRenew] = useState(false);
  const [periodMonths, setPeriodMonths] = useState(12);
  const [noticeDays, setNoticeDays] = useState(30);

  useEffect(() => {
    if (renewalStatus) {
      setAutoRenew(renewalStatus.auto_renew ?? false);
      setPeriodMonths(renewalStatus.renewal_period_months ?? 12);
      setNoticeDays(renewalStatus.renewal_notice_days ?? 30);
    }
  }, [renewalStatus]);

  const handleToggle = () => {
    const newValue = !autoRenew;
    setAutoRenew(newValue);
    toggleAutoRenew.mutate({
      contractId,
      autoRenew: newValue,
      renewalPeriodMonths: periodMonths,
      renewalNoticeDays: noticeDays,
    });
  };

  const handleSaveSettings = () => {
    toggleAutoRenew.mutate({
      contractId,
      autoRenew,
      renewalPeriodMonths: periodMonths,
      renewalNoticeDays: noticeDays,
    });
  };

  const handleManualRenew = () => {
    if (
      confirm("Etes-vous sur de vouloir renouveler ce contrat manuellement ?")
    ) {
      manualRenew.mutate({ contractId, durationMonths: periodMonths });
    }
  };

  const canRenew = ["signed", "active"].includes(contractStatus);
  const statusConf = renewalStatus?.renewal_status
    ? RENEWAL_STATUS_CONFIG[renewalStatus.renewal_status]
    : null;

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="h-5 w-40 bg-muted animate-pulse rounded-lg" />
        <div className="h-10 w-full bg-muted animate-pulse rounded-lg mt-4" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary" />
          Renouvellement
        </h3>
        {statusConf && (
          <span
            className={cn(
              "text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1",
              statusConf.className,
            )}
          >
            <statusConf.icon className="w-3 h-3" />
            {statusConf.label}
          </span>
        )}
      </div>

      {/* Auto-renew toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground font-medium">
            Renouvellement automatique
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Le contrat sera renouvele automatiquement a la date d&apos;echeance
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggleAutoRenew.isPending || !canRenew}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50",
            autoRenew ? "bg-[#DC2626]" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 bg-surface rounded-full shadow-sm transition-transform duration-200",
              autoRenew && "translate-x-5",
            )}
          />
        </button>
      </div>

      {/* Settings (only shown when auto-renew is on) */}
      {autoRenew && (
        <div className="space-y-4 pt-2 border-t border-border">
          {/* Period */}
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Periode de renouvellement
            </label>
            <div className="flex gap-1.5">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriodMonths(opt.value)}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-medium transition-all",
                    periodMonths === opt.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notice days */}
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              <Bell className="w-3 h-3 inline mr-1" />
              Delai de notification (jours)
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={noticeDays}
              onChange={(e) => setNoticeDays(parseInt(e.target.value) || 30)}
              className="w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Un rappel sera envoye {noticeDays} jours avant l&apos;echeance
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveSettings}
            disabled={toggleAutoRenew.isPending}
            className="h-9 px-4 rounded-xl bg-[#DC2626] text-white text-sm font-medium hover:bg-[#DC2626]/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
          >
            {toggleAutoRenew.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            Enregistrer
          </button>
        </div>
      )}

      {/* Manual renew button */}
      {canRenew && !renewalStatus?.renewal_status && (
        <div className="pt-2 border-t border-border">
          <button
            onClick={handleManualRenew}
            disabled={manualRenew.isPending}
            className="w-full h-9 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {manualRenew.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            Renouveler manuellement
          </button>
        </div>
      )}

      {/* End date info */}
      {renewalStatus?.end_date && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          Echeance :{" "}
          {new Date(renewalStatus.end_date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      )}

      {/* Renewal History Timeline */}
      {!historyLoading && history && history.length > 0 && (
        <div className="pt-3 border-t border-border">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Historique de renouvellement
          </h4>
          <div className="space-y-0">
            {history.map((log, i) => {
              const config = LOG_ACTION_CONFIG[log.action] ?? {
                label: log.action,
                icon: Clock,
                color: "text-muted-foreground",
              };
              const Icon = config.icon;
              return (
                <div key={log.id} className="flex gap-3 relative">
                  {i < history.length - 1 && (
                    <div className="absolute left-[11px] top-7 w-px h-[calc(100%-4px)] bg-border" />
                  )}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5",
                    )}
                  >
                    <Icon className={cn("w-3 h-3", config.color)} />
                  </div>
                  <div className="pb-3">
                    <p className="text-sm text-foreground">{config.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
