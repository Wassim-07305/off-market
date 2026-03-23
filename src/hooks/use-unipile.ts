"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────

export interface UnipileAccount {
  id: string;
  name: string;
  type: string; // "LINKEDIN", "WHATSAPP", "INSTAGRAM", etc.
  status: string;
  created_at: string;
}

export interface UnipileChat {
  id: string;
  account_id: string;
  name: string;
  timestamp: string;
  last_message_text?: string;
  unread_count?: number;
  attendees_count?: number;
  _attendee_id?: string | null;
  provider?: string;
}

export interface UnipileMessage {
  id: string;
  text: string;
  timestamp: string;
  sender_id: string;
  is_sender: boolean;
  sender?: {
    display_name?: string;
    profile_picture?: string;
  };
}

export interface UnipileAttendee {
  id: string;
  display_name: string;
  profile_picture?: string;
  occupation?: string;
  provider_id?: string;
  is_self?: boolean;
}

// ── Fetchers ──────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(body.error ?? `Erreur ${res.status}`);
  }
  return res.json();
}

// ── Hooks ─────────────────────────────────────────────

export function useUnipileAccounts() {
  return useQuery({
    queryKey: ["unipile", "accounts"],
    queryFn: () =>
      fetchJSON<{ items: UnipileAccount[] }>("/api/unipile/accounts").then(
        (r) => r.items ?? [],
      ),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useUnipileChats(accountId: string | null) {
  return useQuery({
    queryKey: ["unipile", "chats", accountId],
    queryFn: () =>
      fetchJSON<{ items: UnipileChat[] }>(
        `/api/unipile/chats?account_id=${accountId}&limit=30`,
      ).then((r) => r.items ?? []),
    enabled: !!accountId,
    staleTime: 30 * 1000, // 30s
  });
}

export function useUnipileMessages(chatId: string | null) {
  return useQuery({
    queryKey: ["unipile", "messages", chatId],
    queryFn: () =>
      fetchJSON<{ items: UnipileMessage[] }>(
        `/api/unipile/chats/${chatId}/messages?limit=50`,
      ).then((r) => r.items ?? []),
    enabled: !!chatId,
    staleTime: 15 * 1000, // 15s
    refetchInterval: 15 * 1000, // auto-refresh every 15s
  });
}

export function useUnipileAttendees(chatId: string | null) {
  return useQuery({
    queryKey: ["unipile", "attendees", chatId],
    queryFn: () =>
      fetchJSON<{ items: UnipileAttendee[] }>(
        `/api/unipile/chats/${chatId}/attendees`,
      ).then((r) => r.items ?? []),
    enabled: !!chatId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSendUnipileMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, text }: { chatId: string; text: string }) => {
      const res = await fetch(`/api/unipile/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({ error: "Erreur inconnue" }));
        throw new Error(body.error ?? `Erreur ${res.status}`);
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["unipile", "messages", variables.chatId],
      });
      toast.success("Message envoye");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'envoi");
    },
  });
}
