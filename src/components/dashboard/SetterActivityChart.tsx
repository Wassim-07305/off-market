import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useSetterActivityChart } from '@/hooks/useDashboardStats'
import { MessageSquare } from 'lucide-react'

function formatDay(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export function SetterActivityChart() {
  const { data, isLoading } = useSetterActivityChart()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité setter (14 derniers jours)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6" />}
            title="Aucune donnée"
            description="Pas encore d'activité setter enregistrée."
          />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(252 85% 60%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(252 85% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                tick={{ fill: 'hsl(220 9% 46%)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(220 13% 91%)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'hsl(220 9% 46%)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                labelFormatter={(dateStr: any) => formatDay(dateStr)}
                formatter={(value: any) => [value, 'Messages']}
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(220 13% 91%)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              />
              <Area
                type="monotone"
                dataKey="messages"
                stroke="hsl(252 85% 60%)"
                strokeWidth={2}
                fill="url(#colorMessages)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
