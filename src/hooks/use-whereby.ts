"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { toast } from "sonner";

interface CreateRoomResponse {
  roomUrl: string;
  hostRoomUrl: string;
  meetingId: string;
}

export function useCreateWherebyRoom() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      callId,
      callTitle,
      endDate,
    }: {
      callId: string;
      callTitle?: string;
      endDate?: string;
    }): Promise<CreateRoomResponse> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Non authentifie");
      }

      const res = await fetch("/api/whereby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ callId, callTitle, endDate }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la creation de la room");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      queryClient.invalidateQueries({ queryKey: ["call"] });
    },
    onError: (err) => {
      toast.error(err.message || "Impossible de creer la room video");
    },
  });
}
