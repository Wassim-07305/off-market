import { useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import { useClientAssignments, useCreateAssignment, useDeleteAssignment } from '@/hooks/useClientAssignments'
import { useProfiles } from '@/hooks/useUsers'
import type { AppRole } from '@/types/database'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ROLE_LABELS, APP_ROLES } from '@/lib/constants'

interface ClientTeamProps {
  clientId: string
}

const roleOptions = APP_ROLES.map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}))

function ClientTeam({ clientId }: ClientTeamProps) {
  const { data: assignments, isLoading } = useClientAssignments(clientId)
  const { data: profiles } = useProfiles()
  const createAssignment = useCreateAssignment()
  const deleteAssignment = useDeleteAssignment()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('setter')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const assignedUserIds = new Set(assignments?.map((a) => a.user_id) ?? [])

  const availableProfiles = (profiles ?? []).filter(
    (p) => !assignedUserIds.has(p.id)
  )

  const profileOptions = availableProfiles.map((p) => ({
    value: p.id,
    label: p.full_name,
  }))

  const handleAddMember = async () => {
    if (!selectedUserId || !selectedRole) return
    await createAssignment.mutateAsync({
      client_id: clientId,
      user_id: selectedUserId,
      role: selectedRole as AppRole,
    })
    setAddModalOpen(false)
    setSelectedUserId('')
    setSelectedRole('setter')
  }

  const handleDeleteMember = async () => {
    if (!deleteTarget) return
    await deleteAssignment.mutateAsync(deleteTarget)
    setDeleteTarget(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10" circle />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!assignments || assignments.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="Aucun membre assigne"
        description="Ajoutez des membres de l'equipe a ce client."
        action={
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setAddModalOpen(true)}
          >
            Ajouter un membre
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {assignments.length} membre{assignments.length > 1 ? 's' : ''} assigne{assignments.length > 1 ? 's' : ''}
        </h3>
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setAddModalOpen(true)}
        >
          Ajouter un membre
        </Button>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        {assignments.map((assignment) => {
          const profile = assignment.profile
          return (
            <div
              key={assignment.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name ?? 'Inconnu'}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {profile?.full_name ?? 'Inconnu'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {ROLE_LABELS[assignment.role]}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(assignment.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Member Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Ajouter un membre"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Membre"
            options={profileOptions}
            value={selectedUserId}
            onChange={setSelectedUserId}
            placeholder="Selectionner un membre..."
          />
          <Select
            label="Role"
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAddModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleAddMember}
              loading={createAssignment.isPending}
              disabled={!selectedUserId}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteMember}
        title="Supprimer l'assignation"
        description="Etes-vous sur de vouloir retirer ce membre du client ?"
        confirmLabel="Supprimer"
        loading={deleteAssignment.isPending}
      />
    </div>
  )
}

export { ClientTeam }
