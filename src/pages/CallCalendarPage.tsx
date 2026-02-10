import { useState, useCallback, useMemo } from 'react'
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CallCalendarWithRelations } from '@/types/database'
import { useCallCalendar } from '@/hooks/useCallCalendar'
import { useClients } from '@/hooks/useClients'
import { CallKPIs } from '@/components/calls/CallKPIs'
import { WeekView } from '@/components/calls/WeekView'
import { ListView } from '@/components/calls/ListView'
import { CallFormModal } from '@/components/calls/CallFormModal'
import { TabsList, TabsContent } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/csv'
import {
  CALL_TYPES,
  CALL_TYPE_LABELS,
  CALL_STATUSES,
  CALL_STATUS_LABELS,
} from '@/lib/constants'

export default function CallCalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [activeTab, setActiveTab] = useState('week')
  const [clientId, setClientId] = useState('')
  const [callType, setCallType] = useState('')
  const [callStatus, setCallStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCall, setEditingCall] = useState<CallCalendarWithRelations | null>(null)

  const weekStart = useMemo(
    () => startOfWeek(currentWeek, { weekStartsOn: 1 }),
    [currentWeek]
  )
  const weekEnd = useMemo(
    () => endOfWeek(currentWeek, { weekStartsOn: 1 }),
    [currentWeek]
  )

  const filters = {
    date_from: format(weekStart, 'yyyy-MM-dd'),
    date_to: format(weekEnd, 'yyyy-MM-dd'),
    client_id: clientId || undefined,
    type: callType || undefined,
    status: callStatus || undefined,
  }

  const { data: calls, isLoading } = useCallCalendar(filters)
  const { data: clientsData } = useClients()

  const handleCallClick = useCallback((call: CallCalendarWithRelations) => {
    setEditingCall(call)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingCall(null)
  }, [])

  const handleExport = useCallback(() => {
    if (!calls) return
    exportToCSV(
      calls.map((c) => ({
        ...c,
        client_name: c.client?.name ?? '',
        lead_name: c.lead?.name ?? '',
      })),
      [
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Heure' },
        { key: 'client_name', label: 'Client' },
        { key: 'lead_name', label: 'Lead' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Statut' },
        { key: 'link', label: 'Lien' },
        { key: 'notes', label: 'Notes' },
      ],
      'calls-export'
    )
  }, [calls])

  const clientOptions = [
    { value: '', label: 'Tous les clients' },
    ...(clientsData?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
  ]

  const typeOptions = [
    { value: '', label: 'Tous les types' },
    ...CALL_TYPES.map((t) => ({ value: t, label: CALL_TYPE_LABELS[t] })),
  ]

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    ...CALL_STATUSES.map((s) => ({ value: s, label: CALL_STATUS_LABELS[s] })),
  ]

  const tabs = [
    { value: 'week', label: 'Semaine' },
    { value: 'list', label: 'Liste' },
  ]

  const weekLabel = `${format(weekStart, 'd MMM', { locale: fr })} - ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Calendrier des Calls</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Planifiez et suivez vos appels
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            iClosed
          </span>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            disabled={!calls?.length}
          >
            Exporter CSV
          </Button>
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            Nouveau call
          </Button>
        </div>
      </div>

      <CallKPIs />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentWeek((prev) => subWeeks(prev, 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] sm:min-w-[180px] text-center text-sm font-medium text-foreground">
            {weekLabel}
          </span>
          <button
            type="button"
            onClick={() => setCurrentWeek((prev) => addWeeks(prev, 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
          >
            Aujourd'hui
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <Select
            options={clientOptions}
            value={clientId}
            onChange={setClientId}
            placeholder="Client"
            className="w-full sm:w-44"
          />
          <Select
            options={typeOptions}
            value={callType}
            onChange={setCallType}
            placeholder="Type"
            className="w-full sm:w-36"
          />
          <Select
            options={statusOptions}
            value={callStatus}
            onChange={setCallStatus}
            placeholder="Statut"
            className="w-full sm:w-36"
          />
        </div>
      </div>

      <TabsList tabs={tabs} value={activeTab} onChange={setActiveTab} />

      <TabsContent value="week" activeValue={activeTab}>
        <WeekView
          calls={calls ?? []}
          weekStart={weekStart}
          isLoading={isLoading}
          onCallClick={handleCallClick}
        />
      </TabsContent>

      <TabsContent value="list" activeValue={activeTab}>
        <ListView
          calls={calls ?? []}
          isLoading={isLoading}
          onCallClick={handleCallClick}
        />
      </TabsContent>

      <CallFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        call={editingCall}
      />
    </div>
  )
}
