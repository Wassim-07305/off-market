import { useMemo } from 'react'
import { useCloserCalls } from '@/hooks/useCloserCalls'
import { CloserCallsTable } from '@/components/closer-calls/CloserCallsTable'
import { EmptyState } from '@/components/ui/empty-state'
import { PhoneCall } from 'lucide-react'

interface ClientCloserCallsProps {
  clientId: string
}

export function ClientCloserCalls({ clientId }: ClientCloserCallsProps) {
  const { data: result, isLoading } = useCloserCalls({ client_id: clientId })
  const calls = useMemo(() => result?.data ?? [], [result?.data])

  if (!isLoading && calls.length === 0) {
    return (
      <EmptyState
        icon={<PhoneCall className="h-10 w-10" />}
        title="Aucun appel closer"
        description="Aucun appel de closing enregistré pour ce client."
      />
    )
  }

  return <CloserCallsTable data={calls} isLoading={isLoading} />
}
