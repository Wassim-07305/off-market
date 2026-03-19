"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Percent,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ConversionData {
  totalContacts: number;
  totalClients: number;
  conversionRate: number;
  avgDealSize: number;
  avgDaysToClose: number;
  lostDeals: number;
  conversionByMonth: { label: string; contacts: number; converted: number }[];
}

function useSalesConversion() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales-conversion-metrics"],
    enabled: !!user,
    queryFn: async (): Promise<ConversionData> => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const [contactsRes, clientsRes, invoicesRes] = await Promise.all([
        supabase
          .from("crm_contacts")
          .select("id, pipeline_stage, created_at, estimated_value"),
        supabase
          .from("crm_contacts")
          .select("id, created_at, estimated_value")
          .eq("pipeline_stage", "client"),
        supabase.from("invoices").select("total, paid_at").eq("status", "paid"),
      ]);

      type ContactRow = {
        id: string;
        pipeline_stage: string;
        created_at: string;
        estimated_value: number | null;
      };
      type ClientRow = {
        id: string;
        created_at: string;
        estimated_value: number | null;
      };
      type InvoiceRow = { total: number; paid_at: string | null };
      const contacts = (contactsRes.data ?? []) as ContactRow[];
      const clients = (clientsRes.data ?? []) as ClientRow[];
      const paidInvoices = (invoicesRes.data ?? []) as InvoiceRow[];

      const totalContacts = contacts.length;
      const totalClients = clients.length;
      const conversionRate =
        totalContacts > 0
          ? Math.round((totalClients / totalContacts) * 100)
          : 0;

      const avgDealSize =
        paidInvoices.length > 0
          ? Math.round(
              paidInvoices.reduce((sum, i) => sum + Number(i.total), 0) /
                paidInvoices.length,
            )
          : 0;

      // Average days to close (estimate from created_at to paid_at)
      const closingDays: number[] = [];
      for (const client of clients) {
        if (client.created_at) {
          const created = new Date(client.created_at);
          // Rough estimate: days from contact creation
          const daysActive = Math.floor(
            (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
          );
          closingDays.push(daysActive);
        }
      }
      const avgDaysToClose =
        closingDays.length > 0
          ? Math.round(
              closingDays.reduce((s, d) => s + d, 0) / closingDays.length,
            )
          : 0;

      const lostDeals = contacts.filter(
        (c) => c.pipeline_stage === "perdu",
      ).length;

      // Conversion by month (last 6 months)
      const monthsMap: Record<
        string,
        { contacts: number; converted: number; label: string }
      > = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthsMap[key] = {
          contacts: 0,
          converted: 0,
          label: d.toLocaleDateString("fr-FR", { month: "short" }),
        };
      }

      for (const c of contacts) {
        if (!c.created_at) continue;
        const d = new Date(c.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key in monthsMap) {
          monthsMap[key].contacts++;
          if (c.pipeline_stage === "client") {
            monthsMap[key].converted++;
          }
        }
      }

      const conversionByMonth = Object.values(monthsMap);

      return {
        totalContacts,
        totalClients,
        conversionRate,
        avgDealSize,
        avgDaysToClose,
        lostDeals,
        conversionByMonth,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function SalesConversionMetrics() {
  const { data, isLoading } = useSalesConversion();

  return (
    <div
      className="bg-surface rounded-xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-5">
        <Percent className="w-4 h-4 text-muted-foreground" />
        Metriques de conversion
      </h3>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-shimmer rounded-xl" />
            ))}
          </div>
          <div className="h-40 animate-shimmer rounded-xl" />
        </div>
      ) : (
        <>
          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <ConversionStat
              icon={Percent}
              label="Taux de conversion"
              value={`${data?.conversionRate ?? 0}%`}
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <ConversionStat
              icon={BarChart3}
              label="Panier moyen"
              value={formatCurrency(data?.avgDealSize ?? 0)}
              color="text-blue-500"
              bgColor="bg-blue-500/10"
            />
            <ConversionStat
              icon={Clock}
              label="Delai moyen closing"
              value={`${data?.avgDaysToClose ?? 0}j`}
              color="text-amber-500"
              bgColor="bg-amber-500/10"
            />
            <ConversionStat
              icon={XCircle}
              label="Deals perdus"
              value={String(data?.lostDeals ?? 0)}
              color="text-red-500"
              bgColor="bg-red-500/10"
            />
          </div>

          {/* Chart: contacts vs converted by month */}
          {data?.conversionByMonth &&
            data.conversionByMonth.some(
              (m) => m.contacts > 0 || m.converted > 0,
            ) && (
              <div>
                <p className="text-[12px] text-muted-foreground font-medium mb-3">
                  Contacts vs Convertis (6 mois)
                </p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.conversionByMonth} barGap={2}>
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "var(--muted-foreground)",
                          fontSize: 10,
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "var(--muted-foreground)",
                          fontSize: 10,
                        }}
                        width={28}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--surface)",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "13px",
                          boxShadow: "var(--shadow-elevated)",
                          padding: "8px 12px",
                        }}
                      />
                      <Bar
                        dataKey="contacts"
                        fill="var(--primary)"
                        opacity={0.3}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={24}
                        name="Contacts"
                      />
                      <Bar
                        dataKey="converted"
                        fill="var(--primary)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={24}
                        name="Convertis"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}

function ConversionStat({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          bgColor,
        )}
      >
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
