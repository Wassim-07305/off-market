import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile, Lead } from '@/types/database'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export interface EleveWithStats extends Profile {
  leads_count: number
  ca_total: number
  last_activity_at: string | null
}

interface EleveFilters {
  search?: string
  page?: number
}

export function useEleves(filters: EleveFilters = {}) {
  const { search, page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['eleves', filters],
    queryFn: async () => {
      // Get user_ids with role = 'eleve'
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'eleve')

      if (roleError) throw roleError
      const eleveIds = roleData.map((r) => r.user_id)

      if (eleveIds.length === 0) return { data: [] as EleveWithStats[], count: 0 }

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .in('id', eleveIds)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data: profiles, error, count } = await query
      if (error) throw error

      // Enrich with stats
      const enriched: EleveWithStats[] = await Promise.all(
        (profiles ?? []).map(async (profile) => {
          const { data: leadsRaw } = await supabase
            .from('leads')
            .select('*')
            .eq('assigned_to', profile.id)
          const leads = (leadsRaw ?? []) as Lead[]

          return {
            ...profile,
            leads_count: leads.length,
            ca_total: leads.reduce((sum, l) => sum + Number(l.ca_contracté), 0),
            last_activity_at: profile.last_seen_at,
          } as EleveWithStats
        })
      )

      return { data: enriched, count: count ?? 0 }
    },
  })
}

export function useEleve(id: string | undefined) {
  return useQuery({
    queryKey: ['eleves', id],
    queryFn: async () => {
      if (!id) throw new Error('ID requis')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Profile
    },
    enabled: !!id,
  })
}
