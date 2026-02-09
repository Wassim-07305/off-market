import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  LayoutDashboard,
  Users,
  FileText,
  Phone,
  CalendarDays,
  Wallet,
  MessageSquare,
  Film,
  Instagram,
} from 'lucide-react'
import { useClient, useDeleteClient } from '@/hooks/useClients'
import { useRole } from '@/hooks/useRole'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { ClientOverview } from '@/components/clients/ClientOverview'
import { ClientTeam } from '@/components/clients/ClientTeam'
import { ClientLeads } from '@/components/clients/ClientLeads'
import { ClientCloserCalls } from '@/components/clients/ClientCloserCalls'
import { ClientCalendar } from '@/components/clients/ClientCalendar'
import { ClientFinances } from '@/components/clients/ClientFinances'
import { ClientSetterActivity } from '@/components/clients/ClientSetterActivity'
import { ClientSocialContent } from '@/components/clients/ClientSocialContent'
import { ClientInstagram } from '@/components/clients/ClientInstagram'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TabsList, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CLIENT_STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { TabItem } from '@/components/ui/tabs'

const TABS: TabItem[] = [
  { value: 'overview', label: <span className="inline-flex items-center gap-1.5"><LayoutDashboard className="hidden h-4 w-4 sm:block" />{"Vue d'ensemble"}</span> },
  { value: 'team', label: <span className="inline-flex items-center gap-1.5"><Users className="hidden h-4 w-4 sm:block" />Equipe</span> },
  { value: 'leads', label: <span className="inline-flex items-center gap-1.5"><FileText className="hidden h-4 w-4 sm:block" />Leads</span> },
  { value: 'closer-calls', label: <span className="inline-flex items-center gap-1.5"><Phone className="hidden h-4 w-4 sm:block" />Closer Calls</span> },
  { value: 'calendar', label: <span className="inline-flex items-center gap-1.5"><CalendarDays className="hidden h-4 w-4 sm:block" />Calendrier</span> },
  { value: 'finances', label: <span className="inline-flex items-center gap-1.5"><Wallet className="hidden h-4 w-4 sm:block" />Finances</span> },
  { value: 'setter', label: <span className="inline-flex items-center gap-1.5"><MessageSquare className="hidden h-4 w-4 sm:block" />Setter</span> },
  { value: 'social', label: <span className="inline-flex items-center gap-1.5"><Film className="hidden h-4 w-4 sm:block" />Social</span> },
  { value: 'instagram', label: <span className="inline-flex items-center gap-1.5"><Instagram className="hidden h-4 w-4 sm:block" />Instagram</span> },
]

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin, isManager } = useRole()
  const canEdit = isAdmin || isManager

  const { data: client, isLoading } = useClient(id)
  const deleteClient = useDeleteClient()

  const [activeTab, setActiveTab] = useState('overview')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    if (!id) return
    await deleteClient.mutateAsync(id)
    navigate('/clients')
  }

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

  if (!client) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/clients')}
        >
          Retour
        </Button>
        <p className="text-muted-foreground">Client introuvable.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clients')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <Badge className={cn(CLIENT_STATUS_COLORS[client.status])}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </Badge>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => setEditModalOpen(true)}
            >
              Modifier
            </Button>
            <Button
              variant="destructive"
              size="sm"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Supprimer
            </Button>
          </div>
        )}
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
        <ClientOverview client={client} />
      </TabsContent>

      <TabsContent value="team" activeValue={activeTab}>
        <ClientTeam clientId={client.id} />
      </TabsContent>

      <TabsContent value="leads" activeValue={activeTab}>
        <ClientLeads clientId={client.id} />
      </TabsContent>

      <TabsContent value="closer-calls" activeValue={activeTab}>
        <ClientCloserCalls clientId={client.id} />
      </TabsContent>

      <TabsContent value="calendar" activeValue={activeTab}>
        <ClientCalendar clientId={client.id} />
      </TabsContent>

      <TabsContent value="finances" activeValue={activeTab}>
        <ClientFinances clientId={client.id} />
      </TabsContent>

      <TabsContent value="setter" activeValue={activeTab}>
        <ClientSetterActivity clientId={client.id} />
      </TabsContent>

      <TabsContent value="social" activeValue={activeTab}>
        <ClientSocialContent clientId={client.id} />
      </TabsContent>

      <TabsContent value="instagram" activeValue={activeTab}>
        <ClientInstagram clientId={client.id} />
      </TabsContent>

      {/* Edit Modal */}
      <ClientFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        client={client}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le client"
        description={`Etes-vous sur de vouloir supprimer le client "${client.name}" ? Cette action est irreversible.`}
        confirmLabel="Supprimer"
        loading={deleteClient.isPending}
      />
    </div>
  )
}
