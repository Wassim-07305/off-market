"use client";

import { useState, useMemo } from "react";
import { FileSignature, ChevronRight, ChevronLeft } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useContractTemplates } from "@/hooks/use-contracts";
import {
  useClientBusinessInfo,
  useGenerateContract,
} from "@/hooks/use-contract-generator";
import { BusinessInfoForm } from "./business-info-form";
import { ContractPreview } from "./contract-preview";
import type { ContractTemplate } from "@/types/billing";

interface ContractGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
}

type Step = "template" | "info" | "variables" | "preview";

export function ContractGeneratorModal({
  open,
  onClose,
  clientId,
}: ContractGeneratorModalProps) {
  const [step, setStep] = useState<Step>("template");
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContractTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {},
  );
  const [generatedContent, setGeneratedContent] = useState("");

  const { templates, isLoading: templatesLoading } = useContractTemplates();
  const { data: businessInfo } = useClientBusinessInfo(clientId);
  const generateContract = useGenerateContract();

  // Auto-fill variables from business info
  const allVariables = useMemo(() => {
    if (!selectedTemplate) return {};
    const vars: Record<string, string> = { ...variableValues };
    if (businessInfo) {
      if (!vars.client_name) vars.client_name = businessInfo.full_name ?? "";
      if (!vars.client_email) vars.client_email = businessInfo.email ?? "";
      if (!vars.siret) vars.siret = businessInfo.siret ?? "";
      if (!vars.company_name)
        vars.company_name = businessInfo.company_name ?? "";
      if (!vars.company_address)
        vars.company_address = businessInfo.company_address ?? "";
      if (!vars.legal_form) vars.legal_form = businessInfo.legal_form ?? "";
      if (!vars.date) vars.date = new Date().toLocaleDateString("fr-FR");
    }
    return vars;
  }, [selectedTemplate, variableValues, businessInfo]);

  function selectTemplate(tpl: ContractTemplate) {
    setSelectedTemplate(tpl);
    setVariableValues({});
    setStep("info");
  }

  function handleInfoSaved() {
    setStep("variables");
  }

  function generatePreview() {
    if (!selectedTemplate) return;
    let content = selectedTemplate.content;
    for (const [key, value] of Object.entries(allVariables)) {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    setGeneratedContent(content);
    setStep("preview");
  }

  async function handleGenerate() {
    if (!selectedTemplate) return;
    await generateContract.mutateAsync({
      templateId: selectedTemplate.id,
      clientId,
      variables: allVariables,
    });
    onClose();
  }

  function handleClose() {
    setStep("template");
    setSelectedTemplate(null);
    setVariableValues({});
    setGeneratedContent("");
    onClose();
  }

  const stepLabels: Record<Step, string> = {
    template: "Modèle",
    info: "Informations",
    variables: "Variables",
    preview: "Aperçu",
  };

  const steps: Step[] = ["template", "info", "variables", "preview"];
  const currentIndex = steps.indexOf(step);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Generer un contrat"
      size="xl"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors",
                i <= currentIndex
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  i <= currentIndex
                    ? "bg-primary text-white"
                    : "bg-muted-foreground/20 text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{stepLabels[s]}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            )}
          </div>
        ))}
      </div>

      {/* Step: Template selection */}
      {step === "template" && (
        <div className="space-y-3">
          {templatesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSignature className="mx-auto h-10 w-10 mb-3 opacity-30" />
              <p>Aucun modèle de contrat disponible.</p>
              <p className="text-xs mt-1">
                Creez d&apos;abord un modèle dans la section Contrats.
              </p>
            </div>
          ) : (
            templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => selectTemplate(tpl)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all",
                  "group cursor-pointer",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{tpl.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tpl.variables.length} variable(s)
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Step: Business info */}
      {step === "info" && (
        <div className="space-y-4">
          <BusinessInfoForm
            clientId={clientId}
            onSaved={handleInfoSaved}
            compact
          />
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setStep("template")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <Button onClick={handleInfoSaved}>
              Continuer
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Variables */}
      {step === "variables" && selectedTemplate && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Completez les variables du contrat. Les champs pre-remplis
            proviennent des informations du client.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedTemplate.variables.map((v) => (
              <div key={v.key}>
                <label className="text-sm font-medium">{v.label}</label>
                <Input
                  type={
                    v.type === "number"
                      ? "number"
                      : v.type === "date"
                        ? "date"
                        : "text"
                  }
                  value={allVariables[v.key] ?? ""}
                  onChange={(e) =>
                    setVariableValues((prev) => ({
                      ...prev,
                      [v.key]: e.target.value,
                    }))
                  }
                  placeholder={v.label}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep("info")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <Button onClick={generatePreview}>
              Aperçu
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          <ContractPreview
            title={selectedTemplate?.title ?? "Contrat"}
            content={generatedContent}
          />
          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep("variables")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Modifier
            </Button>
            <Button
              onClick={handleGenerate}
              loading={generateContract.isPending}
              icon={<FileSignature className="h-4 w-4" />}
            >
              Generer le contrat
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
