import { useMemo } from 'react'
import { ClipboardList } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { InterviewWithRelations } from '@/types/database'
import { useInterviews } from '@/hooks/useInterviews'
import { useClientAssignments } from '@/hooks/useClientAssignments'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { INTERVIEW_STATUS_COLORS } from '@/lib/constants'
import type { InterviewStatus } from '@/lib/constants'
import { cn, formatDate } from '@/lib/utils'

interface ClientInterviewsProps {
  clientId: string
}

function ClientInterviews({ clientId }: ClientInterviewsProps) {
  const { data: assignments, isLoading: assignmentsLoading } = useClientAssignments(clientId)
  const { data: allInterviews, isLoading: interviewsLoading } = useInterviews()

  const memberIds = useMemo(
    () => new Set(assignments?.map((a) => a.user_id) ?? []),
    [assignments]
  )

  const interviews = useMemo(
    () =>
      (allInterviews ?? []).filter(
        (interview) => memberIds.has(interview.member_id)
      ),
    [allInterviews, memberIds]
  )

  const isLoading = assignmentsLoading || interviewsLoading

  const columns = useMemo<ColumnDef<InterviewWithRelations, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        accessorKey: 'coach',
        header: 'Coach',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.coach?.full_name ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'member',
        header: 'Membre',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.member?.full_name ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status as InterviewStatus
          return (
            <Badge className={cn(INTERVIEW_STATUS_COLORS[status])}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )
        },
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (interviews.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-6 w-6" />}
        title="Aucun entretien"
        description="Aucun entretien pour les membres de ce client."
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={interviews}
      pagination
      pageSize={10}
    />
  )
}

export { ClientInterviews }
