"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useCommissions } from "@/hooks/use-commissions";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SetterCommissionsPage() {
  const { user } = useAuth();
  const { commissions, isLoading } = useCommissions({
    contractorId: user?.id,
  });

  const pending = commissions.filter((c) => c.status === "pending");
  const paid = commissions.filter((c) => c.status === "paid");
  const totalPending = pending.reduce(
    (s, c) => s + (c.commission_amount ?? c.amount ?? 0),
    0,
  );
  const totalPaid = paid.reduce(
    (s, c) => s + (c.commission_amount ?? c.amount ?? 0),
    0,
  );
  const totalAll = totalPending + totalPaid;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Mes commissions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivi de tes commissions sur les ventes
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatCard
          icon={DollarSign}
          label="Total gagne"
          value={formatCurrency(totalAll)}
          color="text-foreground"
        />
        <StatCard
          icon={Clock}
          label="A recevoir"
          value={formatCurrency(totalPending)}
          color="text-amber-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Deja paye"
          value={formatCurrency(totalPaid)}
          color="text-emerald-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Nb ventes"
          value={String(commissions.length)}
          color="text-primary"
        />
      </motion.div>

      {/* Pending commissions */}
      {pending.length > 0 && (
        <motion.div variants={staggerItem}>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />A recevoir (
            {pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Vente de {formatCurrency(c.sale_amount ?? 0)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      Taux:{" "}
                      {(
                        (c.commission_rate ?? c.percentage / 100) * 100
                      ).toFixed(0)}
                      %
                    </span>
                    {c.split_type && c.split_type !== "full" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                        {c.split_type === "first_payment"
                          ? "1er versement"
                          : "2eme versement"}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-600">
                  {formatCurrency(c.commission_amount ?? c.amount ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Paid history */}
      <motion.div variants={staggerItem}>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          Historique ({paid.length})
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : paid.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune commission payee pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {paid.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Vente de {formatCurrency(c.sale_amount ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Paye le{" "}
                    {c.paid_at
                      ? new Date(c.paid_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-600">
                  {formatCurrency(c.commission_amount ?? c.amount ?? 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Empty state */}
      {!isLoading && commissions.length === 0 && (
        <motion.div
          variants={staggerItem}
          className="bg-surface border border-border rounded-xl p-12 text-center"
        >
          <DollarSign className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Aucune commission pour le moment. Elles apparaitront ici
            automatiquement quand une vente sera attribuee.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="bg-surface rounded-2xl p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-4 h-4", color)} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-display font-bold text-foreground">{value}</p>
    </div>
  );
}
