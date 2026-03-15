"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type {
  Contract,
  ContractTemplate,
  ContractStatus,
} from "@/types/billing";

interface UseContractsOptions {
  status?: ContractStatus;
  clientId?: string;
  limit?: number;
}

export function useContracts(options: UseContractsOptions = {}) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { status, clientId, limit = 50 } = options;

  const contractsQuery = useQuery({
    queryKey: ["contracts", status, clientId, limit],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("contracts")
        .select(
          "*, client:profiles!contracts_client_id_fkey(id, full_name, email, avatar_url)",
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) query = query.eq("status", status);
      if (clientId) query = query.eq("client_id", clientId);

      const { data, error } = await query;
      if (error) throw error;
      return data as Contract[];
    },
  });

  const createContract = useMutation({
    mutationFn: async (contract: {
      template_id?: string;
      client_id: string;
      title: string;
      content: string;
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from("contracts")
        .insert(contract)
        .select()
        .single();
      if (error) throw error;
      return data as Contract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });

  const updateContract = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Contract> & { id: string }) => {
      const { error } = await supabase
        .from("contracts")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });

  const sendContract = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contracts")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });

  const signContract = useMutation({
    mutationFn: async ({
      id,
      signatureData,
      signatureImage,
    }: {
      id: string;
      signatureData: { ip_address: string; user_agent: string };
      signatureImage?: string;
    }) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("contracts")
        .update({
          status: "signed",
          signed_at: now,
          signature_data: { signed_at: now, ...signatureData },
          ...(signatureImage ? { signature_image: signatureImage } : {}),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });

  const cancelContract = useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("contracts")
        .update({
          status: "cancelled",
          cancellation_reason: reason ?? null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });

  return {
    contracts: contractsQuery.data ?? [],
    isLoading: contractsQuery.isLoading,
    error: contractsQuery.error,
    createContract,
    updateContract,
    sendContract,
    signContract,
    cancelContract,
  };
}

export function useContract(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["contract", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(
          "*, client:profiles!contracts_client_id_fkey(id, full_name, email, avatar_url)",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Contract;
    },
    enabled: !!id,
  });
}

export function useContractTemplates() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const templatesQuery = useQuery({
    queryKey: ["contract-templates"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContractTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: {
      title: string;
      content: string;
      variables: ContractTemplate["variables"];
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from("contract_templates")
        .insert(template)
        .select()
        .single();
      if (error) throw error;
      return data as ContractTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-templates"] });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ContractTemplate> & { id: string }) => {
      const { error } = await supabase
        .from("contract_templates")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-templates"] });
    },
  });

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    createTemplate,
    updateTemplate,
  };
}
