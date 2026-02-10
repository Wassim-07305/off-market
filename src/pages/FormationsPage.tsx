import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Plus } from 'lucide-react'
import { useFormations } from '@/hooks/useFormations'
import { useRole } from '@/hooks/useRole'
import { FormationCard } from '@/components/formations/FormationCard'
import { FormationFormModal } from '@/components/formations/FormationFormModal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

export default function FormationsPage() {
  const navigate = useNavigate()
  const { isAdmin, isEleve } = useRole()
  const { data: formations, isLoading } = useFormations(isEleve)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Formations</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'Créez et gérez vos formations.'
              : 'Suivez vos formations et votre progression.'}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowModal(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Nouvelle formation
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full rounded-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : !formations || formations.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-6 w-6" />}
          title="Aucune formation"
          description={isAdmin ? 'Créez votre première formation.' : 'Aucune formation disponible pour le moment.'}
          action={
            isAdmin ? (
              <Button onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>
                Créer une formation
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {formations.map((formation) => (
            <FormationCard
              key={formation.id}
              formation={formation}
              isAdmin={isAdmin}
              onClick={() => navigate(`/formations/${formation.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <FormationFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}
