import { useCallback, useEffect, useState } from 'react'
import type { ChannelWithDetails, Profile } from '@/types/database'
import { useUpdateChannel, useDeleteChannel, useAddChannelMember, useRemoveChannelMember } from '@/hooks/useChannels'
import { useProfiles } from '@/hooks/useUsers'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'

interface ChannelSettingsModalProps {
  open: boolean
  onClose: () => void
  channel: ChannelWithDetails | null
  onDeleted?: () => void
}

const WRITE_MODE_OPTIONS = [
  { value: 'all', label: 'Tous les membres' },
  { value: 'admin_only', label: 'Admins uniquement' },
]

export function ChannelSettingsModal({ open, onClose, channel, onDeleted }: ChannelSettingsModalProps) {
  const updateChannel = useUpdateChannel()
  const deleteChannel = useDeleteChannel()
  const addMember = useAddChannelMember()
  const removeMember = useRemoveChannelMember()
  const { data: allProfiles } = useProfiles()

  const [name, setName] = useState('')
  const [writeMode, setWriteMode] = useState<string>('all')
  const [members, setMembers] = useState<{ user_id: string; profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'email'> }[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const loadMembers = useCallback(async () => {
    if (!channel) return
    setLoadingMembers(true)
    const { data } = await supabase
      .from('channel_members')
      .select('user_id, user:profiles!user_id(id, full_name, avatar_url, email)')
      .eq('channel_id', channel.id)
    setMembers(
      (data ?? []).map((m: any) => ({
        user_id: m.user_id,
        profile: m.user ?? undefined,
      }))
    )
    setLoadingMembers(false)
  }, [channel])

  useEffect(() => {
    if (open && channel) {
      setName(channel.name)
      setWriteMode(channel.write_mode)
      loadMembers()
    }
  }, [open, channel, loadMembers])

  const handleSave = async () => {
    if (!channel) return
    await updateChannel.mutateAsync({
      id: channel.id,
      name: name.trim(),
      write_mode: writeMode as 'all' | 'admin_only',
    })
    onClose()
  }

  const handleDelete = async () => {
    if (!channel) return
    if (!window.confirm('Supprimer ce canal ? Cette action est irréversible.')) return
    await deleteChannel.mutateAsync(channel.id)
    onDeleted?.()
    onClose()
  }

  const handleAddMember = async (userId: string) => {
    if (!channel) return
    await addMember.mutateAsync({ channelId: channel.id, userId })
    await loadMembers()
  }

  const handleRemoveMember = async (userId: string) => {
    if (!channel) return
    if (members.length <= 1) {
      toast.error('Le canal doit avoir au moins un membre')
      return
    }
    await removeMember.mutateAsync({ channelId: channel.id, userId })
    await loadMembers()
  }

  const memberIds = members.map((m) => m.user_id)
  const nonMembers = (allProfiles ?? []).filter((p) => !memberIds.includes(p.id))

  if (!channel) return null

  return (
    <Modal open={open} onClose={onClose} title="Paramètres du canal" size="lg">
      <div className="space-y-5">
        {/* Name and write mode */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nom du canal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            label="Qui peut écrire"
            options={WRITE_MODE_OPTIONS}
            value={writeMode}
            onChange={setWriteMode}
          />
        </div>

        {/* Members */}
        <div>
          <label className="text-sm font-medium text-foreground">
            Membres ({members.length})
          </label>
          <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border">
            {loadingMembers ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">Chargement...</p>
            ) : (
              members.map((m) => (
                <div
                  key={m.user_id}
                  className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-0"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                    {m.profile?.avatar_url ? (
                      <img src={m.profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      getInitials(m.profile?.full_name ?? '?')
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{m.profile?.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.profile?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(m.user_id)}
                    className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add members */}
        {nonMembers.length > 0 && (
          <div>
            <label className="text-sm font-medium text-foreground">Ajouter un membre</label>
            <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-border">
              {nonMembers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddMember(p.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      getInitials(p.full_name)
                    )}
                  </div>
                  <span className="truncate">{p.full_name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            loading={deleteChannel.isPending}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Supprimer le canal
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave} loading={updateChannel.isPending} disabled={!name.trim()}>
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
