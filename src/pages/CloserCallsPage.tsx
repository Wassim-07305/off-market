import { useState, useCallback } from 'react'
import { Plus, Download } from 'lucide-react'
import type { CloserCallWithRelations } from '@/types/database'
import { useCloserCalls } from '@/hooks/useCloserCalls'
import { useClients } from '@/hooks/useClients'
import { CloserCallKPIs } from '@/components/calls/CloserCallKPIs'
import { CloserCallsTable } from '@/components/calls/CloserCallsTable'
import { CloserCallFormModal } from '@/components/calls/CloserCallFormModal'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { exportToCSV } from '@/lib/csv'
import { CLOSER_CALL_STATUSES, ITEMS_PER_PAGE } from '@/lib/constants'
import type { CloserCallStatus } from '@/lib/constants'

const statusLabels: Record<CloserCallStatus, string> = {
  closé: 'Closé',
  non_closé: 'Non closé',
}

export default function CloserCallsPage() {
  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCall, setEditingCall] = useState<CloserCallWithRelations | null>(null)

  const filters = {
    client_id: clientId || undefined,
    status: status || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
  }

  const { data, isLoading } = useCloserCalls(filters)
  const { data: clientsData } = useClients()

  const totalPages = Math.ceil((data?.count ?? 0) / ITEMS_PER_PAGE)

  const handleEdit = useCallback((call: CloserCallWithRelations) => {
    setEditingCall(call)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingCall(null)
  }, [])

  const handleExport = useCallback(() => {
    if (!data?.data) return
    exportToCSV(
      data.data.map((c) => ({
        ...c,
        client_name: c.client?.name ?? '',
        lead_name: c.lead?.name ?? '',
        closer_name: c.closer?.full_name ?? '',
      })),
      [
        { key: 'date', label: 'Date' },
        { key: 'client_name', label: 'Client' },
        { key: 'lead_name', label: 'Lead' },
        { key: 'closer_name', label: 'Closer' },
        { key: 'status', label: 'Statut' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'nombre_paiements', label: 'Nb Paiements' },
        { key: 'link', label: 'Lien' },
        { key: 'debrief', label: 'Debrief' },
      ],
      'closer-calls-export'
    )
  }, [data])

  const clientOptions = [
    { value: '', label: 'Tous les clients' },
    ...(clientsData?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
  ]

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    ...CLOSER_CALL_STATUSES.map((s) => ({ value: s, label: statusLabels[s] })),
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Closer Calls</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez les performances de closing
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            disabled={!data?.data?.length}
          >
            Exporter CSV
          </Button>
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            Nouveau closer call
          </Button>
        </div>
      </div>

      <CloserCallKPIs clientId={clientId || undefined} />

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
        <Select
          options={clientOptions}
          value={clientId}
          onChange={(val) => {
            setClientId(val)
            setPage(1)
          }}
          placeholder="Client"
          className="w-full sm:w-48"
        />
        <Select
          options={statusOptions}
          value={status}
          onChange={(val) => {
            setStatus(val)
            setPage(1)
          }}
          placeholder="Statut"
          className="w-full sm:w-40"
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setPage(1)
            }}
            className="w-full sm:w-auto h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Du"
          />
          <span className="text-sm text-muted-foreground">au</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              setPage(1)
            }}
            className="w-full sm:w-auto h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Au"
          />
        </div>
      </div>

      <CloserCallsTable
        data={data?.data ?? []}
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={data?.count}
      />

      <CloserCallFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        call={editingCall}
      />
    </div>
  )
}
