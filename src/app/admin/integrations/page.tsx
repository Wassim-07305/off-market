"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CreditCard,
  Mail,
  MessageSquare,
  Sparkles,
  Layout,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useGoogleCalendarStatus, useDisconnectGoogleCalendar } from "@/hooks/use-google-calendar";
import type { LucideIcon } from "lucide-react";

// ── Types ──────────────────────────────────────────────

interface IntegrationCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  name: string;
  description: string;
  status: "connected" | "configured" | "not_configured" | "available" | "loading";
  statusLabel?: string;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
}

// ── Status Badge ───────────────────────────────────────

function StatusBadge({
  status,
  label,
}: {
  status: IntegrationCardProps["status"];
  label?: string;
}) {
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Verification...
      </span>
    );
  }

  if (status === "connected" || status === "configured") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {label || (status === "connected" ? "Connecte" : "Configure")}
      </span>
    );
  }

  if (status === "available") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        {label || "Disponible"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
      {label || "Non configure"}
    </span>
  );
}

// ── Integration Card ───────────────────────────────────

function IntegrationCard({
  icon: Icon,
  iconClassName,
  name,
  description,
  status,
  statusLabel,
  action,
  secondaryAction,
}: IntegrationCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Icon className={iconClassName ?? "h-5 w-5 text-foreground"} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <StatusBadge status={status} label={statusLabel} />
      </div>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-auto pt-2">
          {action && (
            <button
              onClick={action.onClick}
              disabled={action.loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {action.loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {action.label}
              {!action.loading && <ExternalLink className="h-3.5 w-3.5" />}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {secondaryAction.loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Hooks for status checks ────────────────────────────

function useEmailStatus() {
  return useQuery<{ configured: boolean }>({
    queryKey: ["email-status"],
    queryFn: async () => {
      const res = await fetch("/api/email/status");
      if (!res.ok) throw new Error("Failed to fetch email status");
      return res.json();
    },
    staleTime: 5 * 60_000,
  });
}

function useIntegrationsStatus() {
  return useQuery<{
    openrouter: boolean;
    unipile: boolean;
    stripe: boolean;
  }>({
    queryKey: ["integrations-status"],
    queryFn: async () => {
      const res = await fetch("/api/integrations/status");
      if (!res.ok) throw new Error("Failed to fetch integrations status");
      return res.json();
    },
    staleTime: 5 * 60_000,
  });
}

// ── Page ───────────────────────────────────────────────

export default function IntegrationsPage() {
  const googleCalendar = useGoogleCalendarStatus();
  const emailStatus = useEmailStatus();
  const integrationsStatus = useIntegrationsStatus();
  const disconnectGoogle = useDisconnectGoogleCalendar();

  // Stripe check: client-side env var
  const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="mt-1 text-muted-foreground">
          Connectez vos outils externes pour etendre les fonctionnalites de la
          plateforme.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Google Calendar */}
        <IntegrationCard
          icon={Calendar}
          iconClassName="h-5 w-5 text-blue-600"
          name="Google Calendar"
          description="Synchronisez vos appels et evenements"
          status={
            googleCalendar.isLoading
              ? "loading"
              : googleCalendar.data?.connected
                ? "connected"
                : "not_configured"
          }
          statusLabel={
            googleCalendar.data?.connected
              ? `Connecte — ${googleCalendar.data.google_email}`
              : undefined
          }
          action={
            googleCalendar.data?.connected
              ? undefined
              : {
                  label: "Connecter",
                  onClick: () => {
                    window.location.href = "/api/google-calendar/connect";
                  },
                }
          }
          secondaryAction={
            googleCalendar.data?.connected
              ? {
                  label: "Deconnecter",
                  onClick: () => disconnectGoogle.mutate(),
                  loading: disconnectGoogle.isPending,
                }
              : undefined
          }
        />

        {/* Stripe */}
        <IntegrationCard
          icon={CreditCard}
          iconClassName="h-5 w-5 text-violet-600"
          name="Stripe"
          description="Acceptez les paiements en ligne"
          status={
            integrationsStatus.isLoading
              ? "loading"
              : (integrationsStatus.data?.stripe || isStripeConfigured)
                ? "configured"
                : "not_configured"
          }
          statusLabel={
            (integrationsStatus.data?.stripe || isStripeConfigured)
              ? "Configure"
              : "Non configure — Ajoutez STRIPE_SECRET_KEY"
          }
        />

        {/* Resend (Email) */}
        <IntegrationCard
          icon={Mail}
          iconClassName="h-5 w-5 text-orange-500"
          name="Resend (Email)"
          description="Envoyez des emails transactionnels"
          status={
            emailStatus.isLoading
              ? "loading"
              : emailStatus.data?.configured
                ? "configured"
                : "not_configured"
          }
          statusLabel={
            emailStatus.data?.configured
              ? "Configure"
              : "Non configure — Ajoutez RESEND_API_KEY"
          }
        />

        {/* Unipile */}
        <IntegrationCard
          icon={MessageSquare}
          iconClassName="h-5 w-5 text-green-600"
          name="Unipile (LinkedIn / WhatsApp)"
          description="Messagerie unifiee LinkedIn et WhatsApp"
          status={
            integrationsStatus.isLoading
              ? "loading"
              : integrationsStatus.data?.unipile
                ? "configured"
                : "not_configured"
          }
          statusLabel={
            integrationsStatus.data?.unipile
              ? "Configure"
              : "Non configure — Ajoutez UNIPILE_API_KEY"
          }
        />

        {/* OpenRouter (IA) */}
        <IntegrationCard
          icon={Sparkles}
          iconClassName="h-5 w-5 text-amber-500"
          name="OpenRouter (IA)"
          description="Intelligence artificielle pour AlexIA"
          status={
            integrationsStatus.isLoading
              ? "loading"
              : integrationsStatus.data?.openrouter
                ? "configured"
                : "not_configured"
          }
          statusLabel={
            integrationsStatus.data?.openrouter
              ? "Configure"
              : "Non configure — Ajoutez OPENROUTER_API_KEY"
          }
        />

        {/* Miro */}
        <IntegrationCard
          icon={Layout}
          iconClassName="h-5 w-5 text-yellow-500"
          name="Miro"
          description="Tableaux collaboratifs integres"
          status="available"
          statusLabel="Disponible"
        />
      </div>
    </div>
  );
}
