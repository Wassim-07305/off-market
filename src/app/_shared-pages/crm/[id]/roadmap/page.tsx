"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useAuth } from "@/hooks/use-auth";
import {
  useClientRoadmap,
  useUpdateMilestone,
  useCompleteMilestone,
} from "@/hooks/use-roadmap";
import { useClientFlag, useSetClientFlag } from "@/hooks/use-client-flags";
import { RoadmapViewer } from "@/components/coaching/roadmap-viewer";
import { RoadmapGenerator } from "@/components/coaching/roadmap-generator";
import { ClientFlagBadge } from "@/components/crm/client-flag-badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import {
  ArrowLeft,
  Map,
  Sparkles,
  Plus,
  Flag,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { MilestoneStatus, ClientFlagValue } from "@/types/roadmap";
import { CLIENT_FLAG_CONFIG } from "@/types/roadmap";

export default function ClientRoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clientId } = use(params);
  const prefix = useRoutePrefix();
  const { isStaff } = useAuth();

  const [generatorOpen, setGeneratorOpen] = useState(false);

  const { data: roadmap, isLoading: roadmapLoading } =
    useClientRoadmap(clientId);
  const { data: clientFlag } = useClientFlag(clientId);

  const updateMilestone = useUpdateMilestone();
  const completeMilestone = useCompleteMilestone();
  const setClientFlag = useSetClientFlag();

  const [flagMenuOpen, setFlagMenuOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<ClientFlagValue | null>(
    null,
  );
  const [flagReason, setFlagReason] = useState("");

  const handleStatusChange = (id: string, status: MilestoneStatus) => {
    updateMilestone.mutate({ id, status });
  };

  const handleComplete = (id: string, notes?: string) => {
    completeMilestone.mutate({ id, notes });
  };

  const handleNotesUpdate = (id: string, notes: string) => {
    updateMilestone.mutate({ id, notes });
  };

  const handleFlagSelect = (flag: ClientFlagValue) => {
    if (flag === clientFlag?.flag) {
      setFlagMenuOpen(false);
      return;
    }
    setSelectedFlag(flag);
  };

  const handleFlagConfirm = () => {
    if (!selectedFlag) return;
    setClientFlag.mutate({
      clientId,
      flag: selectedFlag,
      reason: flagReason || undefined,
    });
    setFlagMenuOpen(false);
    setSelectedFlag(null);
    setFlagReason("");
  };

  const isPending =
    updateMilestone.isPending || completeMilestone.isPending;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={defaultTransition}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href={`${prefix}/clients/${clientId}`}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Roadmap client
            </h1>
            <p className="text-sm text-muted-foreground">
              Parcours personnalise et suivi de progression
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Current flag */}
          {clientFlag && (
            <ClientFlagBadge
              flag={clientFlag.flag}
              showLabel
              pulse={clientFlag.flag !== "green"}
            />
          )}

          {/* Flag selector (staff only) */}
          {isStaff && (
            <div className="relative">
              <button
                onClick={() => setFlagMenuOpen(!flagMenuOpen)}
                className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                Drapeau
              </button>

              {flagMenuOpen && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-border rounded-xl shadow-lg z-50 w-72 overflow-hidden">
                  {!selectedFlag ? (
                    <div className="py-1">
                      {(
                        Object.entries(CLIENT_FLAG_CONFIG) as [
                          ClientFlagValue,
                          (typeof CLIENT_FLAG_CONFIG)[ClientFlagValue],
                        ][]
                      ).map(([value, config]) => (
                        <button
                          key={value}
                          onClick={() => handleFlagSelect(value)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left",
                            value === clientFlag?.flag && "bg-muted/50",
                          )}
                        >
                          <span
                            className={cn(
                              "w-3 h-3 rounded-full shrink-0",
                              config.dotColor,
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">
                              {config.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {config.description}
                            </p>
                          </div>
                          {value === clientFlag?.flag && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              Actuel
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <span
                          className={cn(
                            "w-3 h-3 rounded-full",
                            CLIENT_FLAG_CONFIG[selectedFlag].dotColor,
                          )}
                        />
                        Changer en {CLIENT_FLAG_CONFIG[selectedFlag].label}
                      </p>
                      <textarea
                        value={flagReason}
                        onChange={(e) => setFlagReason(e.target.value)}
                        placeholder="Raison du changement (optionnel)..."
                        rows={2}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedFlag(null);
                            setFlagReason("");
                            setFlagMenuOpen(false);
                          }}
                          className="flex-1 h-8 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleFlagConfirm}
                          disabled={setClientFlag.isPending}
                          className="flex-1 h-8 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          Confirmer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Generate / create roadmap (staff only) */}
          {isStaff && (
            <button
              onClick={() => setGeneratorOpen(true)}
              className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {roadmap ? "Nouvelle roadmap" : "Generer"}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {roadmapLoading ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">
            Chargement de la roadmap...
          </p>
        </div>
      ) : roadmap ? (
        <RoadmapViewer
          roadmap={roadmap}
          isStaff={isStaff}
          onStatusChange={handleStatusChange}
          onComplete={handleComplete}
          onNotesUpdate={handleNotesUpdate}
          isPending={isPending}
        />
      ) : (
        <div className="flex flex-col items-center py-16 text-center border border-dashed border-border rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Map className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Aucune roadmap active
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {isStaff
              ? "Generez une roadmap personnalisee basee sur l'appel kickoff ou creez-en une manuellement."
              : "Votre coach n'a pas encore cree votre roadmap. Elle sera disponible prochainement."}
          </p>
          {isStaff && (
            <button
              onClick={() => setGeneratorOpen(true)}
              className="mt-4 h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generer avec l&apos;IA
            </button>
          )}
        </div>
      )}

      {/* Generator modal */}
      <RoadmapGenerator
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        clientId={clientId}
        clientName={roadmap?.client?.full_name}
      />
    </motion.div>
  );
}
