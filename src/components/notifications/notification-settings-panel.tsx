"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Bell,
  BellOff,
  Mail,
  Smartphone,
  Loader2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notification-preferences";
import type {
  BatchFrequency,
  PriorityThreshold,
} from "@/types/database";

const BATCH_OPTIONS: { value: BatchFrequency; label: string; desc: string }[] =
  [
    {
      value: "instant",
      label: "Instantane",
      desc: "Chaque notification est affichee immediatement",
    },
    {
      value: "hourly",
      label: "Toutes les heures",
      desc: "Les notifications sont regroupees en un resume horaire",
    },
    {
      value: "daily",
      label: "Resume quotidien",
      desc: "Un seul resume par jour avec toutes les notifications",
    },
  ];

const PRIORITY_OPTIONS: {
  value: PriorityThreshold;
  label: string;
  desc: string;
}[] = [
  {
    value: "all",
    label: "Toutes",
    desc: "Recevoir toutes les notifications",
  },
  {
    value: "high",
    label: "Haute et critique",
    desc: "Uniquement les notifications importantes et critiques",
  },
  {
    value: "critical",
    label: "Critique uniquement",
    desc: "Seulement les notifications critiques",
  },
];

interface NotificationSettingsPanelProps {
  className?: string;
}

export function NotificationSettingsPanel({
  className,
}: NotificationSettingsPanelProps) {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [batchFrequency, setBatchFrequency] =
    useState<BatchFrequency>("instant");
  const [priorityThreshold, setPriorityThreshold] =
    useState<PriorityThreshold>("all");
  const [emailDigest, setEmailDigest] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  // Sync local state with fetched preferences
  useEffect(() => {
    if (prefs) {
      setQuietStart(prefs.quiet_hours_start);
      setQuietEnd(prefs.quiet_hours_end);
      setBatchFrequency(prefs.batch_frequency);
      setPriorityThreshold(prefs.priority_threshold);
      setEmailDigest(prefs.email_digest);
      setPushEnabled(prefs.push_enabled);
    }
  }, [prefs]);

  const handleSave = (updates: Parameters<typeof updatePrefs.mutate>[0]) => {
    updatePrefs.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* ── Quiet hours ─────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center">
            <Clock className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Heures silencieuses
            </h3>
            <p className="text-xs text-muted-foreground">
              Aucune notification pendant cette periode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Debut
            </label>
            <input
              type="time"
              value={quietStart}
              onChange={(e) => {
                setQuietStart(e.target.value);
                handleSave({ quiet_hours_start: e.target.value });
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <span className="text-muted-foreground mt-5">—</span>
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Fin
            </label>
            <input
              type="time"
              value={quietEnd}
              onChange={(e) => {
                setQuietEnd(e.target.value);
                handleSave({ quiet_hours_end: e.target.value });
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5 mt-0.5 shrink-0" />
          <span>
            Les notifications critiques ignorent les heures silencieuses.
          </span>
        </div>
      </section>

      {/* ── Batch frequency ─────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center">
            <Bell className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Frequence de notification
            </h3>
            <p className="text-xs text-muted-foreground">
              Comment regrouper vos notifications
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {BATCH_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setBatchFrequency(option.value);
                handleSave({ batch_frequency: option.value });
              }}
              className={cn(
                "w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
                batchFrequency === option.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30 hover:bg-muted/30",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  batchFrequency === option.value
                    ? "border-primary"
                    : "border-muted-foreground/30",
                )}
              >
                {batchFrequency === option.value && (
                  <div className="size-2 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {option.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Priority threshold ──────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center">
            <BellOff className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Seuil de priorite
            </h3>
            <p className="text-xs text-muted-foreground">
              Filtrer par niveau d'importance
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setPriorityThreshold(option.value);
                handleSave({ priority_threshold: option.value });
              }}
              className={cn(
                "w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
                priorityThreshold === option.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30 hover:bg-muted/30",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  priorityThreshold === option.value
                    ? "border-primary"
                    : "border-muted-foreground/30",
                )}
              >
                {priorityThreshold === option.value && (
                  <div className="size-2 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {option.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Toggles ─────────────────────────────────────────── */}
      <section className="space-y-4">
        {/* Email digest */}
        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center">
              <Mail className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Resume par email
              </p>
              <p className="text-xs text-muted-foreground">
                Recevoir un email avec le resume de vos notifications
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={emailDigest}
            onClick={() => {
              setEmailDigest(!emailDigest);
              handleSave({ email_digest: !emailDigest });
            }}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
              emailDigest ? "bg-[#DC2626]" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                emailDigest ? "translate-x-5.5" : "translate-x-0.5",
              )}
              style={{ marginTop: "2px" }}
            />
          </button>
        </div>

        {/* Push notifications */}
        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center">
              <Smartphone className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Notifications push
              </p>
              <p className="text-xs text-muted-foreground">
                Recevoir des notifications push sur vos appareils
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={pushEnabled}
            onClick={() => {
              setPushEnabled(!pushEnabled);
              handleSave({ push_enabled: !pushEnabled });
            }}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
              pushEnabled ? "bg-[#DC2626]" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                pushEnabled ? "translate-x-5.5" : "translate-x-0.5",
              )}
              style={{ marginTop: "2px" }}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
