"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useClientOnboarding } from "@/hooks/use-onboarding";
import { useContracts } from "@/hooks/use-contracts";
import { useInvoices } from "@/hooks/use-invoices";
import { useCoachingGoals } from "@/hooks/use-coaching-goals";
import { useCheckins } from "@/hooks/use-checkins";
import { ONBOARDING_STEPS } from "@/types/billing";
import type { OnboardingStep } from "@/types/billing";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";

export default function ClientOnboardingPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const { client, isLoading, currentStep, setStep } =
    useClientOnboarding(clientId);
  const { contracts } = useContracts({ clientId });
  const { invoices } = useInvoices({ clientId });
  const { goals } = useCoachingGoals(clientId);
  const { checkins } = useCheckins(clientId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Client introuvable</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <Link
          href="/admin/onboarding"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="flex items-center gap-4">
          {client.avatar_url ? (
            <img
              src={client.avatar_url}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg text-primary font-semibold">
              {client.full_name?.charAt(0) ?? "?"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {client.full_name}
            </h1>
            <p className="text-sm text-muted-foreground">{client.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Progression onboarding
            </h2>
            <span className="text-sm text-muted-foreground">
              Etape {currentStep + 1} / {ONBOARDING_STEPS.length}
            </span>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {ONBOARDING_STEPS.map((s, i) => {
              const isDone = i < currentStep;
              const isCurrent = i === currentStep;
              const isComplete = currentStep >= 7;

              return (
                <button
                  key={s.step}
                  onClick={() => setStep.mutate(i as OnboardingStep)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    isCurrent
                      ? "bg-primary/5 border border-primary/20"
                      : isDone || isComplete
                        ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                        : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isDone || isComplete
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone || isComplete ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isDone || isComplete
                          ? "text-emerald-600"
                          : isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                  {isCurrent && (
                    <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Quick info cards */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Contrats
          </h3>
          {contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun contrat</p>
          ) : (
            <div className="space-y-1">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">{c.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Factures
          </h3>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune facture</p>
          ) : (
            <div className="space-y-1">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground font-mono">
                    {inv.invoice_number}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Objectifs
          </h3>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun objectif defini
            </p>
          ) : (
            <div className="space-y-1">
              {goals.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground truncate">{g.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {g.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Check-ins
          </h3>
          {checkins.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun check-in</p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-foreground">
                {checkins.length} check-in{checkins.length > 1 ? "s" : ""}
              </p>
              {checkins[0]?.mood && (
                <p className="text-xs text-muted-foreground">
                  Dernier mood : {checkins[0].mood}/5
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
