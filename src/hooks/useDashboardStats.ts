import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { DashboardStats } from '@/types/database'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats')
      if (error) throw error
      return data as DashboardStats
    },
    refetchInterval: 60000, // refresh every minute
  })
}

export function useRevenueChart() {
  return useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'close')
        .gte('updated_at', sixMonthsAgo.toISOString())
        .order('updated_at', { ascending: true })

      if (error) throw error

      // Group by month using leads ca_contracté
      const monthlyData: Record<string, number> = {}
      for (const lead of data) {
        const month = lead.updated_at.substring(0, 7) // YYYY-MM
        monthlyData[month] = (monthlyData[month] ?? 0) + Number((lead as Record<string, unknown>)['ca_contracté'] ?? 0)
      }

      return Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue,
      }))
    },
  })
}

export function useLeadsChart() {
  return useQuery({
    queryKey: ['leads-chart'],
    queryFn: async () => {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

      const { data, error } = await supabase
        .from('leads')
        .select('created_at, status')
        .gte('created_at', threeMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by week
      const weeklyData: Record<string, { total: number; close: number }> = {}
      for (const lead of data) {
        const date = new Date(lead.created_at)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay() + 1)
        const weekKey = weekStart.toISOString().split('T')[0]

        if (!weeklyData[weekKey]) weeklyData[weekKey] = { total: 0, close: 0 }
        weeklyData[weekKey].total++
        if (lead.status === 'close') weeklyData[weekKey].close++
      }

      return Object.entries(weeklyData).map(([week, data]) => ({
        week,
        ...data,
      }))
    },
  })
}

export function useSetterActivityChart() {
  return useQuery({
    queryKey: ['setter-activity-chart'],
    queryFn: async () => {
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const { data, error } = await supabase
        .from('setter_activities')
        .select('date, messages_sent')
        .gte('date', twoWeeksAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error

      // Group by date
      const dailyData: Record<string, number> = {}
      for (const activity of data) {
        dailyData[activity.date] = (dailyData[activity.date] ?? 0) + activity.messages_sent
      }

      return Object.entries(dailyData).map(([date, messages]) => ({
        date,
        messages,
      }))
    },
  })
}
