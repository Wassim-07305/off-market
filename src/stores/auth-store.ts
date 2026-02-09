import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { AppRole, Profile } from '@/types/database'

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: AppRole | null
  loading: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setRole: (role: AppRole | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
}

export const useAuthStore = create<AuthState>()((set) => ({
  ...initialState,
  setSession: (session) =>
    set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
  reset: () => set(initialState),
}))
