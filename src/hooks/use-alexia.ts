import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// ─── Coach Documents ──────────────────────────────────────────────────────────

export function useCoachDocuments() {
  return useQuery({
    queryKey: ["coach-ai-documents"],
    queryFn: async () => {
      const res = await fetch("/api/ai/documents");
      if (!res.ok) throw new Error("Erreur chargement documents");
      const { documents } = await res.json();
      return documents as Array<{
        id: string;
        file_name: string;
        file_type: string;
        file_size: number;
        chunk_count: number;
        status: "processing" | "ready" | "error";
        error_message: string | null;
        created_at: string;
      }>;
    },
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ai/documents", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur upload");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-ai-documents"] });
      toast.success("Document uploade et indexe");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ai/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-ai-documents"] });
      toast.success("Document supprime");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

// ─── AI Config ────────────────────────────────────────────────────────────────

export interface AIConfig {
  ai_name: string;
  system_instructions: string;
  tone: string;
  greeting_message: string;
}

export function useCoachAIConfig() {
  return useQuery({
    queryKey: ["coach-ai-config"],
    queryFn: async () => {
      const res = await fetch("/api/ai/alexia/config");
      if (!res.ok) throw new Error("Erreur chargement config");
      const { config } = await res.json();
      return config as AIConfig;
    },
  });
}

export function useUpdateAIConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: Partial<AIConfig>) => {
      const res = await fetch("/api/ai/alexia/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Erreur sauvegarde");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-ai-config"] });
      toast.success("Configuration sauvegardee");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
}

// ─── Client Memories ──────────────────────────────────────────────────────────

export function useClientMemories() {
  const supabase = useSupabase();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["client-ai-memories", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_ai_memory")
        .select("*, client:profiles!client_ai_memory_client_id_fkey(id, full_name, avatar_url)")
        .eq("coach_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Array<{
        id: string;
        client_id: string;
        summary: string;
        key_facts: unknown[];
        last_topics: unknown[];
        conversation_count: number;
        updated_at: string;
        client: { id: string; full_name: string; avatar_url: string | null } | null;
      }>;
    },
  });
}

// ─── AlexIA Chat (RAG-powered) ───────────────────────────────────────────────

export function useSendAlexiaMessage() {
  return useMutation({
    mutationFn: async ({
      message,
      conversation_id,
    }: {
      message: string;
      conversation_id: string | null;
    }) => {
      const res = await fetch("/api/ai/alexia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversation_id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur AlexIA");
      }
      const { response } = await res.json();
      return response as string;
    },
  });
}
