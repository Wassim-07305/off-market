"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { toast } from "sonner";

export interface BrandingSettings {
  id: string;
  app_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  primary_color_dark: string;
  accent_color: string;
  accent_color_dark: string;
  font_family: string;
  border_radius: string;
  tagline: string | null;
  auth_background_url: string | null;
  landing_enabled: boolean;
  updated_at: string;
  updated_by: string | null;
}

const DEFAULTS: Omit<BrandingSettings, "id" | "updated_at" | "updated_by"> = {
  app_name: "Off Market",
  logo_url: null,
  favicon_url: null,
  primary_color: "#c41e3a",
  primary_color_dark: "#e8374e",
  accent_color: "#f97316",
  accent_color_dark: "#fb923c",
  font_family: "Inter",
  border_radius: "12",
  tagline: null,
  auth_background_url: null,
  landing_enabled: false,
};

export function useBranding() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["branding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branding_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (
        (data as BrandingSettings | null) ??
        ({
          ...DEFAULTS,
          id: "",
          updated_at: "",
          updated_by: null,
        } as BrandingSettings)
      );
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });
}

export function useUpdateBranding() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<BrandingSettings>) => {
      const { data: existing } = (await supabase
        .from("branding_settings")
        .select("id")
        .limit(1)
        .single()) as { data: { id: string } | null; error: unknown };

      if (!existing) throw new Error("Branding settings not found");

      const { error } = await supabase
        .from("branding_settings")
        .update(updates as never)
        .eq("id", existing.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      toast.success("Branding mis a jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour du branding");
    },
  });
}

export function useUploadBrandingAsset() {
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async ({ file, path }: { file: File; path: string }) => {
      const { error } = await supabase.storage
        .from("branding")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("branding")
        .getPublicUrl(path);

      return urlData.publicUrl;
    },
  });
}

/** Helper: generate lighter/darker variants from a hex color */
export function colorVariants(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return {
    base: hex,
    hover: `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`,
    light: `rgba(${r}, ${g}, ${b}, 0.06)`,
    soft: `rgba(${r}, ${g}, ${b}, 0.12)`,
    glow: `0 0 20px rgba(${r}, ${g}, ${b}, 0.15)`,
    selection: `rgba(${r}, ${g}, ${b}, 0.15)`,
  };
}
