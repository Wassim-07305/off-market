import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useFormation, useDeleteFormation } from '@/hooks/useFormations'
import { useModules, useDeleteModule } from '@/hooks/useModules'
import { useAllModuleItems, useDeleteModuleItem } from '@/hooks/useModuleItems'
import { useUserCompletions, useToggleCompletion } from '@/hooks/useItemCompletions'
import { useRole } from '@/hooks/useRole'
import { ModuleAccordion } from '@/components/formations/ModuleAccordion'
import { FormationFormModal } from '@/components/formations/FormationFormModal'
import { ModuleFormModal } from '@/components/formations/ModuleFormModal'
import { ItemFormModal } from '@/components/formations/ItemFormModal'
import { VideoPlayer } from '@/components/formations/VideoPlayer'
import { ProgressBar } from '@/components/formations/ProgressBar'
import { FormationProgressAdmin } from '@/components/formations/FormationProgressAdmin'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { FormationModule as FormationModuleType, ModuleItem } from '@/types/database'

export default function FormationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin, isEleve } = useRole()

  const { data: formation, isLoading: formationLoading } = useFormation(id)
  const { data: modules, isLoading: modulesLoading } = useModules(id)
  const moduleIds = (modules ?? []).map((m) => m.id)
  const { data: items } = useAllModuleItems(moduleIds)
  const { data: completions } = useUserCompletions()
  const toggleCompletion = useToggleCompletion()
  const deleteFormation = useDeleteFormation()
  const deleteModule = useDeleteModule()
  const deleteItem = useDeleteModuleItem()

  const [showFormationModal, setShowFormationModal] = useState(false)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [editingModule, setEditingModule] = useState<FormationModuleType | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ModuleItem | null>(null)
  const [itemModuleId, setItemModuleId] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<ModuleItem | null>(null)
  const [showAdminProgress, setShowAdminProgress] = useState(false)

  const isLoading = formationLoading || modulesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    )
  }

  if (!formation) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Formation introuvable.</p>
        <Button variant="secondary" onClick={() => navigate('/formations')} className="mt-4">
          Retour aux formations
        </Button>
      </div>
    )
  }

  const allItems = items ?? []
  const completedItemIds = new Set((completions ?? []).map((c) => c.item_id))
  const totalItems = allItems.length
  const completedCount = allItems.filter((i) => completedItemIds.has(i.id)).length

  const handleDeleteFormation = async () => {
    if (!window.confirm('Supprimer cette formation ? Cette action est irréversible.')) return
    await deleteFormation.mutateAsync(formation.id)
    navigate('/formations')
  }

  const handleDeleteModule = async (mod: FormationModuleType) => {
    if (!window.confirm(`Supprimer le module "${mod.title}" ?`)) return
    await deleteModule.mutateAsync({ id: mod.id, formationId: formation.id })
  }

  const handleDeleteItem = async (item: ModuleItem) => {
    if (!window.confirm(`Supprimer "${item.title}" ?`)) return
    await deleteItem.mutateAsync(item.id)
  }

  const handleItemClick = (item: ModuleItem) => {
    setSelectedItem(item)
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/formations')}
          className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux formations
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{formation.title}</h1>
              {isAdmin && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  formation.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {formation.is_published ? 'Publié' : 'Brouillon'}
                </span>
              )}
            </div>
            {formation.description && (
              <p className="mt-1 text-sm text-muted-foreground">{formation.description}</p>
            )}
          </div>

          {isAdmin && (
            <div className="flex shrink-0 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAdminProgress(!showAdminProgress)}
                icon={<Users className="h-4 w-4" />}
              >
                Progression
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFormationModal(true)}
                icon={<Pencil className="h-4 w-4" />}
              >
                Modifier
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteFormation}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Supprimer
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Student progress bar */}
      {isEleve && totalItems > 0 && (
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Votre progression</span>
            <span className="text-sm font-semibold text-foreground">
              {Math.round((completedCount / totalItems) * 100)}%
            </span>
          </div>
          <ProgressBar completed={completedCount} total={totalItems} showLabel={false} />
        </div>
      )}

      {/* Admin progress panel */}
      {isAdmin && showAdminProgress && (
        <div className="rounded-xl border border-border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Progression des élèves</h2>
          <FormationProgressAdmin formationId={formation.id} />
        </div>
      )}

      {/* Video player for selected item */}
      {selectedItem && selectedItem.type === 'video' && selectedItem.url && (
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">{selectedItem.title}</h2>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Fermer
            </button>
          </div>
          <VideoPlayer url={selectedItem.url} />
        </div>
      )}

      {/* Modules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Modules ({(modules ?? []).length})
          </h2>
          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingModule(null)
                setShowModuleModal(true)
              }}
              icon={<Plus className="h-4 w-4" />}
            >
              Ajouter un module
            </Button>
          )}
        </div>

        {(modules ?? []).length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center">
            <p className="text-sm text-muted-foreground">Aucun module dans cette formation.</p>
          </div>
        ) : (
          (modules ?? []).map((mod, idx) => (
            <ModuleAccordion
              key={mod.id}
              module={mod}
              items={allItems.filter((i) => i.module_id === mod.id)}
              completions={completions ?? []}
              isAdmin={isAdmin}
              isEleve={isEleve}
              defaultOpen={idx === 0}
              onToggleComplete={(itemId, completed) =>
                toggleCompletion.mutate({ itemId, completed })
              }
              onItemClick={handleItemClick}
              onEditModule={() => {
                setEditingModule(mod)
                setShowModuleModal(true)
              }}
              onDeleteModule={() => handleDeleteModule(mod)}
              onAddItem={() => {
                setEditingItem(null)
                setItemModuleId(mod.id)
                setShowItemModal(true)
              }}
              onEditItem={(item) => {
                setEditingItem(item)
                setItemModuleId(mod.id)
                setShowItemModal(true)
              }}
              onDeleteItem={handleDeleteItem}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <FormationFormModal
        open={showFormationModal}
        onClose={() => setShowFormationModal(false)}
        formation={formation}
      />
      {id && (
        <ModuleFormModal
          open={showModuleModal}
          onClose={() => {
            setShowModuleModal(false)
            setEditingModule(null)
          }}
          formationId={id}
          module={editingModule}
          nextSortOrder={(modules ?? []).length}
        />
      )}
      {itemModuleId && (
        <ItemFormModal
          open={showItemModal}
          onClose={() => {
            setShowItemModal(false)
            setEditingItem(null)
          }}
          moduleId={itemModuleId}
          item={editingItem}
          nextSortOrder={allItems.filter((i) => i.module_id === itemModuleId).length}
        />
      )}
    </div>
  )
}
