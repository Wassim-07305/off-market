import { useState, useMemo, useCallback } from 'react'
import { Plus, FileText, MoreVertical, Pencil, Copy, Trash2 } from 'lucide-react'
import { useForms, useDeleteForm, useCreateForm } from '@/hooks/useForms'
import { FormCreateModal } from '@/components/forms/FormCreateModal'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import { cn, formatDate } from '@/lib/utils'
import type { Form } from '@/types/database'

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'publié', label: 'Publié' },
  { value: 'fermé', label: 'Fermé' },
]

const FORM_STATUS_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700',
  publié: 'bg-green-100 text-green-700',
  fermé: 'bg-red-100 text-red-700',
}

const FORM_STATUS_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  publié: 'Publié',
  fermé: 'Fermé',
}

export default function FormsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Form | null>(null)

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      page,
    }),
    [search, statusFilter, page]
  )

  const { data: result, isLoading } = useForms(filters)
  const deleteForm = useDeleteForm()
  const duplicateForm = useCreateForm()

  const forms = useMemo(() => result?.data ?? [], [result?.data])
  const totalItems = result?.count ?? 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const handleDuplicate = useCallback(
    (form: Form) => {
      duplicateForm.mutate({
        title: `${form.title} (copie)`,
        description: form.description ?? undefined,
      })
    },
    [duplicateForm]
  )

  const handleDelete = (form: Form) => {
    setDeleteConfirm(form)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteForm.mutate(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Formulaires</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez et gérez vos formulaires de collecte de données.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Rechercher un formulaire..."
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
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            Nouveau formulaire
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="Aucun formulaire"
          description={search ? 'Aucun formulaire ne correspond à votre recherche.' : 'Créez votre premier formulaire pour commencer à collecter des réponses.'}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Card key={form.id} className="relative group">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{form.title}</h3>
                      </div>
                    </div>
                    <DropdownMenu
                      align="right"
                      trigger={
                        <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      }
                    >
                      <DropdownMenuItem onClick={() => {/* TODO: naviguer vers l'éditeur */}} icon={<Pencil className="h-4 w-4" />}>
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(form)} icon={<Copy className="h-4 w-4" />}>
                        Dupliquer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(form)} destructive icon={<Trash2 className="h-4 w-4" />}>
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>

                  {form.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {form.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <Badge className={cn(FORM_STATUS_COLORS[form.status] ?? 'bg-gray-100 text-gray-700')}>
                      {FORM_STATUS_LABELS[form.status] ?? form.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(form.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
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

      <FormCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Supprimer le formulaire"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
      />
    </div>
  )
}
