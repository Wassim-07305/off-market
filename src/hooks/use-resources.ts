"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { Resource } from "@/types/database";

export function useResources(category?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["resources", category],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("resources")
        .select("*, uploader:profiles!uploaded_by(id, full_name, avatar_url)")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Resource[];
    },
  });
}

export function useUploadResource() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      category,
      visibility,
    }: {
      file: File;
      title: string;
      description?: string;
      category: string;
      visibility: "all" | "staff" | "clients";
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const ext = file.name.split(".").pop() ?? "bin";
      const timestamp = Date.now();
      const storagePath = `${category}/${timestamp}-${file.name}`;

      const { error: uploadErr } = await supabase.storage
        .from("resources")
        .upload(storagePath, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("resources")
        .getPublicUrl(storagePath);

      // Create resource record
      const { data, error } = await supabase
        .from("resources")
        .insert({
          title,
          description: description || null,
          category,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.id,
          visibility,
        })
        .select("*, uploader:profiles!uploaded_by(id, full_name, avatar_url)")
        .single();
      if (error) throw error;
      return data as Resource;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast.success("Ressource ajoutee");
    },
    onError: () => toast.error("Erreur lors de l'upload"),
  });
}

export function useUpdateResource() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Pick<Resource, "title" | "description" | "category" | "visibility" | "is_pinned">> & {
      id: string;
    }) => {
      const { data, error } = await supabase
        .from("resources")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });
}

export function useDeleteResource() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: Pick<Resource, "id" | "file_url">) => {
      // Extract storage path from URL
      const url = new URL(resource.file_url);
      const pathMatch = url.pathname.match(/\/resources\/(.+)$/);
      if (pathMatch) {
        await supabase.storage.from("resources").remove([decodeURIComponent(pathMatch[1])]);
      }

      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", resource.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast.success("Ressource supprimee");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useTrackDownload() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.rpc("increment_download_count", { resource_id: id }).throwOnError();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}
