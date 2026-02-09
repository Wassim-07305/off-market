import { useState } from 'react'
import { Plus, MessageSquare } from 'lucide-react'
import { useInterviews } from '@/hooks/useInterviews'
import { useProfiles } from '@/hooks/useUsers'
import { INTERVIEW_STATUSES } from '@/lib/constants'
import type { InterviewWithRelations } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Drawer } from '@/components/shared/Drawer'
import { InterviewsTable } from '@/components/interviews/InterviewsTable'
import { InterviewFormModal } from '@/components/interviews/InterviewFormModal'
import { InterviewDetail } from '@/components/interviews/InterviewDetail'

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  ...INTERVIEW_STATUSES.map((s) => ({
    value: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  })),
]

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Tous les rôles' },
  { value: 'coach', label: 'Coach' },
  { value: 'setter', label: 'Setter' },
  { value: 'closer', label: 'Closer' },
]

export default function InterviewsPage() {
  const [memberFilter, setMemberFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [editInterview, setEditInterview] = useState<InterviewWithRelations | null>(null)
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null)

  const { data: profiles } = useProfiles()
  const { data: interviews, isLoading } = useInterviews({
    member_id: memberFilter || undefined,
    status: statusFilter || undefined,
  })

  const memberOptions = [
    { value: '', label: 'Tous les membres' },
    ...(profiles ?? []).map((p) => ({
      value: p.id,
      label: p.full_name,
    })),
  ]

  const handleRowClick = (interview: InterviewWithRelations) => {
    setSelectedInterviewId(interview.id)
  }

  const handleCloseDetail = () => {
    setSelectedInterviewId(null)
  }

  const handleOpenCreate = () => {
    setEditInterview(null)
    setShowFormModal(true)
  }

  const handleCloseForm = () => {
    setShowFormModal(false)
    setEditInterview(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Entretiens 1-to-1</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les entretiens individuels et les blocages.
          </p>
        </div>
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={handleOpenCreate}
        >
          Nouvel entretien
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Select
          label="Membre"
          options={memberOptions}
          value={memberFilter}
          onChange={setMemberFilter}
          wrapperClassName="w-full sm:w-56"
        />
        <Select
          label="Statut"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          wrapperClassName="w-full sm:w-48"
        />
        <Select
          label="Rôle"
          options={ROLE_FILTER_OPTIONS}
          value={roleFilter}
          onChange={setRoleFilter}
          wrapperClassName="w-full sm:w-44"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !interviews || interviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-6 w-6" />}
          title="Aucun entretien"
          description="Commencez par créer un entretien 1-to-1 avec un membre de l'équipe."
          action={
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={handleOpenCreate}
            >
              Nouvel entretien
            </Button>
          }
        />
      ) : (
        <InterviewsTable
          data={interviews}
          onRowClick={handleRowClick}
        />
      )}

      {/* Create/Edit Modal */}
      <InterviewFormModal
        open={showFormModal}
        onClose={handleCloseForm}
        interview={editInterview}
      />

      {/* Detail Drawer */}
      <Drawer
        open={!!selectedInterviewId}
        onClose={handleCloseDetail}
        title="Détail de l'entretien"
        width="max-w-2xl"
      >
        {selectedInterviewId && (
          <InterviewDetail interviewId={selectedInterviewId} />
        )}
      </Drawer>
    </div>
  )
}
