import { useState, useMemo, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useSocialContent, useUpdateSocialContent } from '@/hooks/useSocialContent'
import { useClients } from '@/hooks/useClients'
import { SocialContentKPIs } from '@/components/social/SocialContentKPIs'
import { SocialContentBoard } from '@/components/social/SocialContentBoard'
import { SocialContentFormModal } from '@/components/social/SocialContentFormModal'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  SOCIAL_CONTENT_STATUSES,
  SOCIAL_CONTENT_STATUS_LABELS,
  SOCIAL_FORMATS,
  SOCIAL_FORMAT_LABELS,
} from '@/lib/constants'
import type { SocialContent } from '@/types/database'
import type { SocialContentStatus } from '@/lib/constants'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function SocialContentPage() {
  usePageTitle('Contenus Social')
  const [clientFilter, setClientFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [formatFilter, setFormatFilter] = useState<string>('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<SocialContent | null>(null)

  const { data: clientsData } = useClients()
  const clients = useMemo(() => clientsData?.data ?? [], [clientsData?.data])

  const filters = useMemo(
    () => ({
      client_id: clientFilter || undefined,
      status: statusFilter || undefined,
      format: formatFilter || undefined,
    }),
    [clientFilter, statusFilter, formatFilter]
  )

  const { data: contents, isLoading } = useSocialContent(filters)
  const updateContent = useUpdateSocialContent()

  const handleStatusChange = useCallback(
    (contentId: string, newStatus: SocialContentStatus) => {
      updateContent.mutate({ id: contentId, status: newStatus })
    },
    [updateContent]
  )

  const clientOptions = useMemo(
    () => [
      { value: '', label: 'Tous les clients' },
      ...clients.map((c) => ({ value: c.id, label: c.name })),
    ],
    [clients]
  )

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tous les statuts' },
      ...SOCIAL_CONTENT_STATUSES.map((s) => ({ value: s, label: SOCIAL_CONTENT_STATUS_LABELS[s] })),
    ],
    []
  )

  const formatOptions = useMemo(
    () => [
      { value: '', label: 'Tous les formats' },
      ...SOCIAL_FORMATS.map((f) => ({ value: f, label: SOCIAL_FORMAT_LABELS[f] })),
    ],
    []
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Contenus Social</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pipeline de création de contenu social.
          </p>
        </div>
        <Button
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditItem(null)
            setModalOpen(true)
          }}
        >
          Nouveau contenu
        </Button>
      </div>

      <SocialContentKPIs clientId={clientFilter || undefined} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          options={clientOptions}
          value={clientFilter}
          onChange={setClientFilter}
          placeholder="Tous les clients"
          className="w-full sm:w-48"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Tous les statuts"
          className="w-full sm:w-44"
        />
        <Select
          options={formatOptions}
          value={formatFilter}
          onChange={setFormatFilter}
          placeholder="Tous les formats"
          className="w-full sm:w-44"
        />
      </div>

      <SocialContentBoard data={contents ?? []} isLoading={isLoading} onStatusChange={handleStatusChange} />

      <SocialContentFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditItem(null)
        }}
        editItem={editItem}
      />
    </div>
  )
}
