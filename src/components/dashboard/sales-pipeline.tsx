"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn, formatCurrency } from "@/lib/utils";
import { Funnel, TrendingUp, Target } from "lucide-react";

interface PipelineDeal {
  stage: string;
  count: number;
  totalValue: number;
  probability: number;
}

// 🎨 COULEURS VIVES + CONTRASTE MAX
const PIPELINE_STAGES: {
  key: string;
  label: string;
  color: string;
  probability: number;
}[] = [
  { key: "prospect", label: "Prospect", color: "bg-blue-600", probability: 10 },
  { 
    key: "qualifie", 
    label: "Qualifié", 
    color: "bg-indigo-600", 
    probability: 25 
  },
  { 
    key: "proposition", 
    label: "Proposition", 
    color: "bg-purple-600", 
    probability: 50 
  },
  { 
    key: "negociation", 
    label: "Négociation", 
    color: "bg-amber-500", 
    probability: 75 
  },
  { key: "closing", label: "Closing", color: "bg-orange-500", probability: 90 },
  { key: "client", label: "Gagné ✅", color: "bg-emerald-600", probability: 100 },
];

function useSalesPipeline() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales-pipeline"],
    enabled: !!user,
    queryFn: async (): Promise<PipelineDeal[]> => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("pipeline_stage, estimated_value");
      if (error) throw error;

      type ContactRow = {
        pipeline_stage: string | null;
        estimated_value: number | null;
      };
      const stageMap: Record<string, { count: number; totalValue: number }> = {};
      for (const row of (data ?? []) as ContactRow[]) {
        const stage = row.pipeline_stage ?? "prospect";
        if (!stageMap[stage]) stageMap[stage] = { count: 0, totalValue: 0 };
        stageMap[stage].count++;
        stageMap[stage].totalValue += Number(row.estimated_value ?? 0);
      }

      return PIPELINE_STAGES.map((s) => ({
        stage: s.key,
        count: stageMap[s.key]?.count ?? 0,
        totalValue: stageMap[s.key]?.totalValue ?? 0,
        probability: s.probability,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function SalesPipeline() {
  const { data: pipeline, isLoading } = useSalesPipeline();

  const totalDeals = pipeline?.reduce((sum, d) => sum + d.count, 0) ?? 0;
  const weightedRevenue =
    pipeline?.reduce(
      (sum, d) => sum + d.totalValue * (d.probability / 100),
      0,
    ) ?? 0;

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
          <Funnel className="w-4 h-4 text-muted-foreground" />
          Pipeline commercial
        </h3>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Revenu pondéré</p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(weightedRevenue)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 animate-shimmer rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {PIPELINE_STAGES.map((stage) => {
            const deal = pipeline?.find((d) => d.stage === stage.key);
            const count = deal?.count ?? 0;
            const value = deal?.totalValue ?? 0;
            const maxCount = Math.max(
              ...((pipeline ?? []).map((d) => d.count) ?? [1]),
              1,
            );
            const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={stage.key} className="flex items-center gap-3">
                <span className="w-24 text-[11px] text-muted-foreground truncate shrink-0">
                  {stage.label}
                </span>
                <div className="flex-1 h-7 bg-muted/50 rounded-lg overflow-hidden relative border">
                  <div
                    className={cn(
                      "h-full rounded-lg transition-all duration-700 shadow-md border-2 border-white/20 relative",
                      stage.color,
                    )}
                    style={{
                      width: `${Math.max(widthPercent, count > 0 ? 8 : 2)}%`,
                      opacity: 0.9,
                    }}
                  >
                    {/* Glow subtil */}
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg" />
                  </div>
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-white drop-shadow-md z-10">
                    {count > 0 ? `${count} · ${formatCurrency(value)}` : "0"}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right shrink-0 font-bold">
                  {stage.probability}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer stats */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Target className="w-3.5 h-3.5" />
          <span>
            {totalDeals} deal{totalDeals !== 1 ? "s" : ""} actif
            {totalDeals !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="font-medium">
            {formatCurrency(weightedRevenue)} prévisionnel
          </span>
        </div>
      </div>
    </div>
  );
}
