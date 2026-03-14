"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Loader2,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Save,
  FileText,
} from "lucide-react";
import { useGenerateRoadmap, useCreateRoadmap } from "@/hooks/use-roadmap";
import type { GenerateRoadmapResponse } from "@/types/roadmap";
import { MILESTONE_STATUS_CONFIG } from "@/types/roadmap";

interface RoadmapGeneratorProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName?: string;
  callId?: string;
}

type Step = "config" | "generating" | "preview" | "saving";

export function RoadmapGenerator({
  open,
  onClose,
  clientId,
  clientName,
  callId,
}: RoadmapGeneratorProps) {
  const [step, setStep] = useState<Step>("config");
  const [context, setContext] = useState("");
  const [transcript, setTranscript] = useState("");
  const [preview, setPreview] = useState<GenerateRoadmapResponse | null>(null);

  const generateRoadmap = useGenerateRoadmap();
  const createRoadmap = useCreateRoadmap();

  const handleGenerate = async () => {
    setStep("generating");
    try {
      const result = await generateRoadmap.mutateAsync({
        clientId,
        callId,
        callTranscript: transcript || undefined,
        context: context || undefined,
      });
      setPreview(result);
      setStep("preview");
    } catch {
      setStep("config");
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    setStep("saving");
    try {
      await createRoadmap.mutateAsync({
        clientId,
        title: preview.title,
        description: preview.description,
        milestones: preview.milestones,
        generatedFrom: callId ? "kickoff_call" : "ai_suggestion",
        sourceCallId: callId,
      });
      handleReset();
      onClose();
    } catch {
      setStep("preview");
    }
  };

  const handleRegenerate = () => {
    setPreview(null);
    setStep("config");
  };

  const handleReset = () => {
    setStep("config");
    setContext("");
    setTranscript("");
    setPreview(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Generer une roadmap IA"
      description={
        clientName
          ? `Roadmap personnalisee pour ${clientName}`
          : "Roadmap personnalisee basee sur l'IA"
      }
      size="lg"
      className="max-h-[85vh]"
    >
      <div className="space-y-4">
        {/* Step: Config */}
        {step === "config" && (
          <>
            {callId && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                <FileText className="w-4 h-4 shrink-0" />
                La transcription et les notes de l&apos;appel seront utilisees
                automatiquement.
              </div>
            )}

            {!callId && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Transcription (optionnelle)
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Collez la transcription de l'appel ici..."
                  rows={4}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Contexte supplementaire (optionnel)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ex: Le client est dans la niche fitness, il a deja une audience de 5k sur Instagram..."
                rows={3}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleClose}
                className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleGenerate}
                className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generer avec l&apos;IA
              </button>
            </div>
          </>
        )}

        {/* Step: Generating */}
        {step === "generating" && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Generation de la roadmap en cours...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              L&apos;IA analyse le profil et genere des jalons personnalises
            </p>
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && preview && (
          <>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <h3 className="text-sm font-semibold text-emerald-800">
                  {preview.title}
                </h3>
                {preview.description && (
                  <p className="text-xs text-emerald-600 mt-1">
                    {preview.description}
                  </p>
                )}
              </div>

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {preview.milestones.length} jalons generes
              </p>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {preview.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-border bg-white"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">
                          {milestone.title}
                        </h4>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {milestone.description}
                          </p>
                        )}
                        {milestone.validation_criteria.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {milestone.validation_criteria.map((c, ci) => (
                              <div
                                key={ci}
                                className="flex items-start gap-1.5"
                              >
                                <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                                <span className="text-[11px] text-muted-foreground">
                                  {c}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button
                onClick={handleRegenerate}
                className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerer
              </button>
              <button
                onClick={handleSave}
                className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Enregistrer la roadmap
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* Step: Saving */}
        {step === "saving" && (
          <div className="flex flex-col items-center py-12 text-center">
            <Loader2 className="w-7 h-7 text-primary animate-spin mb-4" />
            <p className="text-sm font-medium text-foreground">
              Enregistrement de la roadmap...
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
