import { useState, useCallback } from 'react'
import { Plus, BarChart3 } from 'lucide-react'
import { useInstagramAccounts } from '@/hooks/useInstagram'
import { AccountsList } from '@/components/instagram/AccountsList'
import { PostStatsTable } from '@/components/instagram/PostStatsTable'
import { InstagramFormModal } from '@/components/instagram/InstagramFormModal'
import { PostStatFormModal } from '@/components/instagram/PostStatFormModal'
import { Button } from '@/components/ui/button'
import type { InstagramAccount } from '@/types/database'

type InstagramAccountWithClient = InstagramAccount & { client?: { id: string; name: string } }

export default function InstagramPage() {
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<InstagramAccount | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<InstagramAccountWithClient | null>(null)
  const [statModalOpen, setStatModalOpen] = useState(false)

  const { data: accounts, isLoading } = useInstagramAccounts()

  const handleSelectAccount = useCallback((account: InstagramAccountWithClient) => {
    setSelectedAccount((prev) => (prev?.id === account.id ? null : account))
  }, [])

  const handleOpenCreateAccount = useCallback(() => {
    setEditAccount(null)
    setAccountModalOpen(true)
  }, [])

  const handleCloseAccountModal = useCallback(() => {
    setAccountModalOpen(false)
    setEditAccount(null)
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Instagram</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivi des comptes Instagram et statistiques des posts.
          </p>
        </div>
        <Button
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleOpenCreateAccount}
        >
          Ajouter un compte
        </Button>
      </div>

      <AccountsList
        accounts={accounts ?? []}
        isLoading={isLoading}
        selectedId={selectedAccount?.id}
        onSelect={handleSelectAccount}
      />

      {selectedAccount && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Stats pour @{selectedAccount.username}
              </h2>
            </div>
            <Button
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setStatModalOpen(true)}
            >
              Ajouter des stats
            </Button>
          </div>

          <PostStatsTable accountId={selectedAccount.id} />
        </div>
      )}

      <InstagramFormModal
        open={accountModalOpen}
        onClose={handleCloseAccountModal}
        editItem={editAccount}
      />

      {selectedAccount && (
        <PostStatFormModal
          open={statModalOpen}
          onClose={() => setStatModalOpen(false)}
          accountId={selectedAccount.id}
        />
      )}
    </div>
  )
}
