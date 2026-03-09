"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useStudents } from "@/hooks/use-students";
import { ONBOARDING_STEPS } from "@/types/billing";
import { Users, CheckCircle, ArrowRight } from "lucide-react";

export default function OnboardingListPage() {
  const { students: clients, isLoading } = useStudents();

  const withOnboarding = clients.map((c) => ({
    ...c,
    onboarding_step: ((c as unknown as Record<string, unknown>).onboarding_step as number) ?? 0,
  }));

  const incomplete = withOnboarding.filter((c) => c.onboarding_step < 7);
  const complete = withOnboarding.filter((c) => c.onboarding_step >= 7);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Onboarding clients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivi de l&apos;integration des nouveaux clients
        </p>
      </motion.div>

      {/* In progress */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          En cours ({incomplete.length})
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : incomplete.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Tous les clients ont termine leur onboarding
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {incomplete.map((client) => (
              <Link
                key={client.id}
                href={`/admin/onboarding/${client.id}`}
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {client.avatar_url ? (
                    <img
                      src={client.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm text-primary font-semibold">
                      {client.full_name?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{client.full_name}</p>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <OnboardingProgress step={client.onboarding_step} />
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Completed */}
      {complete.length > 0 && (
        <motion.div variants={fadeInUp} transition={defaultTransition}>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Termines ({complete.length})
          </h2>
          <div className="space-y-2">
            {complete.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl opacity-60"
              >
                <div className="flex items-center gap-3">
                  {client.avatar_url ? (
                    <img
                      src={client.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm text-primary font-semibold">
                      {client.full_name?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{client.full_name}</p>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function OnboardingProgress({ step }: { step: number }) {
  const totalSteps = ONBOARDING_STEPS.length;
  const current = ONBOARDING_STEPS[Math.min(step, totalSteps - 1)];
  const pct = Math.round((step / (totalSteps - 1)) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <span className="text-xs text-muted-foreground block">{current.label}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{pct}%</span>
      </div>
      <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
