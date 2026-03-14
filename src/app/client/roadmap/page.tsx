"use client";

import { useAuth } from "@/hooks/use-auth";
import { useClientRoadmap } from "@/hooks/use-roadmap";
import { useClientFlag } from "@/hooks/use-client-flags";
import { RoadmapViewer } from "@/components/coaching/roadmap-viewer";
import { ClientFlagBadge } from "@/components/crm/client-flag-badge";
import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import { Map, Loader2 } from "lucide-react";

export default function ClientOwnRoadmapPage() {
  const { user } = useAuth();
  const { data: roadmap, isLoading } = useClientRoadmap(user?.id);
  const { data: clientFlag } = useClientFlag(user?.id);

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
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Ma Roadmap
          </h1>
          <p className="text-sm text-muted-foreground">
            Ton parcours personnalise vers tes objectifs
          </p>
        </div>

        {clientFlag && (
          <ClientFlagBadge
            flag={clientFlag.flag}
            showLabel
            pulse={clientFlag.flag !== "green"}
          />
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">
            Chargement de ta roadmap...
          </p>
        </div>
      ) : roadmap ? (
        <RoadmapViewer roadmap={roadmap} isStaff={false} />
      ) : (
        <div className="flex flex-col items-center py-16 text-center border border-dashed border-border rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Map className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Roadmap en preparation
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Ton coach est en train de preparer ta roadmap personnalisee. Elle
            sera disponible apres ton appel kickoff.
          </p>
        </div>
      )}
    </motion.div>
  );
}
