import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { addMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function FinanceProjections() {
  // Fetch recurring entries
  const { data: recurringEntries = [] } = useQuery({
    queryKey: ['finance-recurring'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_entries')
        .select('*')
        .eq('type', 'récurrent')
        .order('date', { ascending: false })

      if (error) throw error
      return data
    },
  })

  const mrr = useMemo(() => {
    return recurringEntries.reduce((sum, e) => sum + Number(e.amount), 0)
  }, [recurringEntries])

  // Build projection data for next 12 months
  const projectionData = useMemo(() => {
    const now = new Date()
    const data = []

    for (let i = 0; i < 12; i++) {
      const month = addMonths(now, i)
      const monthLabel = format(month, 'MMM yy', { locale: fr })
      data.push({
        month: monthLabel,
        projected: mrr * (i + 1),
        monthly: mrr,
      })
    }

    return data
  }, [mrr])

  const arr = mrr * 12

  return (
    <div className="space-y-6">
      {/* MRR KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/40 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">MRR</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(mrr)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ARR projeté</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(arr)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entrées récurrentes</p>
              <p className="text-xl font-bold text-foreground">{recurringEntries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="rounded-2xl border border-border/40 bg-white p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Projection de revenus récurrents</h3>
        <p className="text-xs text-muted-foreground mb-4">Revenus cumulés projetés sur 12 mois</p>

        {mrr > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(252 85% 60%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(252 85% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220 9% 46%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 9% 46%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value), 'Cumulé']}
                  contentStyle={{ borderRadius: 12, border: '1px solid hsl(220 13% 91%)', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="hsl(252 85% 60%)"
                  strokeWidth={2}
                  fill="url(#projGrad)"
                  strokeDasharray="6 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Ajoutez des entrées récurrentes pour voir les projections
          </div>
        )}
      </div>
    </div>
  )
}
