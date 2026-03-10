import { useState } from 'react'
import { useInstagramAccounts } from '@/hooks/useInstagram'
import { InstagramAccountsTable } from '@/components/instagram/InstagramAccountsTable'
import { InstagramPostStatsTable } from '@/components/instagram/InstagramPostStatsTable'

interface ClientInstagramProps {
  clientId: string
}

export function ClientInstagram({ clientId }: ClientInstagramProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const { data: accounts, isLoading } = useInstagramAccounts(clientId)

  return (
    <div className="space-y-6">
      <InstagramAccountsTable
        data={accounts ?? []}
        isLoading={isLoading}
        onSelect={(id) => setSelectedAccountId(id === selectedAccountId ? null : id)}
      />
      {selectedAccountId && (
        <InstagramPostStatsTable accountId={selectedAccountId} />
      )}
    </div>
  )
}
