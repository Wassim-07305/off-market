import { useState, useMemo, useCallback } from 'react'
import { Plus, Download } from 'lucide-react'
import { useCloserCalls } from '@/hooks/useCloserCalls'
import { useClients } from '@/hooks/useClients'
import { CloserCallKPIs } from '@/components/closer-calls/CloserCallKPIs'
import { CloserCallsTable } from '@/components/closer-calls/CloserCallsTable'
import { CloserCallFormModal } from '@/components/closer-calls/CloserCallFormModal'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { exportToCSV } from '@/lib/csv'
import { CLOSER_CALL_STATUSES, CLOSER_CALL_STATUS_LABELS, ITEMS_PER_PAGE } from '@/lib/constants'
import type { CloserCall } from '@/types/database'
import { toast } from 'sonner'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function CloserCallsPage() {
  usePageTitle('CA & Appels')
  const [clientFilter, setClientFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<CloserCall | null>(null)

  const { data: clientsData } = useClients()
  const clients = useMemo(() => clientsData?.data ?? [], [clientsData?.data])

  const filters = useMemo(
    () => ({
      client_id: clientFilter || undefined,
      status: statusFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
    }),
    [clientFilter, statusFilter, dateFrom, dateTo, page]
  )

  const { data: callsResult, isLoading } = useCloserCalls(filters)

  const calls = useMemo(() => callsResult?.data ?? [], [callsResult?.data])
  const totalItems = callsResult?.count ?? 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

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
      ...CLOSER_CALL_STATUSES.map((s) => ({ value: s, label: CLOSER_CALL_STATUS_LABELS[s] })),
    ],
    []
  )

  const handleExportCSV = useCallback(() => {
    if (calls.length === 0) {
      toast.error('Aucune donnée à exporter')
      return
    }
    exportToCSV(
      calls,
      [
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Statut' },
        { key: 'revenue', label: 'Revenu' },
        { key: 'nombre_paiements', label: 'Paiements' },
        { key: 'debrief', label: 'Debrief' },
        { key: 'notes', label: 'Notes' },
      ],
      'appels-closer'
    )
  }, [calls])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">CA & Appels Closer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivi des appels de closing et du chiffre d&apos;affaires généré.
          </p>
        </div>
      </div>

      <CloserCallKPIs clientId={clientFilter || undefined} />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              options={clientOptions}
              value={clientFilter}
              onChange={(v) => { setClientFilter(v); setPage(1) }}
              placeholder="Tous les clients"
              className="w-full sm:w-48"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1) }}
              placeholder="Tous les statuts"
              className="w-full sm:w-44"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                className="w-full sm:w-auto h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Du"
              />
              <span className="text-sm text-muted-foreground">au</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                className="w-full sm:w-auto h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Au"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
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
              onClick={() => {
                setEditItem(null)
                setModalOpen(true)
              }}
            >
              Nouvel appel
            </Button>
          </div>
        </div>

        <CloserCallsTable
          data={calls}
          isLoading={isLoading}
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalItems}
          />
        )}
      </div>

      <CloserCallFormModal
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
