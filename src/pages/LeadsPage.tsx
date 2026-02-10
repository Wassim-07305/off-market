import { useState, useCallback } from 'react'
import { Plus, Download, LayoutList, Columns } from 'lucide-react'
import type { LeadWithRelations } from '@/types/database'
import type { LeadStatus } from '@/lib/constants'
import { useLeads, useAllLeads, useUpdateLead } from '@/hooks/useLeads'
import { useClients } from '@/hooks/useClients'
import { LeadKPIs } from '@/components/leads/LeadKPIs'
import { LeadsTable } from '@/components/leads/LeadsTable'
import { LeadKanban } from '@/components/leads/LeadKanban'
import { LeadFormModal } from '@/components/leads/LeadFormModal'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { exportToCSV } from '@/lib/csv'
import { cn } from '@/lib/utils'
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  ITEMS_PER_PAGE,
} from '@/lib/constants'

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [clientId, setClientId] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<LeadWithRelations | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  const filters = {
    search: search || undefined,
    status: status || undefined,
    source: source || undefined,
    client_id: clientId || undefined,
    page,
  }

  const { data, isLoading } = useLeads(filters)
  const { data: allLeads = [] } = useAllLeads()
  const { data: clientsData } = useClients()
  const updateLead = useUpdateLead()

  const totalPages = Math.ceil((data?.count ?? 0) / ITEMS_PER_PAGE)

  const handleEdit = useCallback((lead: LeadWithRelations) => {
    setEditingLead(lead)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setEditingLead(null)
  }, [])

  const handleKanbanStatusChange = useCallback((leadId: string, newStatus: LeadStatus) => {
    updateLead.mutate({ id: leadId, status: newStatus })
  }, [updateLead])

  const handleExport = useCallback(() => {
    if (!data?.data) return
    exportToCSV(
      data.data.map((l) => ({
        ...l,
        client_name: l.client?.name ?? '',
        assigned_name: l.assigned_profile?.full_name ?? '',
      })),
      [
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Téléphone' },
        { key: 'source', label: 'Source' },
        { key: 'status', label: 'Statut' },
        { key: 'client_name', label: 'Client' },
        { key: 'assigned_name', label: 'Assigné à' },
        { key: 'ca_contracté', label: 'CA Contracté' },
        { key: 'ca_collecté', label: 'CA Collecté' },
        { key: 'commission_setter', label: 'Commission Setter' },
        { key: 'commission_closer', label: 'Commission Closer' },
      ],
      'leads-export'
    )
  }, [data])

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    ...LEAD_STATUSES.map((s) => ({ value: s, label: LEAD_STATUS_LABELS[s] })),
  ]

  const sourceOptions = [
    { value: '', label: 'Toutes les sources' },
    ...LEAD_SOURCES.map((s) => ({ value: s, label: LEAD_SOURCE_LABELS[s] })),
  ]

  const clientOptions = [
    { value: '', label: 'Tous les clients' },
    ...(clientsData?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Pipeline de Prospection</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez et suivez votre pipeline de prospection
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex items-center rounded-xl border border-border bg-white p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                viewMode === 'table'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Tableau
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                viewMode === 'kanban'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Columns className="h-3.5 w-3.5" />
              Pipeline
            </button>
          </div>

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
            Nouveau lead
          </Button>
        </div>
      </div>

      <LeadKPIs />

      {viewMode === 'kanban' ? (
        <LeadKanban leads={allLeads} onStatusChange={handleKanbanStatusChange} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val)
                setPage(1)
              }}
              placeholder="Rechercher un lead..."
              wrapperClassName="w-full sm:w-64"
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
            <Select
              options={sourceOptions}
              value={source}
              onChange={(val) => {
                setSource(val)
                setPage(1)
              }}
              placeholder="Source"
              className="w-full sm:w-40"
            />
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
          </div>

          <LeadsTable
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
        </>
      )}

      <LeadFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        lead={editingLead}
      />
    </div>
  )
}
