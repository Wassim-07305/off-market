/* ─── Analytics & Reports types ─── */

/** Date range filter for all report queries */
export interface DateRange {
  from: string; // ISO date YYYY-MM-DD
  to: string;
}

/** Preset period shortcuts */
export type PeriodPreset = "7d" | "30d" | "90d" | "12m" | "ytd" | "all";

export const PERIOD_PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
  { value: "12m", label: "12 mois" },
  { value: "ytd", label: "Depuis janvier" },
  { value: "all", label: "Tout" },
];

/* ─── Financial ─── */

export interface MonthlyRevenue {
  month: string; // "2026-01"
  label: string; // "Jan 2026"
  revenue: number;
  invoiceCount: number;
}

export interface InvoiceStatusBreakdown {
  paid: number;
  sent: number;
  overdue: number;
  draft: number;
  cancelled: number;
}

export interface FinancialReport {
  totalRevenue: number;
  mrr: number; // Monthly Recurring Revenue (avg last 3 months)
  arr: number; // Annual Recurring Revenue (mrr × 12)
  pendingAmount: number;
  overdueAmount: number;
  revenueByMonth: MonthlyRevenue[];
  invoiceStatus: InvoiceStatusBreakdown;
  revenueTrend: number; // % change vs previous period
  avgDealValue: number;
  ltv: number; // Average lifetime value = total revenue / unique paying clients
  collectionRate: number; // % of invoiced amount collected (paid / total × 100)
  activeClients: number; // Clients with activity in last 30 days
}

/* ─── Call metrics ─── */

export interface CallMetrics {
  totalCalls: number;
  completedCalls: number;
  noShowCalls: number;
  cancelledCalls: number;
  rescheduledCalls: number;
  completionRate: number; // % réalisé / total
  noShowRate: number;
  avgDurationMinutes: number;
  totalDurationHours: number;
  callsByType: { type: string; label: string; count: number }[];
  callsByMonth: {
    month: string;
    label: string;
    count: number;
    completed: number;
  }[];
  moodDistribution: {
    mood: string;
    label: string;
    count: number;
    color: string;
  }[];
  outcomeDistribution: { outcome: string; label: string; count: number }[];
}

/* ─── Pipeline / CRM ─── */

export interface StageMetric {
  stage: string;
  label: string;
  count: number;
  totalValue: number;
  color: string;
}

export interface SourceByMonth {
  month: string; // "2026-01"
  label: string; // "Jan 2026"
  sources: Record<string, number>;
}

export interface PipelineReport {
  totalContacts: number;
  totalPipelineValue: number;
  contactsByStage: StageMetric[];
  conversionRate: number; // % prospect → client
  avgDealValue: number;
  contactsBySource: { source: string; label: string; count: number }[];
  sourcesByMonth: SourceByMonth[]; // Monthly breakdown of acquisition sources
  recentlyConverted: number; // contacts moved to "client" in period
  recentlyLost: number; // contacts moved to "perdu" in period
}

/* ─── Engagement ─── */

export interface EngagementReport {
  totalClients: number;
  activeClients: number; // engaged in last 14 days
  churnedClients: number;
  retentionRate: number; // %
  newClientsInPeriod: number;
  tagDistribution: {
    tag: string;
    label: string;
    count: number;
    color: string;
  }[];
  activityByType: { type: string; label: string; count: number }[];
  activityHeatmap: { day: number; hour: number; count: number }[]; // 0=Mon, 0-23h
  avgHealthScore: number;
  avgMood: number;
  checkinsCount: number;
}

/* ─── CSV Export ─── */

export interface ExportColumn {
  key: string;
  label: string;
}
