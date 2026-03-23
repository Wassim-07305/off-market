"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Settings, Plus } from "lucide-react";
import { SetterPipelineKanban } from "@/components/crm/setter-pipeline-kanban";
import { SetterPipelineList } from "@/components/crm/setter-pipeline-list";
import { SetterBilan } from "@/components/crm/setter-bilan";
import { SetterPipelineConfig } from "@/components/crm/setter-pipeline-config";
import {
  useCreateSetterLead,
  usePipelineColumns,
} from "@/hooks/use-setter-crm";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type CrmView = "pipeline" | "liste" | "bilan";

const TABS: { key: CrmView; label: string }[] = [
  { key: "pipeline", label: "Pipeline" },
  { key: "liste", label: "Liste" },
  { key: "bilan", label: "Bilan" },
];

export default function CRMPage() {
  const [view, setView] = useState<CrmView>("pipeline");
  const [showConfig, setShowConfig] = useState(false);
  const { user } = useAuth();
  const { columns } = usePipelineColumns();
  const createLead = useCreateSetterLead();

  const handleNewProspect = () => {
    const firstColumn = columns?.[0];
    if (!firstColumn) {
      toast.error("Aucune colonne configuree");
      return;
    }
    createLead.mutate(
      {
        setter_id: user?.id ?? "",
        column_id: firstColumn.id,
        name: "Sans nom",
      } as any,
      {
        onSuccess: () => toast.success("Prospect ajoute"),
      },
    );
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header — comme Rivia */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            CRM Setter
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pipeline de prospection, suivi des leads et bilan d&apos;activité.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowConfig(true)}
            className="h-10 px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Colonnes
          </button>
          <button
            onClick={handleNewProspect}
            disabled={createLead.isPending}
            className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau prospect
          </button>
        </div>
      </motion.div>

      {/* Tabs — alignés à gauche comme Rivia */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-0 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={cn(
                "h-10 px-4 text-sm font-medium transition-all relative",
                view === tab.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {view === tab.key && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab content */}
      <motion.div variants={staggerItem}>
        {view === "pipeline" && <SetterPipelineKanban />}
        {view === "liste" && <SetterPipelineList />}
        {view === "bilan" && <SetterBilan />}
      </motion.div>

      {/* Column config modal */}
      <SetterPipelineConfig
        open={showConfig}
        onClose={() => setShowConfig(false)}
        columns={columns ?? []}
      />
    </motion.div>
  );
}
