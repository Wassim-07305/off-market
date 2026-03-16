"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { DollarSign, Phone, Users, Activity, BarChart3, Bell } from "lucide-react";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { FinancialTab } from "@/components/analytics/financial-tab";
import { CallsTab } from "@/components/analytics/calls-tab";
import { PipelineTab } from "@/components/analytics/pipeline-tab";
import { EngagementTab } from "@/components/analytics/engagement-tab";
import { AnalyticsActivityHeatmap } from "@/components/analytics/activity-heatmap";
import { AnalyticsPeriodComparison } from "@/components/analytics/period-comparison";
import { ClosingRateChart } from "@/components/analytics/closing-rate-chart";
import { NotificationAnalytics } from "@/components/analytics/notification-analytics";
import { ReportExportButton } from "@/components/analytics/report-export";
import {
  periodToDateRange,
  useFinancialReport,
  useCallMetrics,
  usePipelineReport,
  useEngagementReport,
} from "@/hooks/use-reports";
import type { PeriodPreset } from "@/types/analytics";

type AnalyticsTab =
  | "finances"
  | "appels"
  | "pipeline"
  | "engagement"
  | "notifications"
  | "avance";

const TABS: { value: AnalyticsTab; label: string; icon: typeof DollarSign }[] =
  [
    { value: "finances", label: "Finances", icon: DollarSign },
    { value: "appels", label: "Appels", icon: Phone },
    { value: "pipeline", label: "Pipeline", icon: Users },
    { value: "engagement", label: "Engagement", icon: Activity },
    { value: "notifications", label: "Notifications", icon: Bell },
    { value: "avance", label: "Avance", icon: BarChart3 },
  ];

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  "90d": "90 derniers jours",
  "12m": "12 derniers mois",
  ytd: "Depuis janvier",
  all: "Tout",
};

