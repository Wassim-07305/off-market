"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
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
    retry: false,
    staleTime: 30_000,
    queryFn: async () => {
      let query = supabase
        .from("contracts")
        .select("*, client:profiles(id, full_name, email, avatar_url)")
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
        .insert(contract as never)
        .select()
        .single();
      if (error) throw error;
      return data as Contract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
    onError: () => {
      toast.error("Erreur lors de la création du contrat");
    },
  });

  const updateContract = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Contract> & { id: string }) => {
      const { error } = await supabase
        .from("contracts")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du contrat");
    },
  });

  const sendContract = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contracts")
        .update({ status: "sent", sent_at: new Date().toISOString() } as never)
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contrat envoye");
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi du contrat");
    },
  });

  const signContract = useMutation({
    mutationFn: async ({
      id,
      signatureData,
      signatureImage,
    }: {
      id: string;
      signatureData: {
        ip_address: string;
        user_agent: string;
        signer_name?: string;
      };
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
        } as never)
        .eq("id", id);
      if (error) throw error;

      // Notify admin that contract was signed → they need to create an invoice
      try {
        await fetch("/api/contracts/on-signed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contractId: id }),
        });
      } catch {
        console.warn("[signContract] Admin notification skipped");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
    onError: () => {
      toast.error("Erreur lors de la signature du contrat");
    },
  });

  const cancelContract = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { error } = await supabase
        .from("contracts")
        .update({
          status: "cancelled",
          cancellation_reason: reason ?? null,
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation du contrat");
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
        .insert(template as never)
        .select()
        .single();
      if (error) throw error;
      return data as ContractTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-templates"] });
    },
    onError: () => {
      toast.error("Erreur lors de la création du modèle");
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ContractTemplate> & { id: string }) => {
      const { error } = await supabase
        .from("contract_templates")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-templates"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du modèle");
    },
  });

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    createTemplate,
    updateTemplate,
  };
}

// ─── Contract Renewal ───────────────────────────────
export function useContractRenewal() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get contracts expiring soon (within N days)
  const expiringQuery = useQuery({
    queryKey: ["contracts-expiring"],
    enabled: !!user,
    queryFn: async () => {
      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);

      const { data, error } = await supabase
        .from("contracts")
        .select(
          "*, client:profiles!contracts_client_id_fkey(id, full_name, email, avatar_url)",
        )
        .in("status", ["signed", "active"])
        .gte("end_date", now.toISOString().split("T")[0])
        .lte("end_date", in30Days.toISOString().split("T")[0])
        .order("end_date", { ascending: true });
      if (error) {
        console.warn("Expiring contracts query:", error.message);
        return [] as Contract[];
      }
      return (data ?? []) as Contract[];
    },
  });

  // Renew a contract: creates a new one based on the existing template
  const renewContract = useMutation({
    mutationFn: async ({
      contractId,
      durationMonths = 3,
      newAmount,
    }: {
      contractId: string;
      durationMonths?: number;
      newAmount?: number;
    }) => {
      // Fetch original contract
      const { data: original, error: fetchError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();
      if (fetchError) throw fetchError;

      const orig = original as Contract;
      const newStartDate =
        orig.end_date ?? new Date().toISOString().split("T")[0];
      const endDate = new Date(newStartDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      // Create renewed contract
      const { data: renewed, error: createError } = await supabase
        .from("contracts")
        .insert({
          template_id: orig.template_id,
          client_id: orig.client_id,
          title: `${orig.title} (Renouvellement)`,
          content: orig.content,
          created_by: user!.id,
          status: "draft" as ContractStatus,
          amount: newAmount ?? orig.amount,
          start_date: newStartDate,
          end_date: endDate.toISOString().split("T")[0],
          renewal_of: contractId,
        } as never)
        .select()
        .single();
      if (createError) throw createError;

      const renewedContract = renewed as unknown as Contract;

      // Mark original as renewed
      await supabase
        .from("contracts")
        .update({
          status: "renewed" as ContractStatus,
          renewed_to: renewedContract.id,
        } as never)
        .eq("id", contractId);

      return renewedContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contracts-expiring"] });
      toast.success("Contrat renouvele avec succes");
    },
    onError: () => {
      toast.error("Erreur lors du renouvellement du contrat");
    },
  });

  return {
    expiringContracts: expiringQuery.data ?? [],
    isLoading: expiringQuery.isLoading,
    renewContract,
  };
}
