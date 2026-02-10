import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useEleves } from '@/hooks/useEleves'
import { SearchInput } from '@/components/ui/search-input'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import { formatCurrency, getInitials } from '@/lib/utils'
import type { EleveWithStats } from '@/hooks/useEleves'

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Jamais'
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'En ligne'
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  return `Il y a ${days}j`
}

export default function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useEleves({
    search: search || undefined,
    page,
  })

  const eleves = data?.data ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Élèves</h1>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Rechercher un élève..."
          wrapperClassName="w-full sm:max-w-xs"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : eleves.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Aucun élève"
          description={
            search
              ? 'Aucun élève ne correspond à votre recherche.'
              : "Aucun élève n'est inscrit pour le moment."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eleves.map((eleve: EleveWithStats) => (
              <Card
                key={eleve.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20"
                onClick={() => navigate(`/eleves/${eleve.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-400/10 text-xs font-semibold text-red-300 ring-2 ring-red-500/10">
                      {eleve.avatar_url ? (
                        <img
                          src={eleve.avatar_url}
                          alt={eleve.full_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(eleve.full_name)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {eleve.full_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {eleve.email}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatTimeAgo(eleve.last_seen_at)}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Leads
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {eleve.leads_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        CA Total
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(eleve.ca_total)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalCount}
          />
        </>
      )}
    </div>
  )
}
