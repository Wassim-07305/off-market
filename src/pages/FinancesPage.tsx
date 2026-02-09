import { useState, useMemo, useCallback } from 'react'
import { Plus, Download } from 'lucide-react'
import { useFinancialEntries, usePaymentSchedules } from '@/hooks/useFinances'
import { useClients } from '@/hooks/useClients'
import { FinanceKPIs } from '@/components/finances/FinanceKPIs'
import { FinanceEntriesTable } from '@/components/finances/FinanceEntriesTable'
import { FinanceEntryFormModal } from '@/components/finances/FinanceEntryFormModal'
import { PaymentScheduleTable } from '@/components/finances/PaymentScheduleTable'
import { PaymentScheduleFormModal } from '@/components/finances/PaymentScheduleFormModal'
import { FinanceProjections } from '@/components/finances/FinanceProjections'
import { TabsList, TabsContent } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { exportToCSV } from '@/lib/csv'
import { FINANCIAL_TYPES, FINANCIAL_TYPE_LABELS, ITEMS_PER_PAGE } from '@/lib/constants'
import type { FinancialEntry, PaymentSchedule } from '@/types/database'
import { toast } from 'sonner'

const FINANCE_TABS = [
  { value: 'entries', label: 'Entrées' },
  { value: 'schedules', label: 'Échéanciers' },
  { value: 'projections', label: 'Projections' },
]

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState('entries')
  const [clientFilter, setClientFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [page, setPage] = useState(1)

  const [entryModalOpen, setEntryModalOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<FinancialEntry | null>(null)

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [editSchedule, setEditSchedule] = useState<PaymentSchedule | null>(null)

  const { data: clientsData } = useClients()
  const clients = clientsData?.data ?? []

  const entryFilters = useMemo(
    () => ({
      client_id: clientFilter || undefined,
      type: typeFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
    }),
    [clientFilter, typeFilter, dateFrom, dateTo, page]
  )

  const { data: entriesResult, isLoading: entriesLoading } = useFinancialEntries(entryFilters)
  const { data: schedules, isLoading: schedulesLoading } = usePaymentSchedules(
    clientFilter || undefined
  )

  const entries = entriesResult?.data ?? []
  const totalEntries = entriesResult?.count ?? 0
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE)

  const clientOptions = useMemo(
    () => [
      { value: '', label: 'Tous les clients' },
      ...clients.map((c) => ({ value: c.id, label: c.name })),
    ],
    [clients]
  )

  const typeOptions = useMemo(
    () => [
      { value: '', label: 'Tous les types' },
      ...FINANCIAL_TYPES.map((t) => ({ value: t, label: FINANCIAL_TYPE_LABELS[t] })),
    ],
    []
  )

  const handleExportCSV = useCallback(() => {
    if (entries.length === 0) {
      toast.error('Aucune donnée à exporter')
      return
    }
    exportToCSV(
      entries,
      [
        { key: 'label', label: 'Libellé' },
        { key: 'type', label: 'Type' },
        { key: 'amount', label: 'Montant' },
        { key: 'prestataire', label: 'Prestataire' },
        { key: 'is_paid', label: 'Payé' },
        { key: 'date', label: 'Date' },
      ],
      'finances'
    )
  }, [entries])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Finances</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivi financier, entrées et échéanciers de paiement.
          </p>
        </div>
      </div>

      <FinanceKPIs clientId={clientFilter || undefined} />

      <TabsList tabs={FINANCE_TABS} value={activeTab} onChange={setActiveTab} />

      <TabsContent value="entries" activeValue={activeTab}>
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
                options={typeOptions}
                value={typeFilter}
                onChange={(v) => { setTypeFilter(v); setPage(1) }}
                placeholder="Tous les types"
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
                  setEditEntry(null)
                  setEntryModalOpen(true)
                }}
              >
                Nouvelle entrée
              </Button>
            </div>
          </div>

          <FinanceEntriesTable
            data={entries}
            isLoading={entriesLoading}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalEntries}
            />
          )}
        </div>
      </TabsContent>

      <TabsContent value="schedules" activeValue={activeTab}>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select
              options={clientOptions}
              value={clientFilter}
              onChange={setClientFilter}
              placeholder="Tous les clients"
              className="w-full sm:w-48"
            />
            <Button
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditSchedule(null)
                setScheduleModalOpen(true)
              }}
            >
              Nouvel échéancier
            </Button>
          </div>

          <PaymentScheduleTable
            data={schedules ?? []}
            isLoading={schedulesLoading}
          />
        </div>
      </TabsContent>

      <TabsContent value="projections" activeValue={activeTab}>
        <FinanceProjections />
      </TabsContent>

      <FinanceEntryFormModal
        open={entryModalOpen}
        onClose={() => {
          setEntryModalOpen(false)
          setEditEntry(null)
        }}
        editItem={editEntry}
      />

      <PaymentScheduleFormModal
        open={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false)
          setEditSchedule(null)
        }}
        editItem={editSchedule}
      />
    </div>
  )
}
