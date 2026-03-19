"use client";

import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Phone, Calendar, Clock } from "lucide-react";

function UpcomingCallsWidgetBase() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const { data: calls, isLoading } = useQuery({
    queryKey: ["upcoming-calls-widget", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("call_calendar")
        .select("*, client:profiles!call_calendar_client_id_fkey(full_name)")
        .gte("date", today)
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(5)
        .returns<Array<{ id: string; date: string; time: string | null; client: { full_name: string } | null }>>();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div
        className="bg-surface rounded-xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="h-4 w-32 bg-muted rounded-lg mb-4 animate-shimmer" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-surface rounded-xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <Phone className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-[13px] font-semibold text-foreground">
          Prochains appels
        </h3>
      </div>

      {!calls || calls.length === 0 ? (
        <div className="py-6 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Aucun appel programme</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {calls.map((call) => {
            const client = call.client as { full_name: string } | null;
            return (
              <div
                key={call.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {client?.full_name ?? "Contact"}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {call.date}
                    {call.time ? ` a ${call.time}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const UpcomingCallsWidget = memo(UpcomingCallsWidgetBase);
