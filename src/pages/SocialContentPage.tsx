import { useState, useMemo, useCallback, useRef } from 'react'
import { Plus, Download, Upload, LayoutList, CalendarDays } from 'lucide-react'
import { useSocialContent, useCreateSocialContent } from '@/hooks/useSocialContent'
import { useClients } from '@/hooks/useClients'
import { SocialTable } from '@/components/social/SocialTable'
import { ContentCalendar } from '@/components/social/ContentCalendar'
import { SocialContentFormModal } from '@/components/social/SocialContentFormModal'
import { TabsList } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { exportToCSV, importCSV } from '@/lib/csv'
import { SOCIAL_STATUSES, SOCIAL_STATUS_LABELS, SOCIAL_FORMATS } from '@/lib/constants'
import type { SocialContent } from '@/types/database'
import type { TabItem } from '@/components/ui/tabs'
import { toast } from 'sonner'

const FORMAT_LABELS: Record<string, string> = {
  réel: 'Réel',
  story: 'Story',
  carrousel: 'Carrousel',
  post: 'Post',
}

export default function SocialContentPage() {
  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [formatFilter, setFormatFilter] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<SocialContent | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: clientsData } = useClients()
  const clients = clientsData?.data ?? []

  const filters = useMemo(
    () => ({
      client_id: selectedClientId || undefined,
      status: statusFilter || undefined,
      format: formatFilter || undefined,
    }),
    [selectedClientId, statusFilter, formatFilter]
  )

  const { data: socialData, isLoading } = useSocialContent(filters)
  const createMutation = useCreateSocialContent()

  const clientTabs: TabItem[] = useMemo(
    () => [
      { value: '', label: 'Tous' },
      ...clients.map((c) => ({ value: c.id, label: c.name })),
    ],
    [clients]
  )

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tous les statuts' },
      ...SOCIAL_STATUSES.map((s) => ({ value: s, label: SOCIAL_STATUS_LABELS[s] })),
    ],
    []
  )

  const formatOptions = useMemo(
    () => [
      { value: '', label: 'Tous les formats' },
      ...SOCIAL_FORMATS.map((f) => ({ value: f, label: FORMAT_LABELS[f] ?? f })),
    ],
    []
  )

  const handleExportCSV = useCallback(() => {
    if (!socialData || socialData.length === 0) {
      toast.error('Aucune donnée à exporter')
      return
    }
    exportToCSV(
      socialData,
      [
        { key: 'title', label: 'Titre' },
        { key: 'status', label: 'Statut' },
        { key: 'format', label: 'Format' },
        { key: 'video_type', label: 'Type vidéo' },
        { key: 'link', label: 'Lien' },
        { key: 'is_validated', label: 'Validé' },
        { key: 'planned_date', label: 'Date prévue' },
      ],
      'contenus-social'
    )
  }, [socialData])

  const handleImportCSV = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const rows = await importCSV<Record<string, string>>(file)
        for (const row of rows) {
          if (row.title || row.Titre) {
            await createMutation.mutateAsync({
              client_id: selectedClientId || clients[0]?.id || '',
              title: row.title || row.Titre || '',
              status: 'idée',
              is_validated: false,
            })
          }
        }
        toast.success(`${rows.length} contenus importés`)
      } catch (error) {
        toast.error('Erreur lors de l\'import CSV')
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [createMutation, selectedClientId, clients]
  )

  const handleOpenCreate = useCallback(() => {
    setEditItem(null)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditItem(null)
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Planning Contenus Social</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestion et planification des contenus pour les réseaux sociaux.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-muted p-1">
            <button
              onClick={() => setView('table')}
              className={`rounded-lg p-1.5 transition-all ${view === 'table' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`rounded-lg p-1.5 transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <CalendarDays className="h-4 w-4" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Importer
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExportCSV}
          >
            Exporter
          </Button>
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={handleOpenCreate}
          >
            Nouveau contenu
          </Button>
        </div>
      </div>

      <TabsList
        tabs={clientTabs}
        value={selectedClientId}
        onChange={setSelectedClientId}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Tous les statuts"
          className="w-full sm:w-48"
        />
        <Select
          options={formatOptions}
          value={formatFilter}
          onChange={setFormatFilter}
          placeholder="Tous les formats"
          className="w-full sm:w-48"
        />
      </div>

      {view === 'table' ? (
        <SocialTable
          data={socialData ?? []}
          isLoading={isLoading}
          onEdit={(item) => {
            setEditItem(item)
            setModalOpen(true)
          }}
        />
      ) : (
        <ContentCalendar
          content={socialData ?? []}
          onContentClick={(item) => {
            setEditItem(item)
            setModalOpen(true)
          }}
        />
      )}

      <SocialContentFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        editItem={editItem}
      />
    </div>
  )
}
