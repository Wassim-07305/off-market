"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { ContractTemplate } from "@/types/billing";

export interface ClientBusinessInfo {
  siret: string;
  company_name: string;
  company_address: string;
  legal_form: string;
}

// ─── Fetch client business info ──────────
export function useClientBusinessInfo(clientId: string | undefined) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["client-business-info", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select(
          "siret, company_name, company_address, legal_form, full_name, email",
        )
        .eq("id", clientId!)
        .single();
      if (error) throw error;
      return data as ClientBusinessInfo & {
        full_name: string;
        email: string;
      };
    },
  });
}

// ─── Save client business info ───────────
export function useSaveBusinessInfo() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      ...info
    }: ClientBusinessInfo & { clientId: string }) => {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          siret: info.siret,
          company_name: info.company_name,
          company_address: info.company_address,
          legal_form: info.legal_form,
        })
        .eq("id", clientId);
      if (error) throw error;
    },
    onSuccess: (
      _data: unknown,
      variables: ClientBusinessInfo & { clientId: string },
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["client-business-info", variables.clientId],
      });
      toast.success("Informations entreprise enregistrees");
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde");
    },
  });
}

// ─── Generate contract from template + data ────
export function useGenerateContract() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      templateId,
      clientId,
      variables,
    }: {
      templateId: string;
      clientId: string;
      variables: Record<string, string>;
    }) => {
      // Fetch the template
      const { data: template, error: tplError } = await (supabase as any)
        .from("contract_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      if (tplError) throw tplError;

      const tpl = template as ContractTemplate;

      // Replace all {{variable}} placeholders
      let content = tpl.content;
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
      }

      // Create the contract
      const { data: contract, error: contractError } = await (supabase as any)
        .from("contracts")
        .insert({
          template_id: templateId,
          client_id: clientId,
          title: tpl.title,
          content,
          created_by: user?.id,
          status: "draft",
        })
        .select()
        .single();
      if (contractError) throw contractError;

      return contract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contrat généré avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la generation du contrat");
    },
  });
}
