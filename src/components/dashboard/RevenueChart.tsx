import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useRevenueChart } from '@/hooks/useDashboardStats'
import { formatCurrency } from '@/lib/utils'
import { BarChart3 } from 'lucide-react'

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}

export function RevenueChart() {
  const { data, isLoading } = useRevenueChart()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chiffre d'affaires mensuel</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="h-6 w-6" />}
            title="Aucune donnée"
            description="Pas encore de chiffre d'affaires enregistre."
          />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tick={{ fill: 'hsl(220 9% 46%)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(220 13% 91%)' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fill: 'hsl(220 9% 46%)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(value), 'CA']}
                labelFormatter={(monthStr: any) => formatMonth(monthStr)}
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(220 13% 91%)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(252 85% 60%)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
