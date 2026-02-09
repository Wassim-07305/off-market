import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { INTERVIEW_STATUS_COLORS } from '@/lib/constants'
import type { InterviewWithRelations } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface InterviewsTableProps {
  data: InterviewWithRelations[]
  onRowClick: (interview: InterviewWithRelations) => void
}

const STATUS_LABELS: Record<string, string> = {
  planifié: 'Planifié',
  réalisé: 'Réalisé',
  annulé: 'Annulé',
}

export function InterviewsTable({ data, onRowClick }: InterviewsTableProps) {
  const columns = useMemo<ColumnDef<InterviewWithRelations, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        id: 'coach',
        header: 'Coach',
        accessorFn: (row) => row.coach?.full_name ?? '',
        cell: ({ row }) => {
          const coach = row.original.coach
          if (!coach) return <span className="text-muted-foreground">-</span>
          return (
            <div className="flex items-center gap-2">
              <Avatar
                src={coach.avatar_url}
                name={coach.full_name}
                size="xs"
              />
              <span className="text-sm text-foreground">{coach.full_name}</span>
            </div>
          )
        },
      },
      {
        id: 'member',
        header: 'Membre',
        accessorFn: (row) => row.member?.full_name ?? '',
        cell: ({ row }) => {
          const member = row.original.member
          if (!member) return <span className="text-muted-foreground">-</span>
          return (
            <div className="flex items-center gap-2">
              <Avatar
                src={member.avatar_url}
                name={member.full_name}
                size="xs"
              />
              <span className="text-sm text-foreground">{member.full_name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <Badge
              className={cn(
                INTERVIEW_STATUS_COLORS[status as keyof typeof INTERVIEW_STATUS_COLORS]
              )}
            >
              {STATUS_LABELS[status] ?? status}
            </Badge>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation()
              onRowClick(row.original)
            }}
          >
            Voir
          </Button>
        ),
      },
    ],
    [onRowClick]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={onRowClick}
      pagination
      pageSize={10}
    />
  )
}
