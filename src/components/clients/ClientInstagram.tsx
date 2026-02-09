import { Instagram } from 'lucide-react'
import { useInstagramAccounts } from '@/hooks/useInstagram'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

interface ClientInstagramProps {
  clientId: string
}

function ClientInstagram({ clientId }: ClientInstagramProps) {
  const { data: accounts, isLoading } = useInstagramAccounts(clientId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )
  }

  if (!accounts || accounts.length === 0) {
    return (
      <EmptyState
        icon={<Instagram className="h-6 w-6" />}
        title="Aucun compte Instagram"
        description="Aucun compte Instagram associe a ce client."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Instagram className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  @{account.username}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">
                  {account.followers.toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {account.following.toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {account.media_count.toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export { ClientInstagram }
