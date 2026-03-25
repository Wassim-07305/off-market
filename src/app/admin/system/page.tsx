"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import {
  Bug,
  Activity,
  BookOpen,
  ClipboardList,
  Plug,
  Loader2,
} from "lucide-react";

const Loader = () => (
  <div className="flex items-center justify-center py-24">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

const ErrorLogsPage = dynamic(() => import("@/app/admin/error-logs/page"), {
  loading: Loader,
});
const MonitoringPage = dynamic(() => import("@/app/admin/monitoring/page"), {
  loading: Loader,
});
const ApiDocsPage = dynamic(() => import("@/app/admin/api-docs/page"), {
  loading: Loader,
});
const AuditPage = dynamic(
  () => import("@/app/_shared-pages/admin/audit/page"),
  { loading: Loader },
);
const IntegrationsPage = dynamic(
  () => import("@/app/admin/integrations/page"),
  { loading: Loader },
);

const TABS = [
  { key: "monitoring", label: "Monitoring", icon: Activity },
  { key: "errors", label: "Error Logs", icon: Bug },
  { key: "audit", label: "Audit Log", icon: ClipboardList },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "api-docs", label: "Documentation API", icon: BookOpen },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SystemPage() {
  const [tab, setTab] = useState<TabKey>("monitoring");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
          Systeme
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitoring, erreurs, audit et documentation API
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2",
              tab === key
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {tab === "monitoring" && <MonitoringPage />}
      {tab === "errors" && <ErrorLogsPage />}
      {tab === "audit" && <AuditPage />}
      {tab === "integrations" && <IntegrationsPage />}
      {tab === "api-docs" && <ApiDocsPage />}
    </div>
  );
}
