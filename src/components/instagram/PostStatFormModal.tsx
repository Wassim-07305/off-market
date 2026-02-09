import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { instagramPostStatSchema } from '@/types/forms'
import type { InstagramPostStatFormData } from '@/types/forms'
import { useCreateInstagramPostStat } from '@/hooks/useInstagram'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface PostStatFormModalProps {
  open: boolean
  onClose: () => void
  accountId: string
}

export function PostStatFormModal({ open, onClose, accountId }: PostStatFormModalProps) {
  const createMutation = useCreateInstagramPostStat()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InstagramPostStatFormData>({
    resolver: zodResolver(instagramPostStatSchema) as any,
    defaultValues: {
      account_id: accountId,
      post_url: '',
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      reach: 0,
      impressions: 0,
      engagement_rate: 0,
      posted_at: '',
    },
  })

  useEffect(() => {
    reset({
      account_id: accountId,
      post_url: '',
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      reach: 0,
      impressions: 0,
      engagement_rate: 0,
      posted_at: '',
    })
  }, [accountId, reset, open])

  const onSubmit = (data: InstagramPostStatFormData) => {
    const cleanData = {
      ...data,
      post_url: data.post_url || undefined,
      posted_at: data.posted_at || undefined,
    }
    createMutation.mutate(cleanData, { onSuccess: () => onClose() })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter des statistiques"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input type="hidden" {...register('account_id')} />

        <Input
          label="URL du post"
          type="url"
          placeholder="https://www.instagram.com/p/..."
          {...register('post_url')}
          error={errors.post_url?.message}
        />

        <Input
          label="Date de publication"
          type="date"
          {...register('posted_at')}
          error={errors.posted_at?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Likes"
            type="number"
            min="0"
            {...register('likes')}
            error={errors.likes?.message}
          />
          <Input
            label="Commentaires"
            type="number"
            min="0"
            {...register('comments')}
            error={errors.comments?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Partages"
            type="number"
            min="0"
            {...register('shares')}
            error={errors.shares?.message}
          />
          <Input
            label="Saves"
            type="number"
            min="0"
            {...register('saves')}
            error={errors.saves?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Reach"
            type="number"
            min="0"
            {...register('reach')}
            error={errors.reach?.message}
          />
          <Input
            label="Impressions"
            type="number"
            min="0"
            {...register('impressions')}
            error={errors.impressions?.message}
          />
        </div>

        <Input
          label="Taux d'engagement (%)"
          type="number"
          step="0.01"
          min="0"
          {...register('engagement_rate')}
          error={errors.engagement_rate?.message}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Ajouter
          </Button>
        </div>
      </form>
    </Modal>
  )
}
