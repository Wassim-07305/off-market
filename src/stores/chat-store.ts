import { create } from 'zustand'

interface ChatState {
  activeChannelId: string | null
  setActiveChannel: (channelId: string | null) => void
  mobileShowChat: boolean
  setMobileShowChat: (show: boolean) => void
}

export const useChatStore = create<ChatState>()((set) => ({
  activeChannelId: null,
  setActiveChannel: (channelId) => set({ activeChannelId: channelId, mobileShowChat: !!channelId }),
  mobileShowChat: false,
  setMobileShowChat: (show) => set({ mobileShowChat: show }),
}))
