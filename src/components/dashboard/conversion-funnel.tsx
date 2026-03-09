"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Funnel } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "prospect", label: "Prospects", color: "bg-blue-500" },
  { key: "qualifie", label: "Qualifies", color: "bg-indigo-500" },
  { key: "proposition", label: "Proposition", color: "bg-violet-500" },
  { key: "closing", label: "Closing", color: "bg-amber-500" },
  { key: "client", label: "Clients", color: "bg-emerald-500" },
] as const;

function useFunnelData() {
  const supabase = useSupabase();
  const { user, isStaff } = useAuth();

  return useQuery({
    queryKey: ["conversion-funnel", user?.id],
    enabled: !!user && isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("pipeline_stage");
      if (error) throw error;

      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        const stage = row.pipeline_stage ?? "prospect";
        counts[stage] = (counts[stage] ?? 0) + 1;
      }

      return STAGES.map((s) => ({
        ...s,
        count: counts[s.key] ?? 0,
      }));
    },
  });
}

export function ConversionFunnel() {
  const { isStaff } = useAuth();
  const { data: stages, isLoading } = useFunnelData();

  if (!isStaff) return null;

  const maxCount = Math.max(...(stages?.map((s) => s.count) ?? [1]), 1);

  return (
    <div
      className="bg-surface rounded-2xl p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Funnel className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Funnel de conversion
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded-lg animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {(stages ?? []).map((stage, i) => {
            const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            const convRate =
              i > 0 && stages && stages[i - 1].count > 0
                ? Math.round((stage.count / stages[i - 1].count) * 100)
                : null;

            return (
              <div key={stage.key} className="flex items-center gap-3">
                <span className="w-20 text-xs text-muted-foreground truncate shrink-0">
                  {stage.label}
                </span>
                <div className="flex-1 h-7 bg-muted/50 rounded-lg overflow-hidden relative">
                  <div
                    className={cn("h-full rounded-lg transition-all duration-700", stage.color)}
                    style={{ width: `${Math.max(widthPercent, 4)}%`, opacity: 0.85 }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-[11px] font-semibold text-foreground">
                    {stage.count}
                  </span>
                </div>
                {convRate !== null && (
                  <span className="text-[10px] font-mono text-muted-foreground w-10 text-right shrink-0">
                    {convRate}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {stages && stages.length >= 2 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Taux global</span>
            <span className="font-semibold text-foreground">
              {stages[0].count > 0
                ? Math.round((stages[stages.length - 1].count / stages[0].count) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
