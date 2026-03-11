"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, staggerItem, defaultTransition } from "@/lib/animations";
import { useContracts } from "@/hooks/use-contracts";
import { useAuth } from "@/hooks/use-auth";
import type { ContractStatus } from "@/types/billing";
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  PenLine,
} from "lucide-react";

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  draft: { label: "Brouillon", className: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "A signer", className: "bg-amber-500/10 text-amber-600", icon: PenLine },
  signed: { label: "Signe", className: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  cancelled: { label: "Annule", className: "bg-red-500/10 text-red-600", icon: XCircle },
};

export default function ClientContractsPage() {
  const { user } = useAuth();
  const { contracts, isLoading } = useContracts({ clientId: user?.id });
  const [filter, setFilter] = useState<"all" | "pending" | "signed">("all");

  const filtered = contracts.filter((c) => {
    if (filter === "pending") return c.status === "sent";
    if (filter === "signed") return c.status === "signed";
    return true;
  });

  const pendingCount = contracts.filter((c) => c.status === "sent").length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Mes contrats</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Consultez et signez vos contrats
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} transition={defaultTransition} className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">{contracts.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-1">A signer</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-emerald-600">
            {contracts.filter((c) => c.status === "signed").length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Signes</p>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {(
            [
              { value: "all", label: "Tous" },
              { value: "pending", label: "A signer" },
              { value: "signed", label: "Signes" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === tab.value
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Contracts list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeInUp} transition={defaultTransition} className="bg-surface border border-border rounded-xl p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun contrat</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((contract) => {
            const conf = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;
            const Icon = conf.icon;
            return (
              <motion.div key={contract.id} variants={staggerItem}>
                <Link
                  href={`/client/contracts/${contract.id}`}
                  className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{contract.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(contract.created_at)}
                      {contract.signed_at && ` · Signe le ${formatDate(contract.signed_at)}`}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${conf.className}`}>
                    <Icon className="w-3 h-3" />
                    {conf.label}
                  </span>
                  {contract.status === "sent" && (
                    <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Signer →
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
