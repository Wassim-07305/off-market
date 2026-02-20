"use client";

import { create } from "zustand";

interface MessagingState {
  activeChannelId: string | null;
  setActiveChannelId: (id: string | null) => void;

  threadMessageId: string | null;
  setThreadMessageId: (id: string | null) => void;

  replyToMessageId: string | null;
  setReplyToMessageId: (id: string | null) => void;

  typingUsers: Record<string, string[]>;
  setTypingUsers: (channelId: string, users: string[]) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useMessagingStore = create<MessagingState>((set) => ({
  activeChannelId: null,
  setActiveChannelId: (id) => set({ activeChannelId: id }),

  threadMessageId: null,
  setThreadMessageId: (id) => set({ threadMessageId: id }),

  replyToMessageId: null,
  setReplyToMessageId: (id) => set({ replyToMessageId: id }),

  typingUsers: {},
  setTypingUsers: (channelId, users) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [channelId]: users },
    })),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
