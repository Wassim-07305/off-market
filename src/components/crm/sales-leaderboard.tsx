"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/animations";
import { Trophy, Medal, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMMISSION_ROLE_LABELS } from "@/types/billing";
import type { CommissionRole } from "@/types/billing";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface LeaderboardEntry {
  contractor_id: string;
  contractor_name: string;
  avatar_url: string | null;
  role: CommissionRole;
  total_commission: number;
  deal_count: number;
}

type TabKey = "setters" | "closeurs";

function useLeaderboardData() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales-leaderboard", new Date().getFullYear(), new Date().getMonth()],
    enabled: !!user,
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from("commissions")
        .select(
          "contractor_id, contractor_role, commission_amount, contractor:profiles!commissions_contractor_id_fkey(id, full_name, avatar_url)"
        )
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth)
        .in("contractor_role", ["setter", "closer"])
        .neq("status", "cancelled");

      if (error) throw error;

      const map = new Map<string, LeaderboardEntry>();

      for (const row of data ?? []) {
        const id = row.contractor_id;
        const existing = map.get(id);
        const contractor = row.contractor as unknown as { id: string; full_name: string; avatar_url: string | null } | null;

        if (existing) {
          existing.total_commission += Number(row.commission_amount);
          existing.deal_count += 1;
        } else {
          map.set(id, {
            contractor_id: id,
            contractor_name: contractor?.full_name ?? "Inconnu",
            avatar_url: contractor?.avatar_url ?? null,
            role: row.contractor_role as CommissionRole,
            total_commission: Number(row.commission_amount),
            deal_count: 1,
          });
        }
      }

      return Array.from(map.values());
    },
    staleTime: 5 * 60 * 1000,
  });
}

const RANK_ICONS: Record<number, string> = {
  1: "\uD83E\uDD47",
  2: "\uD83E\uDD48",
  3: "\uD83E\uDD49",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return <span className="text-lg leading-none">{RANK_ICONS[rank]}</span>;
  }
  return (
    <span className="text-xs font-semibold text-muted-foreground w-5 text-center">
      #{rank}
    </span>
  );
}

function RoleBadge({ role }: { role: CommissionRole }) {
  const colors: Record<string, string> = {
    setter: "bg-blue-500/10 text-blue-600",
    closer: "bg-purple-500/10 text-purple-600",
  };
  return (
    <span
      className={cn(
        "text-[10px] font-medium px-2 py-0.5 rounded-full",
        colors[role] ?? "bg-muted text-muted-foreground"
      )}
    >
      {COMMISSION_ROLE_LABELS[role] ?? role}
    </span>
  );
}

function LeaderboardList({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        Aucune commission ce mois-ci
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => {
        const rank = i + 1;
        return (
          <div
            key={entry.contractor_id}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              rank <= 3 && "bg-primary/[0.03]"
            )}
          >
            <RankBadge rank={rank} />

            {entry.avatar_url ? (
              <Image
                src={entry.avatar_url}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold shrink-0">
                {entry.contractor_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {entry.contractor_name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <RoleBadge role={entry.role} />
                <span className="text-[10px] text-muted-foreground">
                  {entry.deal_count} deal{entry.deal_count > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {formatEUR(entry.total_commission)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SalesLeaderboard() {
  const [tab, setTab] = useState<TabKey>("closeurs");
  const { data: entries, isLoading } = useLeaderboardData();

  const { setters, closers } = useMemo(() => {
    const all = entries ?? [];
    return {
      setters: all
        .filter((e) => e.role === "setter")
        .sort((a, b) => b.total_commission - a.total_commission),
      closers: all
        .filter((e) => e.role === "closer")
        .sort((a, b) => b.total_commission - a.total_commission),
    };
  }, [entries]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "closeurs", label: "Closeurs", count: closers.length },
    { key: "setters", label: "Setters", count: setters.length },
  ];

  const currentMonth = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      variants={staggerItem}
      className="bg-surface border border-border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Classement equipe
        </h2>
        <span className="text-[10px] text-muted-foreground capitalize">
          {currentMonth}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-muted/50 rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 text-xs font-medium py-1.5 rounded-md transition-colors",
              tab === t.key
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <div className="w-5 h-5 bg-muted rounded animate-pulse" />
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
                <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <LeaderboardList entries={tab === "closeurs" ? closers : setters} />
      )}
    </motion.div>
  );
}
