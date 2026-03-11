import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useInstagramAccounts } from '@/hooks/useInstagram'
import { useClients } from '@/hooks/useClients'
import { InstagramKPIs } from '@/components/instagram/InstagramKPIs'
import { InstagramAccountsTable } from '@/components/instagram/InstagramAccountsTable'
import { InstagramPostStatsTable } from '@/components/instagram/InstagramPostStatsTable'
import { InstagramAccountFormModal } from '@/components/instagram/InstagramAccountFormModal'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function InstagramPage() {
  usePageTitle('Instagram')
  const [clientFilter, setClientFilter] = useState<string>('')
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: clientsData } = useClients()
  const clients = useMemo(() => clientsData?.data ?? [], [clientsData?.data])

  const { data: accounts, isLoading } = useInstagramAccounts(clientFilter || undefined)

  const clientOptions = useMemo(
    () => [
      { value: '', label: 'Tous les clients' },
      ...clients.map((c) => ({ value: c.id, label: c.name })),
    ],
    [clients]
  )

  const selectedAccount = useMemo(
    () => accounts?.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Instagram</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivi des comptes Instagram et performances des publications.
          </p>
        </div>
      </div>

      <InstagramKPIs clientId={clientFilter || undefined} />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Select
            options={clientOptions}
            value={clientFilter}
            onChange={(v) => {
              setClientFilter(v)
              setSelectedAccountId(null)
            }}
            placeholder="Tous les clients"
            className="w-full sm:w-48"
          />
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            Ajouter un compte
          </Button>
        </div>

        <InstagramAccountsTable
          data={accounts ?? []}
          isLoading={isLoading}
          onSelect={(id) =>
            setSelectedAccountId((prev) => (prev === id ? null : id))
          }
        />
      </div>

      {selectedAccountId && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Statistiques des publications
              {selectedAccount && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  @{selectedAccount.username}
                </span>
              )}
            </h2>
          </div>
          <InstagramPostStatsTable accountId={selectedAccountId} />
        </Card>
      )}

      <InstagramAccountFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
