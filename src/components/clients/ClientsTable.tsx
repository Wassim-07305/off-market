import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import type { Client } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { CLIENT_STATUS_COLORS } from '@/lib/constants'
import { cn, formatDate } from '@/lib/utils'

interface ClientsTableProps {
  data: Client[]
  className?: string
}

function ClientsTable({ data, className }: ClientsTableProps) {
  const navigate = useNavigate()

  const columns = useMemo<ColumnDef<Client, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nom',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.email || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Téléphone',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.phone || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <Badge className={cn(CLIENT_STATUS_COLORS[status])}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Date création',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
    ],
    []
  )

  const handleRowClick = (client: Client) => {
    navigate(`/clients/${client.id}`)
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={handleRowClick}
      pagination={false}
      className={className}
    />
  )
}

export { ClientsTable }
