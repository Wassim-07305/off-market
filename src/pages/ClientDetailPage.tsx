import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  LayoutDashboard,
  Target,
  CalendarDays,
  MessageSquare,
  Wallet,
} from 'lucide-react'
import { useEleve } from '@/hooks/useEleves'
import { ClientLeads } from '@/components/clients/ClientLeads'
import { ClientCalendar } from '@/components/clients/ClientCalendar'
import { ClientFinances } from '@/components/clients/ClientFinances'
import { ClientSetterActivity } from '@/components/clients/ClientSetterActivity'
import { Button } from '@/components/ui/button'
import { TabsList, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials, formatCurrency } from '@/lib/utils'
import type { TabItem } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/types/database'

const TABS: TabItem[] = [
  { value: 'overview', label: <span className="inline-flex items-center gap-1.5"><LayoutDashboard className="hidden h-4 w-4 sm:block" />{"Vue d'ensemble"}</span> },
  { value: 'pipeline', label: <span className="inline-flex items-center gap-1.5"><Target className="hidden h-4 w-4 sm:block" />Pipeline</span> },
  { value: 'calendar', label: <span className="inline-flex items-center gap-1.5"><CalendarDays className="hidden h-4 w-4 sm:block" />Calendrier</span> },
  { value: 'activite', label: <span className="inline-flex items-center gap-1.5"><MessageSquare className="hidden h-4 w-4 sm:block" />Activité</span> },
  { value: 'finances', label: <span className="inline-flex items-center gap-1.5"><Wallet className="hidden h-4 w-4 sm:block" />Finances</span> },
]

function useEleveStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['eleve-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('ID requis')

      const { data: leadsRaw } = await supabase
        .from('leads')
        .select('*')
        .eq('assigned_to', userId)
      const leads = (leadsRaw ?? []) as Lead[]

      const { data: activities } = await supabase
        .from('setter_activities')
        .select('messages_sent')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])

      const totalLeads = leads.length
      const caContracte = leads.reduce((s, l) => s + Number(l.ca_contracté), 0)
      const caCollecte = leads.reduce((s, l) => s + Number(l.ca_collecté), 0)
      const totalMessages = activities?.reduce((s, a) => s + a.messages_sent, 0) ?? 0

      return { totalLeads, caContracte, caCollecte, totalMessages }
    },
    enabled: !!userId,
  })
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: eleve, isLoading } = useEleve(id)
  const { data: stats } = useEleveStats(id)

  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!eleve) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/eleves')}
        >
          Retour
        </Button>
        <p className="text-muted-foreground">Élève introuvable.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/eleves')}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-400/10 text-xs font-semibold text-red-300 ring-2 ring-red-500/10">
            {eleve.avatar_url ? (
              <img src={eleve.avatar_url} alt={eleve.full_name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              getInitials(eleve.full_name)
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{eleve.full_name}</h1>
            <p className="text-sm text-muted-foreground">{eleve.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto">
        <TabsList
          tabs={TABS}
          value={activeTab}
          onChange={setActiveTab}
          className="w-max min-w-full"
        />
      </div>

      {/* Tab Content */}
      <TabsContent value="overview" activeValue={activeTab}>
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Leads</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats?.totalLeads ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">CA Contracté</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.caContracte ?? 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">CA Collecté</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.caCollecte ?? 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Messages (30j)</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats?.totalMessages ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1 text-sm text-foreground">{eleve.email}</dd>
                </div>
                {eleve.phone && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Téléphone</dt>
                    <dd className="mt-1 text-sm text-foreground">{eleve.phone}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Dernière connexion</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {eleve.last_seen_at ? new Date(eleve.last_seen_at).toLocaleDateString('fr-FR') : 'Jamais'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="pipeline" activeValue={activeTab}>
        <ClientLeads clientId={eleve.id} />
      </TabsContent>

      <TabsContent value="calendar" activeValue={activeTab}>
        <ClientCalendar clientId={eleve.id} />
      </TabsContent>

      <TabsContent value="activite" activeValue={activeTab}>
        <ClientSetterActivity clientId={eleve.id} />
      </TabsContent>

      <TabsContent value="finances" activeValue={activeTab}>
        <ClientFinances clientId={eleve.id} />
      </TabsContent>
    </div>
  )
}
