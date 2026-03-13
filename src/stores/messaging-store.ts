"use client";

import { create } from "zustand";

interface MessagingState {
  activeChannelId: string | null;
  setActiveChannelId: (id: string | null) => void;

  threadMessageId: string | null;
  setThreadMessageId: (id: string | null) => void;

  replyToMessageId: string | null;
  replyToMessage: { id: string; content: string; senderName: string } | null;
  setReplyTo: (
    msg: { id: string; content: string; senderName: string } | null,
  ) => void;

  editingMessageId: string | null;
  setEditingMessageId: (id: string | null) => void;

  typingUsers: Record<string, string[]>;
  setTypingUsers: (channelId: string, users: string[]) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  showMembersPanel: boolean;
  setShowMembersPanel: (show: boolean) => void;

  showSearchPanel: boolean;
  setShowSearchPanel: (show: boolean) => void;

  showEmojiPickerForMessage: string | null;
  setShowEmojiPickerForMessage: (id: string | null) => void;

  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // Bookmarks
  bookmarkedMessageIds: Set<string>;
  toggleBookmark: (messageId: string) => void;
  isBookmarked: (messageId: string) => boolean;

  showBookmarksPanel: boolean;
  setShowBookmarksPanel: (show: boolean) => void;
}

function loadBookmarks(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem("off-market-bookmarks");
    if (stored) return new Set(JSON.parse(stored) as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

function saveBookmarks(ids: Set<string>) {
  try {
    localStorage.setItem(
      "off-market-bookmarks",
      JSON.stringify(Array.from(ids)),
    );
  } catch {
    // ignore
  }
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  activeChannelId: null,
  setActiveChannelId: (id) => set({ activeChannelId: id }),

  threadMessageId: null,
  setThreadMessageId: (id) => set({ threadMessageId: id }),

  replyToMessageId: null,
  replyToMessage: null,
  setReplyTo: (msg) =>
    set({ replyToMessageId: msg?.id ?? null, replyToMessage: msg }),

  editingMessageId: null,
  setEditingMessageId: (id) => set({ editingMessageId: id }),

  typingUsers: {},
  setTypingUsers: (channelId, users) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [channelId]: users },
    })),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  showMembersPanel: false,
  setShowMembersPanel: (show) => set({ showMembersPanel: show }),

  showSearchPanel: false,
  setShowSearchPanel: (show) => set({ showSearchPanel: show }),

  showEmojiPickerForMessage: null,
  setShowEmojiPickerForMessage: (id) => set({ showEmojiPickerForMessage: id }),

  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  bookmarkedMessageIds: loadBookmarks(),
  toggleBookmark: (messageId) =>
    set((state) => {
      const next = new Set(state.bookmarkedMessageIds);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      saveBookmarks(next);
      return { bookmarkedMessageIds: next };
    }),
  isBookmarked: (messageId) => get().bookmarkedMessageIds.has(messageId),

  showBookmarksPanel: false,
  setShowBookmarksPanel: (show) => set({ showBookmarksPanel: show }),
}));
