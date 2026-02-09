import { useState } from 'react'
import { Users } from 'lucide-react'
import { useUsers, useProfiles } from '@/hooks/useUsers'
import type { Profile, AppRole } from '@/types/database'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { UsersTable } from '@/components/users/UsersTable'
import { UserFormModal } from '@/components/users/UserFormModal'

interface UserWithRole extends Profile {
  role: AppRole
}

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const { data: profiles } = useProfiles()
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleRowClick = (user: UserWithRole) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedUser(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Gestion des Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les utilisateurs, leurs rôles et les coachs assignés.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !users || users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Aucun utilisateur"
          description="Aucun utilisateur n'a été trouvé."
        />
      ) : (
        <UsersTable
          data={users as UserWithRole[]}
          profiles={profiles ?? []}
          onRowClick={handleRowClick}
        />
      )}

      {/* Edit Modal */}
      <UserFormModal
        open={showModal}
        onClose={handleCloseModal}
        user={selectedUser}
        profiles={profiles ?? []}
      />
    </div>
  )
}
