import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type {
  XpTransaction,
  GamificationBadge,
  UserBadge,
  LevelConfig,
  Challenge,
  ChallengeParticipant,
} from '@/types/database'

// --- Helpers ---

async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Utilisateur non connecté')
  return user.id
}

// --- XP ---

export function useMyXp() {
  return useQuery({
    queryKey: ['gamification', 'my-xp'],
    queryFn: async () => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('xp_transactions')
        .select('xp_amount')
        .eq('profile_id', userId)

      if (error) throw error
      const total = (data as XpTransaction[]).reduce((sum, t) => sum + t.xp_amount, 0)
      return total
    },
  })
}

export function useXpHistory(page = 1, perPage = 20) {
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  return useQuery({
    queryKey: ['gamification', 'xp-history', page],
    queryFn: async () => {
      const userId = await getCurrentUserId()
      const { data, error, count } = await supabase
        .from('xp_transactions')
        .select('*', { count: 'exact' })
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      return { data: data as XpTransaction[], count: count ?? 0 }
    },
  })
}

// --- Levels ---

export function useLevels() {
  return useQuery({
    queryKey: ['gamification', 'levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('level_config')
        .select('*')
        .order('level', { ascending: true })

      if (error) throw error
      return data as LevelConfig[]
    },
    staleTime: 1000 * 60 * 60, // 1h — rarement modifie
  })
}

// --- Badges ---

export function useBadges() {
  return useQuery({
    queryKey: ['gamification', 'badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })

      if (error) throw error
      return data as GamificationBadge[]
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useMyBadges() {
  return useQuery({
    queryKey: ['gamification', 'my-badges'],
    queryFn: async () => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('profile_id', userId)
        .order('earned_at', { ascending: false })

      if (error) throw error
      return data as UserBadge[]
    },
  })
}

// --- Challenges ---

export function useChallenges() {
  return useQuery({
    queryKey: ['gamification', 'challenges'],
    queryFn: async () => {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Challenge[]
    },
  })
}

export function useMyChallengeParticipations() {
  return useQuery({
    queryKey: ['gamification', 'my-participations'],
    queryFn: async () => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('profile_id', userId)

      if (error) throw error
      return data as ChallengeParticipant[]
    },
  })
}

export function useJoinChallenge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (challengeId: string) => {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({ challenge_id: challengeId, profile_id: userId, progress: 0, completed: false })
        .select()
        .single()

      if (error) throw error
      return data as ChallengeParticipant
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'my-participations'] })
      queryClient.invalidateQueries({ queryKey: ['gamification', 'challenges'] })
      toast.success('Vous avez rejoint le defi !')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