function useReportSections(
  activeTab: AnalyticsTab,
  range: ReturnType<typeof periodToDateRange>,
) {
  const financial = useFinancialReport(range);
  const calls = useCallMetrics(range);
  const pipeline = usePipelineReport();
  const engagement = useEngagementReport(range);

  switch (activeTab) {
    case "finances": {
      const d = financial.data;
      if (!d) return null;
      return [
        {
          title: "Resume financier",
          rows: [
            {
              label: "Revenus total",
              value: `${d.totalRevenue.toLocaleString("fr-FR")} EUR`,
            },
            { label: "MRR", value: `${d.mrr.toLocaleString("fr-FR")} EUR` },
            { label: "ARR", value: `${d.arr.toLocaleString("fr-FR")} EUR` },
            {
              label: "Montant en attente",
              value: `${d.pendingAmount.toLocaleString("fr-FR")} EUR`,
            },
            {
              label: "Montant en retard",
              value: `${d.overdueAmount.toLocaleString("fr-FR")} EUR`,
            },
            {
              label: "Tendance",
              value: `${d.revenueTrend > 0 ? "+" : ""}${d.revenueTrend}%`,
            },
            {
              label: "Valeur moyenne / facture",
              value: `${d.avgDealValue.toLocaleString("fr-FR")} EUR`,
            },
          ],
        },
        {
          title: "Statut des factures",
          rows: [
            { label: "Payees", value: String(d.invoiceStatus.paid) },
            { label: "Envoyees", value: String(d.invoiceStatus.sent) },
            { label: "En retard", value: String(d.invoiceStatus.overdue) },
            { label: "Brouillons", value: String(d.invoiceStatus.draft) },
            { label: "Annulees", value: String(d.invoiceStatus.cancelled) },
          ],
        },
        {
          title: "Revenus par mois",
          rows: d.revenueByMonth.map((m) => ({
            label: m.label,
            value: `${m.revenue.toLocaleString("fr-FR")} EUR (${m.invoiceCount} factures)`,
          })),
        },
      ];
    }
    case "appels": {
      const d = calls.data;
      if (!d) return null;
      return [
        {
          title: "Metriques appels",
          rows: [
            { label: "Total appels", value: String(d.totalCalls) },
            { label: "Realises", value: String(d.completedCalls) },
            { label: "No-show", value: String(d.noShowCalls) },
            { label: "Taux completion", value: `${d.completionRate}%` },
            { label: "Taux no-show", value: `${d.noShowRate}%` },
            { label: "Duree moyenne", value: `${d.avgDurationMinutes} min` },
            { label: "Duree totale", value: `${d.totalDurationHours}h` },
          ],
        },
        {
          title: "Par type",
          rows: d.callsByType.map((c) => ({
            label: c.label,
            value: String(c.count),
          })),
        },
      ];
    }
    case "pipeline": {
      const d = pipeline.data;
      if (!d) return null;
      return [
        {
          title: "Pipeline CRM",
          rows: [
            { label: "Contacts total", value: String(d.totalContacts) },
            {
              label: "Valeur pipeline",
              value: `${d.totalPipelineValue.toLocaleString("fr-FR")} EUR`,
            },
            { label: "Taux conversion", value: `${d.conversionRate}%` },
            {
              label: "Deal moyen",
              value: `${d.avgDealValue.toLocaleString("fr-FR")} EUR`,
            },
            { label: "Convertis (30j)", value: String(d.recentlyConverted) },
            { label: "Perdus (30j)", value: String(d.recentlyLost) },
          ],
        },
        {
          title: "Par etape",
          rows: d.contactsByStage.map((s) => ({
            label: s.label,
            value: `${s.count} contacts — ${s.totalValue.toLocaleString("fr-FR")} EUR`,
          })),
        },
      ];
    }
    case "engagement": {
      const d = engagement.data;
      if (!d) return null;
      return [
        {
          title: "Engagement",
          rows: [
            { label: "Clients total", value: String(d.totalClients) },
            { label: "Clients actifs", value: String(d.activeClients) },
            { label: "Taux retention", value: `${d.retentionRate}%` },
            { label: "Score sante moyen", value: String(d.avgHealthScore) },
            { label: "Humeur moyenne", value: `${d.avgMood}/5` },
            { label: "Nouveaux clients", value: String(d.newClientsInPeriod) },
            { label: "Clients perdus", value: String(d.churnedClients) },
            { label: "Check-ins", value: String(d.checkinsCount) },
          ],
        },
        {
          title: "Segmentation",
          rows: d.tagDistribution.map((t) => ({
            label: t.label,
            value: String(t.count),
          })),
        },
      ];
    }
    case "notifications": {
      return [
        {
          title: "Notifications",
          rows: [
            { label: "Analytics notifications", value: "Voir ci-dessous" },
          ],
        },
      ];
    }
    case "avance": {
      return [
        {
          title: "Analyse avancee",
          rows: [
            { label: "Heatmap d'activite", value: "Voir ci-dessous" },
            { label: "Comparaison de periodes", value: "Voir ci-dessous" },
            { label: "Taux de closing par source", value: "Voir ci-dessous" },
          ],
        },
      ];
    }
  }
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("finances");
  const [period, setPeriod] = useState<PeriodPreset>("12m");
  const range = periodToDateRange(period);
  const sections = useReportSections(activeTab, range);

  const tabLabel = TABS.find((t) => t.value === activeTab)?.label ?? "";

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance et metriques detaillees
          </p>
        </div>
        <div className="flex items-center gap-3">
          {sections && (
            <ReportExportButton
              title={`Rapport ${tabLabel}`}
              period={PERIOD_LABELS[period]}
              sections={sections}
            />
          )}
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-1 border-b border-border/50 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px whitespace-nowrap",
                  activeTab === tab.value
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab content */}
      <motion.div variants={staggerItem}>
        {activeTab === "finances" && <FinancialTab range={range} />}
        {activeTab === "appels" && <CallsTab range={range} />}
        {activeTab === "pipeline" && <PipelineTab />}
        {activeTab === "engagement" && <EngagementTab range={range} />}
        {activeTab === "notifications" && <NotificationAnalytics />}
        {activeTab === "avance" && (
          <div className="space-y-6">
            <AnalyticsActivityHeatmap />
            <AnalyticsPeriodComparison />
            <ClosingRateChart />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
