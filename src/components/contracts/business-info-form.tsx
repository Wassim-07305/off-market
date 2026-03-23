"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useClientBusinessInfo,
  useSaveBusinessInfo,
} from "@/hooks/use-contract-generator";

const businessInfoSchema = z.object({
  siret: z
    .string()
    .min(1, "Le SIRET est requis")
    .regex(/^\d{14}$/, "Le SIRET doit contenir 14 chiffres"),
  company_name: z.string().min(1, "La raison sociale est requise"),
  company_address: z.string().min(1, "L'adresse est requise"),
  legal_form: z.string().min(1, "La forme juridique est requise"),
});

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

const LEGAL_FORMS = [
  "Auto-entrepreneur",
  "EURL",
  "SARL",
  "SAS",
  "SASU",
  "SA",
  "SCI",
  "Autre",
];

interface BusinessInfoFormProps {
  clientId: string;
  onSaved?: (data: BusinessInfoFormData) => void;
  compact?: boolean;
}

export function BusinessInfoForm({
  clientId,
  onSaved,
  compact = false,
}: BusinessInfoFormProps) {
  const { data: businessInfo, isLoading } = useClientBusinessInfo(clientId);
  const saveInfo = useSaveBusinessInfo();

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      siret: "",
      company_name: "",
      company_address: "",
      legal_form: "",
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (businessInfo) {
      form.reset({
        siret: businessInfo.siret ?? "",
        company_name: businessInfo.company_name ?? "",
        company_address: businessInfo.company_address ?? "",
        legal_form: businessInfo.legal_form ?? "",
      });
    }
  }, [businessInfo, form]);

  async function onSubmit(data: BusinessInfoFormData) {
    await saveInfo.mutateAsync({ clientId, ...data });
    onSaved?.(data);
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-48" />
      </Card>
    );
  }

  const Wrapper = compact ? "div" : Card;
  const ContentWrapper = compact ? "div" : CardContent;

  return (
    <Wrapper>
      {!compact && (
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Informations entreprise
          </CardTitle>
        </CardHeader>
      )}
      <ContentWrapper>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">SIRET</label>
              <Input
                {...form.register("siret")}
                placeholder="12345678901234"
                maxLength={14}
              />
              {form.formState.errors.siret && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.siret.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Raison sociale</label>
              <Input
                {...form.register("company_name")}
                placeholder="Nom de l'entreprise"
              />
              {form.formState.errors.company_name && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.company_name.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Adresse du siege</label>
            <Input
              {...form.register("company_address")}
              placeholder="123 rue de la Paix, 75001 Paris"
            />
            {form.formState.errors.company_address && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.company_address.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Forme juridique</label>
            <select
              {...form.register("legal_form")}
              className="w-full mt-1 rounded-xl border border-border px-3 py-2 text-sm bg-surface"
            >
              <option value="">Sélectionnez...</option>
              {LEGAL_FORMS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            {form.formState.errors.legal_form && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.legal_form.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={saveInfo.isPending}
              icon={<Save className="h-4 w-4" />}
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </ContentWrapper>
    </Wrapper>
  );
}
