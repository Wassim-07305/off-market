import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from '@/lib/utils'
import { APP_ROLES, ROLE_LABELS } from '@/lib/constants'
import type { Profile, AppRole } from '@/types/database'
import { useUpdateUserRole } from '@/hooks/useUsers'
import { DataTable } from '@/components/ui/data-table'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'

interface UserWithRole extends Profile {
  role: AppRole
}

interface UsersTableProps {
  data: UserWithRole[]
  profiles: Pick<Profile, 'id' | 'full_name'>[]
  onRowClick: (user: UserWithRole) => void
}

const ROLE_OPTIONS = APP_ROLES.map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}))

export function UsersTable({ data, profiles, onRowClick }: UsersTableProps) {
  const updateUserRole = useUpdateUserRole()

  const coachMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of profiles) {
      map.set(p.id, p.full_name)
    }
    return map
  }, [profiles])

  const columns = useMemo<ColumnDef<UserWithRole, unknown>[]>(
    () => [
      {
        id: 'full_name',
        header: 'Nom',
        accessorFn: (row) => row.full_name,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar
              src={row.original.avatar_url}
              name={row.original.full_name}
              size="sm"
            />
            <span className="text-sm font-medium text-foreground">
              {row.original.full_name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.email}
          </span>
        ),
      },
      {
        id: 'role',
        header: 'Rôle',
        accessorFn: (row) => row.role,
        cell: ({ row }) => (
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-40"
          >
            <Select
              options={ROLE_OPTIONS}
              value={row.original.role}
              onChange={(val) => {
                updateUserRole.mutate({
                  userId: row.original.id,
                  role: val as AppRole,
                })
              }}
            />
          </div>
        ),
      },
      {
        id: 'coach',
        header: 'Coach assigné',
        cell: ({ row }) => {
          const coachName = row.original.coach_id
            ? coachMap.get(row.original.coach_id)
            : null
          return (
            <span className="text-sm text-muted-foreground">
              {coachName ?? '-'}
            </span>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Date inscription',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
    ],
    [coachMap, updateUserRole]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={onRowClick}
      searchable
      searchPlaceholder="Rechercher un utilisateur..."
      pagination
      pageSize={15}
    />
  )
}
