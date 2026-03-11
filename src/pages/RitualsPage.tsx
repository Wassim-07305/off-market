import { useState, useMemo } from 'react'
import { Plus, MoreVertical, Pencil, Trash2, Repeat } from 'lucide-react'
import { useRituals, useDeleteRitual } from '@/hooks/useRituals'
import { RitualFormModal } from '@/components/rituals/RitualFormModal'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ITEMS_PER_PAGE, RITUAL_FREQUENCY_LABELS, RITUAL_FREQUENCY_COLORS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Ritual } from '@/types/database'
import { usePageTitle } from '@/hooks/usePageTitle'

const FREQUENCY_OPTIONS = [
  { value: '', label: 'Toutes les fréquences' },
  { value: 'quotidien', label: 'Quotidien' },
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'mensuel', label: 'Mensuel' },
]

export default function RitualsPage() {
  usePageTitle('Rituels')
  const [search, setSearch] = useState('')
  const [frequencyFilter, setFrequencyFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Ritual | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Ritual | null>(null)

  const filters = useMemo(
    () => ({
      search: search || undefined,
      frequency: frequencyFilter || undefined,
      page,
    }),
    [search, frequencyFilter, page]
  )

  const { data: result, isLoading } = useRituals(filters)
  const deleteRitual = useDeleteRitual()

  const rituals = useMemo(() => result?.data ?? [], [result?.data])
  const totalItems = result?.count ?? 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const handleEdit = (ritual: Ritual) => {
    setEditItem(ritual)
    setModalOpen(true)
  }

  const handleDelete = (ritual: Ritual) => {
    setDeleteConfirm(ritual)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteRitual.mutate(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Rituels</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestion des rituels et de leur fréquence.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Rechercher un rituel..."
            wrapperClassName="w-full sm:w-64"
          />
          <Select
            options={FREQUENCY_OPTIONS}
            value={frequencyFilter}
            onChange={(v) => { setFrequencyFilter(v); setPage(1) }}
            placeholder="Toutes les fréquences"
            className="w-full sm:w-52"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditItem(null)
              setModalOpen(true)
            }}
          >
            Nouveau rituel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : rituals.length === 0 ? (
        <EmptyState
          icon={<Repeat className="h-6 w-6" />}
          title="Aucun rituel"
          description={search ? 'Aucun rituel ne correspond.' : 'Créez votre premier rituel pour commencer.'}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/40 bg-muted/30">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Titre</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Fréquence</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Créé le</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {rituals.map((ritual) => (
                  <tr key={ritual.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{ritual.title}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {ritual.description ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {ritual.frequency ? (
                        <Badge className={RITUAL_FREQUENCY_COLORS[ritual.frequency]}>
                          {RITUAL_FREQUENCY_LABELS[ritual.frequency]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {formatDate(ritual.created_at)}
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
                        <DropdownMenuItem onClick={() => handleEdit(ritual)} icon={<Pencil className="h-4 w-4" />}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(ritual)} destructive icon={<Trash2 className="h-4 w-4" />}>
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

      <RitualFormModal
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
        title="Supprimer le rituel"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
      />
    </div>
  )
}
