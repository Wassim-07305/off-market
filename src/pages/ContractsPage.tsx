import { useState, useMemo } from 'react'
import { Plus, FileSignature, Receipt, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useContracts, useDeleteContract, useInvoices, useDeleteInvoice } from '@/hooks/useContracts'
import { useClients } from '@/hooks/useClients'
import { ContractFormModal } from '@/components/contracts/ContractFormModal'
import { InvoiceFormModal } from '@/components/contracts/InvoiceFormModal'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TabsList, TabsContent } from '@/components/ui/tabs'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import type { Contract, Invoice } from '@/types/database'
import { usePageTitle } from '@/hooks/usePageTitle'

// ── Constantes ─────────────────────────────────────────────

const CONTRACT_STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoye', label: 'Envoyé' },
  { value: 'signe', label: 'Signé' },
  { value: 'expire', label: 'Expiré' },
]

const INVOICE_STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoyee', label: 'Envoyée' },
  { value: 'payee', label: 'Payée' },
  { value: 'en_retard', label: 'En retard' },
]

const CONTRACT_STATUS_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  envoye: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  signe: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  expire: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const INVOICE_STATUS_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  envoyee: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  payee: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  en_retard: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  envoye: 'Envoyé',
  signe: 'Signé',
  expire: 'Expiré',
}

const INVOICE_STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  envoyee: 'Envoyée',
  payee: 'Payée',
  en_retard: 'En retard',
}

const TABS = [
  { value: 'contrats', label: 'Contrats' },
  { value: 'factures', label: 'Factures' },
]

// ── Composant principal ────────────────────────────────────

export default function ContractsPage() {
  usePageTitle('Contrats')
  const [activeTab, setActiveTab] = useState('contrats')

  // Charger les clients pour résoudre les noms
  const { data: clientsResult } = useClients({ page: 1 })
  const clientsMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of clientsResult?.data ?? []) {
      map.set(c.id, c.name)
    }
    return map
  }, [clientsResult?.data])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Contrats & Factures</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestion des contrats et de la facturation.
        </p>
      </div>

      <TabsList tabs={TABS} value={activeTab} onChange={setActiveTab} />

      <TabsContent value="contrats" activeValue={activeTab}>
        <ContractsTab clientsMap={clientsMap} />
      </TabsContent>

      <TabsContent value="factures" activeValue={activeTab}>
        <InvoicesTab clientsMap={clientsMap} />
      </TabsContent>
    </div>
  )
}

// ── Onglet Contrats ────────────────────────────────────────

function ContractsTab({ clientsMap }: { clientsMap: Map<string, string> }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Contract | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Contract | null>(null)

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      page,
    }),
    [search, statusFilter, page]
  )

  const { data: result, isLoading } = useContracts(filters)
  const deleteContract = useDeleteContract()

  const contracts = useMemo(() => result?.data ?? [], [result?.data])
  const totalItems = result?.count ?? 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const handleEdit = (contract: Contract) => {
    setEditItem(contract)
    setModalOpen(true)
  }

  const handleDelete = (contract: Contract) => {
    setDeleteConfirm(contract)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteContract.mutate(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Rechercher un contrat..."
            wrapperClassName="w-full sm:w-64"
          />
          <Select
            options={CONTRACT_STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1) }}
            placeholder="Tous les statuts"
            className="w-full sm:w-44"
          />
        </div>
        <Button
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditItem(null)
            setModalOpen(true)
          }}
        >
          Nouveau contrat
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={<FileSignature className="h-6 w-6" />}
          title="Aucun contrat"
          description={search ? 'Aucun contrat ne correspond.' : 'Créez votre premier contrat pour commencer.'}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/40 bg-muted/30">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Titre</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Client</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Créé le</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{contract.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {contract.client_id ? (clientsMap.get(contract.client_id) ?? '—') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(CONTRACT_STATUS_COLORS[contract.status])}>
                        {CONTRACT_STATUS_LABELS[contract.status] ?? contract.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {formatDate(contract.created_at)}
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
                        <DropdownMenuItem onClick={() => handleEdit(contract)} icon={<Pencil className="h-4 w-4" />}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(contract)} destructive icon={<Trash2 className="h-4 w-4" />}>
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

      <ContractFormModal
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
        title="Supprimer le contrat"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
      />
    </div>
  )
}

// ── Onglet Factures ────────────────────────────────────────

function InvoicesTab({ clientsMap }: { clientsMap: Map<string, string> }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Invoice | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Invoice | null>(null)

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      page,
    }),
    [search, statusFilter, page]
  )

  const { data: result, isLoading } = useInvoices(filters)
  const deleteInvoice = useDeleteInvoice()

  const invoices = useMemo(() => result?.data ?? [], [result?.data])
  const totalItems = result?.count ?? 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const handleEdit = (invoice: Invoice) => {
    setEditItem(invoice)
    setModalOpen(true)
  }

  const handleDelete = (invoice: Invoice) => {
    setDeleteConfirm(invoice)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteInvoice.mutate(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Rechercher une facture..."
            wrapperClassName="w-full sm:w-64"
          />
          <Select
            options={INVOICE_STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1) }}
            placeholder="Tous les statuts"
            className="w-full sm:w-44"
          />
        </div>
        <Button
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditItem(null)
            setModalOpen(true)
          }}
        >
          Nouvelle facture
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="Aucune facture"
          description={search ? 'Aucune facture ne correspond.' : 'Créez votre première facture pour commencer.'}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/40 bg-muted/30">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">N° Facture</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Client</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Montant HT</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">TVA</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Total TTC</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Échéance</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {invoice.invoice_number ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {invoice.client_id ? (clientsMap.get(invoice.client_id) ?? '—') : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {invoice.tax}%
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(INVOICE_STATUS_COLORS[invoice.status])}>
                        {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {invoice.due_date ? formatDate(invoice.due_date) : '—'}
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
                        <DropdownMenuItem onClick={() => handleEdit(invoice)} icon={<Pencil className="h-4 w-4" />}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(invoice)} destructive icon={<Trash2 className="h-4 w-4" />}>
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

      <InvoiceFormModal
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
        title="Supprimer la facture"
        description={`Êtes-vous sûr de vouloir supprimer la facture "${deleteConfirm?.invoice_number ?? ''}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
      />
    </div>
  )
}
