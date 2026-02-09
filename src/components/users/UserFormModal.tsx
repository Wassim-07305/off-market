import { useEffect, useState } from 'react'
import { APP_ROLES, ROLE_LABELS } from '@/lib/constants'
import type { Profile, AppRole } from '@/types/database'
import { useUpdateProfile, useUpdateUserRole } from '@/hooks/useUsers'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface UserWithRole extends Profile {
  role: AppRole
}

interface UserFormModalProps {
  open: boolean
  onClose: () => void
  user: UserWithRole | null
  profiles: Pick<Profile, 'id' | 'full_name'>[]
}

const ROLE_OPTIONS = APP_ROLES.map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}))

export function UserFormModal({ open, onClose, user, profiles }: UserFormModalProps) {
  const updateProfile = useUpdateProfile()
  const updateUserRole = useUpdateUserRole()

  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<AppRole>('setter')
  const [coachId, setCoachId] = useState('')

  const coachOptions = [
    { value: '', label: 'Aucun coach' },
    ...profiles
      .filter((p) => p.id !== user?.id)
      .map((p) => ({
        value: p.id,
        label: p.full_name,
      })),
  ]

  useEffect(() => {
    if (open && user) {
      setFullName(user.full_name)
      setRole(user.role)
      setCoachId(user.coach_id ?? '')
    }
  }, [open, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const promises: Promise<unknown>[] = []

    // Update profile fields
    promises.push(
      updateProfile.mutateAsync({
        id: user.id,
        full_name: fullName,
        coach_id: coachId || null,
      })
    )

    // Update role if changed
    if (role !== user.role) {
      promises.push(
        updateUserRole.mutateAsync({ userId: user.id, role })
      )
    }

    await Promise.all(promises)
    onClose()
  }

  const isLoading = updateProfile.isPending || updateUserRole.isPending

  if (!user) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Modifier l'utilisateur"
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <Input
          label="Email"
          value={user.email}
          disabled
          className="cursor-not-allowed opacity-60"
        />

        <Select
          label="Rôle"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(val) => setRole(val as AppRole)}
        />

        <Select
          label="Coach assigné"
          options={coachOptions}
          value={coachId}
          onChange={setCoachId}
          placeholder="Sélectionner un coach"
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" loading={isLoading}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
