import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  onItemsPerPageChange?: (count: number) => void
  itemsPerPageOptions?: number[]
  totalItems?: number
  className?: string
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  totalItems,
  className,
}: PaginationProps) {
  const pages = useMemo(() => {
    const result: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i)
      }
      return result
    }

    result.push(1)

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    if (start > 2) {
      result.push('ellipsis')
    }

    for (let i = start; i <= end; i++) {
      result.push(i)
    }

    if (end < totalPages - 1) {
      result.push('ellipsis')
    }

    result.push(totalPages)

    return result
  }, [currentPage, totalPages])

  if (totalPages <= 1) return null

  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {totalItems !== undefined && (
          <span>{totalItems} éléments</span>
        )}
        {onItemsPerPageChange && itemsPerPage && (
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">|</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className={cn(
                'h-8 rounded-md border border-border bg-background px-2 text-sm',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'cursor-pointer'
              )}
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm',
            'transition-all duration-200',
            'hover:bg-secondary',
            'disabled:pointer-events-none disabled:opacity-50',
            'cursor-pointer'
          )}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page, idx) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium',
                'transition-all duration-200',
                'cursor-pointer',
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm',
            'transition-all duration-200',
            'hover:bg-secondary',
            'disabled:pointer-events-none disabled:opacity-50',
            'cursor-pointer'
          )}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export { Pagination }
export type { PaginationProps }
