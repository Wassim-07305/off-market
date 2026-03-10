import { useState, useMemo, useCallback } from 'react'
import { Plus, Download, MoreVertical, Pencil, Trash2, Building2 } from 'lucide-react'
import { useClients, useDeleteClient } from '@/hooks/useClients'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { exportToCSV } from '@/lib/csv'
import { CLIENT_STATUS_COLORS, ITEMS_PER_PAGE } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Client } from '@/types/database'
import { toast } from 'sonner'

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'archivé', label: 'Archivé' },
]

export default function ClientsManagePage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Client | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Client | null>(null)

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      page,
    }),
    [search, statusFilter, page]
  )

  const { data: result, isLoading } = useClients(filters)
  const deleteClient = useDeleteClient()

  const clients = useMemo(() => result?.data ?? [], [result?.data])
  const totalItems = result?.count ?? 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const handleExportCSV = useCallback(() => {
    if (clients.length === 0) {
      toast.error('Aucune donnée à exporter')
      return
    }
    exportToCSV(
      clients,
      [
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Téléphone' },
        { key: 'status', label: 'Statut' },
        { key: 'notes', label: 'Notes' },
        { key: 'created_at', label: 'Créé le' },
      ],
      'clients'
    )
  }, [clients])

  const handleEdit = (client: Client) => {
    setEditItem(client)
    setModalOpen(true)
  }

  const handleDelete = (client: Client) => {
    setDeleteConfirm(client)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteClient.mutate(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestion des clients et de leurs informations.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Rechercher un client..."
            wrapperClassName="w-full sm:w-64"
          />
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1) }}
            placeholder="Tous les statuts"
            className="w-full sm:w-44"
          />
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
            Nouveau client
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Aucun client"
          description={search ? 'Aucun client ne correspond.' : "Créez votre premier client pour commencer."}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/40 bg-muted/30">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Nom</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Email</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Téléphone</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Créé le</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{client.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{client.email ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{client.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge className={CLIENT_STATUS_COLORS[client.status]}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu
                        align="right"
                        trigger={
                          <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        }
                      >
                        <DropdownMenuItem onClick={() => handleEdit(client)} icon={<Pencil className="h-4 w-4" />}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(client)} destructive icon={<Trash2 className="h-4 w-4" />}>
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
            />
          )}
        </>
      )}

      <ClientFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditItem(null)
        }}
        editItem={editItem}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Supprimer le client"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
      />
    </div>
  )
}
