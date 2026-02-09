import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useLeadsChart } from '@/hooks/useDashboardStats'
import { Users } from 'lucide-react'

function formatWeek(weekStr: string): string {
  const date = new Date(weekStr)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export function LeadsChart() {
  const { data, isLoading } = useLeadsChart()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads par semaine</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Aucune donnée"
            description="Pas encore de leads enregistres."
          />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis
                dataKey="week"
                tickFormatter={formatWeek}
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
                labelFormatter={(weekStr: any) => formatWeek(weekStr)}
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(220 13% 91%)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={(value: string) => (
                  <span style={{ color: 'hsl(222 47% 11%)', fontSize: '0.875rem' }}>
                    {value}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="hsl(252 85% 60%)"
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(252 85% 60%)' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="booké"
                name="Bookes"
                stroke="hsl(142 76% 36%)"
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(142 76% 36%)' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
