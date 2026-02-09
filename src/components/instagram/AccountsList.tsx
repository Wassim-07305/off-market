import { Users, Clock } from 'lucide-react'
import type { InstagramAccount } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn, formatRelativeDate } from '@/lib/utils'

type InstagramAccountWithClient = InstagramAccount & { client?: { id: string; name: string } }

interface AccountsListProps {
  accounts: InstagramAccountWithClient[]
  isLoading: boolean
  selectedId?: string | null
  onSelect: (account: InstagramAccountWithClient) => void
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

export function AccountsList({ accounts, isLoading, selectedId, onSelect }: AccountsListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <Skeleton className="mb-3 h-5 w-32" />
              <Skeleton className="mb-2 h-4 w-24" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        title="Aucun compte Instagram"
        description="Ajoutez un compte Instagram pour commencer le suivi."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card
          key={account.id}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md',
            selectedId === account.id && 'ring-2 ring-primary shadow-md'
          )}
          onClick={() => onSelect(account)}
        >
          <CardContent className="py-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  @{account.username}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {account.client?.name ?? 'Client inconnu'}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white">
                <Users className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{formatNumber(account.followers)}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{formatNumber(account.following)}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{formatNumber(account.media_count)}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
            </div>

            {account.last_synced_at && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Synchro: {formatRelativeDate(account.last_synced_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
