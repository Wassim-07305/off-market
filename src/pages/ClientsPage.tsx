import { useState } from 'react'
import { Plus, Download, Users } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useRole } from '@/hooks/useRole'
import { ClientsTable } from '@/components/clients/ClientsTable'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { exportToCSV } from '@/lib/csv'
import { CLIENT_STATUSES, ITEMS_PER_PAGE } from '@/lib/constants'

const statusFilterOptions = [
  { value: '', label: 'Tous les statuts' },
  ...CLIENT_STATUSES.map((s) => ({
    value: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  })),
]

export default function ClientsPage() {
  const { isAdmin, isManager } = useRole()
  const canCreate = isAdmin || isManager

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useClients({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
  })

  const clients = data?.data ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleExportCSV = () => {
    if (clients.length === 0) return
    exportToCSV(
      clients,
      [
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Téléphone' },
        { key: 'status', label: 'Statut' },
        { key: 'created_at', label: 'Date création' },
      ],
      'clients'
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Clients</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExportCSV}
            disabled={clients.length === 0}
          >
            Exporter CSV
          </Button>
          {canCreate && (
            <Button
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setModalOpen(true)}
            >
              Nouveau client
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Rechercher un client..."
          wrapperClassName="w-full sm:max-w-xs"
        />
        <Select
          options={statusFilterOptions}
          value={statusFilter}
          onChange={handleStatusChange}
          placeholder="Tous les statuts"
          className="w-full sm:w-48"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Aucun client"
          description={
            search || statusFilter
              ? 'Aucun client ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier client.'
          }
          action={
            canCreate && !search && !statusFilter ? (
              <Button
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setModalOpen(true)}
              >
                Nouveau client
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <ClientsTable data={clients} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalCount}
          />
        </>
      )}

      {/* Modal */}
      <ClientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
