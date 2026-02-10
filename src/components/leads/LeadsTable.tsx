import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'
import { useState } from 'react'
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react'
import type { LeadWithRelations } from '@/types/database'
import { useUpdateLead, useDeleteLead } from '@/hooks/useLeads'
import { Badge } from '@/components/ui/badge'
import { InlineEdit } from '@/components/ui/inline-edit'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn, formatDate } from '@/lib/utils'
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
} from '@/lib/constants'
import type { LeadStatus } from '@/lib/constants'

interface LeadsTableProps {
  data: LeadWithRelations[]
  isLoading: boolean
  onEdit?: (lead: LeadWithRelations) => void
}

const columnHelper = createColumnHelper<LeadWithRelations>()

export function LeadsTable({ data, isLoading, onEdit }: LeadsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()

  const columns = useMemo(
    () => [
      columnHelper.accessor('created_at', {
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nom
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: (info) => (
          <span className="text-sm font-medium text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() ?? '-'}
          </span>
        ),
      }),
      columnHelper.accessor('source', {
        header: 'Source',
        cell: (info) => {
          const source = info.getValue()
          return source ? (
            <Badge variant="secondary">
              {LEAD_SOURCE_LABELS[source]}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )
        },
      }),
      columnHelper.accessor('status', {
        header: 'Statut',
        cell: (info) => {
          const lead = info.row.original
          const status = info.getValue()
          return (
            <select
              value={status}
              onChange={(e) => {
                updateLead.mutate({
                  id: lead.id,
                  status: e.target.value as LeadStatus,
                })
              }}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                LEAD_STATUS_COLORS[status]
              )}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          )
        },
      }),
      columnHelper.accessor('ca_contracté', {
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            CA Contracté
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: (info) => {
          const lead = info.row.original
          return (
            <InlineEdit
              value={String(info.getValue())}
              onSave={(val) => {
                const num = parseFloat(val)
                if (!isNaN(num)) {
                  updateLead.mutate({ id: lead.id, ca_contracté: num })
                }
              }}
              textClassName="font-mono"
            />
          )
        },
      }),
      columnHelper.accessor('ca_collecté', {
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            CA Collecté
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: (info) => {
          const lead = info.row.original
          return (
            <InlineEdit
              value={String(info.getValue())}
              onSave={(val) => {
                const num = parseFloat(val)
                if (!isNaN(num)) {
                  updateLead.mutate({ id: lead.id, ca_collecté: num })
                }
              }}
              textClassName="font-mono"
            />
          )
        },
      }),
      columnHelper.accessor('commission_setter', {
        header: 'Com. Setter',
        cell: (info) => {
          const lead = info.row.original
          return (
            <InlineEdit
              value={String(info.getValue())}
              onSave={(val) => {
                const num = parseFloat(val)
                if (!isNaN(num)) {
                  updateLead.mutate({ id: lead.id, commission_setter: num })
                }
              }}
              textClassName="font-mono"
            />
          )
        },
      }),
      columnHelper.accessor('commission_closer', {
        header: 'Com. Closer',
        cell: (info) => {
          const lead = info.row.original
          return (
            <InlineEdit
              value={String(info.getValue())}
              onSave={(val) => {
                const num = parseFloat(val)
                if (!isNaN(num)) {
                  updateLead.mutate({ id: lead.id, commission_closer: num })
                }
              }}
              textClassName="font-mono"
            />
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => {
          const lead = info.row.original
          return (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(lead)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirm('Supprimer ce lead ?')) {
                    deleteLead.mutate(lead.id)
                  }
                }}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        },
      }),
    ],
    [updateLead, deleteLead, onEdit]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="Aucun lead"
        description="Aucun lead ne correspond à vos critères de recherche."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border bg-secondary/50">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border transition-colors hover:bg-secondary/30"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
