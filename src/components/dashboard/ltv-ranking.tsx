"use client";

import { useLTVRanking } from "@/hooks/use-ltv";
import { formatCurrency, cn } from "@/lib/utils";
import { Crown, TrendingUp } from "lucide-react";

const RANK_STYLES: Record<number, string> = {
  0: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
  1: "bg-slate-400/10 text-slate-400 ring-slate-400/20",
  2: "bg-orange-500/10 text-orange-500 ring-orange-500/20",
};

export function LTVRanking() {
  const { data: clients, isLoading } = useLTVRanking(10);

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Crown className="w-4 h-4 text-amber-500" />
        <h3 className="text-[13px] font-semibold text-foreground">
          Classement LTV clients
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-shimmer rounded-lg" />
          ))}
        </div>
      ) : !clients?.length ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm">Aucune donnee LTV</p>
          <p className="text-xs mt-1 text-muted-foreground/60">
            Les donnees apparaitront apres les premieres factures payees
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-left pb-2 pr-2">
                  #
                </th>
                <th className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-left pb-2">
                  Client
                </th>
                <th className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right pb-2">
                  LTV
                </th>
                <th className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right pb-2 hidden sm:table-cell">
                  Mois actifs
                </th>
                <th className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right pb-2 hidden sm:table-cell">
                  Moy./mois
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => {
                const isTop3 = index < 3;
                return (
                  <tr
                    key={client.clientId}
                    className={cn(
                      "border-b border-border/50 last:border-0",
                      isTop3 && "bg-primary/[0.02]",
                    )}
                  >
                    <td className="py-2.5 pr-2">
                      {isTop3 ? (
                        <span
                          className={cn(
                            "w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold ring-1",
                            RANK_STYLES[index],
                          )}
                        >
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono w-6 inline-flex justify-center">
                          {index + 1}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        {client.avatarUrl ? (
                          <img
                            src={client.avatarUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-semibold">
                            {client.fullName.charAt(0)}
                          </div>
                        )}
                        <span className="text-[13px] font-medium text-foreground truncate max-w-[150px]">
                          {client.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-[13px] font-semibold text-foreground tabular-nums">
                        {formatCurrency(client.ltv)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground font-mono tabular-nums">
                        {client.monthsActive}
                      </span>
                    </td>
                    <td className="py-2.5 text-right hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground font-mono tabular-nums">
                        {formatCurrency(client.avgMonthlyRevenue)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
