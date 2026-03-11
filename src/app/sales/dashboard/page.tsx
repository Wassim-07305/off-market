"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, defaultTransition } from "@/lib/animations";
import { useBillingStats, useInvoices } from "@/hooks/use-invoices";
import { useContracts } from "@/hooks/use-contracts";
import { usePaymentReminders, REMINDER_LABELS } from "@/hooks/use-payment-reminders";
import { useAuth } from "@/hooks/use-auth";
import {
  DollarSign,
  FileSignature,
  Receipt,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Bell,
  Users,
  CalendarClock,
  FileText,
  Table,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { exportToCSV, exportToPDF } from "@/lib/export";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export default function SalesDashboardPage() {
  const { profile } = useAuth();
  const { data: billingStats, isLoading: statsLoading } = useBillingStats();
  const { invoices, isLoading: invoicesLoading } = useInvoices({ limit: 100 });
  const { contracts } = useContracts({ limit: 50 });
  const { pendingReminders } = usePaymentReminders();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon apres-midi";
    return "Bonsoir";
  }, []);

  // Revenue by month (last 6 months)
  const revenueByMonth = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = 0;
    }
    for (const inv of invoices) {
      if (inv.status === "paid" && inv.paid_at) {
        const d = new Date(inv.paid_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key in months) months[key] += Number(inv.total);
      }
    }
    return Object.entries(months).map(([key, revenue]) => ({
      month: key,
      label: new Date(key + "-01").toLocaleDateString("fr-FR", { month: "short" }),
      revenue,
    }));
  }, [invoices]);

  // MRR (average of last 3 months paid)
  const mrr = useMemo(() => {
    const last3 = revenueByMonth.slice(-3);
    const sum = last3.reduce((s, m) => s + m.revenue, 0);
    return last3.length > 0 ? sum / last3.length : 0;
  }, [revenueByMonth]);

  // Revenue forecast (next 3 months based on signed contracts value)
  const forecast = useMemo(() => {
    const signedContracts = contracts.filter((c) => c.status === "signed");
    // Estimate monthly value from pending invoices
    const monthlyForecast = mrr; // baseline = current MRR
    const pending = billingStats?.pendingAmount ?? 0;

    const result = [];
    const now = new Date();
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      result.push({
        month: d.toLocaleDateString("fr-FR", { month: "short" }),
        projected: Math.round(monthlyForecast + (pending / 3)),
        baseline: Math.round(monthlyForecast),
      });
    }
    return result;
  }, [mrr, billingStats, contracts]);

  // Top clients by revenue
  const topClients = useMemo(() => {
    const byClient: Record<string, { name: string; avatar: string | null; total: number; count: number }> = {};
    for (const inv of invoices) {
      if (inv.status === "paid" && inv.client) {
        const cid = inv.client_id;
        if (!byClient[cid]) {
          byClient[cid] = { name: inv.client.full_name, avatar: inv.client.avatar_url, total: 0, count: 0 };
        }
        byClient[cid].total += Number(inv.total);
        byClient[cid].count++;
      }
    }
    return Object.values(byClient)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [invoices]);

  // Overdue invoices
  const overdueInvoices = useMemo(
    () => invoices.filter((i) => i.status === "overdue").slice(0, 5),
    [invoices]
  );

  // Recent contracts
  const recentContracts = useMemo(
    () => contracts.slice(0, 5),
    [contracts]
  );

  const isLoading = statsLoading || invoicesLoading;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {greeting}, {profile?.full_name?.split(" ")[0] ?? ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Tableau de bord commercial</p>
        </div>
        <ExportDropdown
          disabled={isLoading}
          options={[
            {
              label: "Rapport PDF",
              icon: FileText,
              onClick: () => {
                exportToPDF({
                  title: "Rapport Commercial",
                  subtitle: "Tableau de bord Sales",
                  sections: [
                    {
                      title: "KPIs Financiers",
                      rows: [
                        { label: "Revenus totaux", value: formatEUR(billingStats?.totalRevenue ?? 0) },
                        { label: "MRR (Revenu mensuel recurrent)", value: formatEUR(mrr) },
                        { label: "ARR estime", value: formatEUR(mrr * 12) },
                        { label: "En attente", value: formatEUR(billingStats?.pendingAmount ?? 0) },
                        { label: "En retard", value: formatEUR(billingStats?.overdueAmount ?? 0) },
                      ],
                    },
                    {
                      title: "Revenus Mensuels",
                      rows: revenueByMonth.map((m) => ({
                        label: m.label,
                        value: formatEUR(m.revenue),
                      })),
                    },
                    {
                      title: "Previsions (3 mois)",
                      rows: forecast.map((f) => ({
                        label: f.month,
                        value: `Base: ${formatEUR(f.baseline)} / Projection: ${formatEUR(f.projected)}`,
                      })),
                    },
                    {
                      title: "Top Clients",
                      rows: topClients.map((c, i) => ({
                        label: `${i + 1}. ${c.name} (${c.count} factures)`,
                        value: formatEUR(c.total),
                      })),
                    },
                    {
                      title: "Statistiques",
                      rows: [
                        { label: "Contrats signes", value: String(billingStats?.contractsSigned ?? 0) },
                        { label: "Contrats en attente", value: String(billingStats?.contractsPending ?? 0) },
                        { label: "Factures payees", value: String(billingStats?.invoicesPaid ?? 0) },
                        { label: "Factures en retard", value: String(billingStats?.invoicesOverdue ?? 0) },
                      ],
                    },
                  ],
                });
              },
            },
            {
              label: "Donnees CSV",
              icon: Table,
              onClick: () => {
                exportToCSV(
                  revenueByMonth.map((m) => ({ ...m })),
                  [
                    { key: "month", label: "Mois" },
                    { key: "label", label: "Libelle" },
                    { key: "revenue", label: "Revenu (EUR)" },
                  ],
                  "revenus-mensuels"
                );
              },
            },
          ]}
        />
      </motion.div>

      {/* Alerts */}
      {pendingReminders.length > 0 && (
        <motion.div variants={staggerItem} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <Bell className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700">
              {pendingReminders.length} relance(s) a envoyer
            </p>
            <p className="text-xs text-amber-600/80">
              Des factures necessitent un rappel de paiement
            </p>
          </div>
          <Link href="/admin/billing" className="text-xs text-amber-600 font-medium hover:underline flex items-center gap-1">
            Voir <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      )}

      {/* KPI Cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 w-20 bg-muted rounded mb-3" />
              <div className="h-7 w-24 bg-muted rounded" />
            </div>
          ))
        ) : (
          <>
            <KPICard
              icon={DollarSign}
              label="Revenus totaux"
              value={formatEUR(billingStats?.totalRevenue ?? 0)}
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <KPICard
              icon={TrendingUp}
              label="MRR"
              value={formatEUR(mrr)}
              sub="Revenu mensuel recurrent"
              color="text-blue-500"
              bgColor="bg-blue-500/10"
            />
            <KPICard
              icon={Clock}
              label="En attente"
              value={formatEUR(billingStats?.pendingAmount ?? 0)}
              color="text-amber-500"
              bgColor="bg-amber-500/10"
            />
            <KPICard
              icon={AlertTriangle}
              label="En retard"
              value={formatEUR(billingStats?.overdueAmount ?? 0)}
              color={(billingStats?.overdueAmount ?? 0) > 0 ? "text-red-500" : "text-muted-foreground"}
              bgColor={(billingStats?.overdueAmount ?? 0) > 0 ? "bg-red-500/10" : "bg-muted/50"}
            />
          </>
        )}
      </motion.div>

      {/* Charts row */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Revenus mensuels</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueByMonth}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number | undefined) => value ? formatEUR(value) : "—"} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Previsions</h2>
          <p className="text-xs text-muted-foreground mb-4">3 prochains mois (base MRR + pipeline)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={forecast}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number | undefined) => value ? formatEUR(value) : "—"} />
              <Bar dataKey="baseline" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.3} name="Base MRR" />
              <Bar dataKey="projected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Projection" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom: Top clients + Overdue + Recent contracts */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top clients */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" /> Top clients
            </h2>
          </div>
          {topClients.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune donnee</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                  {c.avatar ? (
                    <img src={c.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-semibold">
                      {c.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.count} facture(s)</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{formatEUR(c.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue invoices */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Factures en retard
            </h2>
            <span className="text-xs text-muted-foreground">{billingStats?.invoicesOverdue ?? 0}</span>
          </div>
          {overdueInvoices.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune facture en retard</p>
          ) : (
            <div className="space-y-2.5">
              {overdueInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{inv.client?.full_name ?? "Client"}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {inv.invoice_number} — Echeance {inv.due_date ? new Date(inv.due_date).toLocaleDateString("fr-FR") : "—"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-red-500">{formatEUR(Number(inv.total))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent contracts */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-muted-foreground" /> Contrats recents
            </h2>
          </div>
          {recentContracts.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun contrat</p>
          ) : (
            <div className="space-y-2.5">
              {recentContracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground">{c.client?.full_name ?? "Client"}</p>
                  </div>
                  <ContractBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick stats row */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Contrats signes" value={String(billingStats?.contractsSigned ?? 0)} icon={FileSignature} />
        <MiniStat label="Contrats en attente" value={String(billingStats?.contractsPending ?? 0)} icon={CalendarClock} />
        <MiniStat label="Factures payees" value={String(billingStats?.invoicesPaid ?? 0)} icon={Receipt} />
        <MiniStat label="ARR estime" value={formatEUR(mrr * 12)} icon={TrendingUp} />
      </motion.div>
    </motion.div>
  );
}

// ─── Sub-components ─────────

function KPICard({ icon: Icon, label, value, sub, color, bgColor }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", bgColor)}>
        <Icon className={cn("w-4.5 h-4.5", color)} />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold text-foreground mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ContractBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    draft: { label: "Brouillon", cls: "bg-muted text-muted-foreground" },
    sent: { label: "Envoye", cls: "bg-blue-500/10 text-blue-600" },
    signed: { label: "Signe", cls: "bg-emerald-500/10 text-emerald-600" },
    cancelled: { label: "Annule", cls: "bg-red-500/10 text-red-600" },
  };
  const c = config[status] ?? config.draft;
  return (
    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", c.cls)}>
      {c.label}
    </span>
  );
}
