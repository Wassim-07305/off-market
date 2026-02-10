import { useState } from 'react'
import { useCreateChannel } from '@/hooks/useChannels'
import { useProfiles } from '@/hooks/useUsers'
import { useAuthStore } from '@/stores/auth-store'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MemberSelector } from './MemberSelector'

interface CreateChannelModalProps {
  open: boolean
  onClose: () => void
}

export function CreateChannelModal({ open, onClose }: CreateChannelModalProps) {
  const userId = useAuthStore((s) => s.user?.id)
  const createChannel = useCreateChannel()
  const { data: profiles } = useProfiles()
  const [name, setName] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !userId) return

    // Always include creator in member list
    const allMembers = Array.from(new Set([userId, ...memberIds]))

    await createChannel.mutateAsync({
      name: name.trim(),
      type: 'group',
      write_mode: 'all',
      member_ids: allMembers,
    })

    setName('')
    setMemberIds([])
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau canal" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom du canal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: Groupe VIP"
          required
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Membres</label>
          <MemberSelector
            profiles={(profiles ?? []) as any}
            selected={memberIds}
            onChange={setMemberIds}
            excludeIds={userId ? [userId] : []}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={createChannel.isPending} disabled={!name.trim()}>
            Créer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
