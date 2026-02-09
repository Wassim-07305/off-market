import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { InstagramAccount } from '@/types/database'
import { instagramAccountSchema } from '@/types/forms'
import type { InstagramAccountFormData } from '@/types/forms'
import { useCreateInstagramAccount, useUpdateInstagramAccount } from '@/hooks/useInstagram'
import { useClients } from '@/hooks/useClients'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface InstagramFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: InstagramAccount | null
}

export function InstagramFormModal({ open, onClose, editItem }: InstagramFormModalProps) {
  const createMutation = useCreateInstagramAccount()
  const updateMutation = useUpdateInstagramAccount()
  const { data: clientsData } = useClients()
  const clients = clientsData?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InstagramAccountFormData>({
    resolver: zodResolver(instagramAccountSchema) as any,
    defaultValues: {
      client_id: '',
      username: '',
      followers: 0,
      following: 0,
      media_count: 0,
    },
  })

  useEffect(() => {
    if (editItem) {
      reset({
        client_id: editItem.client_id ?? '',
        username: editItem.username,
        followers: editItem.followers,
        following: editItem.following,
        media_count: editItem.media_count,
      })
    } else {
      reset({
        client_id: '',
        username: '',
        followers: 0,
        following: 0,
        media_count: 0,
      })
    }
  }, [editItem, reset, open])

  const onSubmit = (data: InstagramAccountFormData) => {
    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id, ...data },
        { onSuccess: () => onClose() }
      )
    } else {
      createMutation.mutate(data, { onSuccess: () => onClose() })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Modifier le compte' : 'Ajouter un compte Instagram'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Controller
          name="client_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Client"
              options={clientOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.client_id?.message}
              placeholder="Sélectionner un client..."
            />
          )}
        />

        <Input
          label="Nom d'utilisateur"
          placeholder="@username"
          {...register('username')}
          error={errors.username?.message}
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Followers"
            type="number"
            min="0"
            {...register('followers')}
            error={errors.followers?.message}
          />
          <Input
            label="Following"
            type="number"
            min="0"
            {...register('following')}
            error={errors.following?.message}
          />
          <Input
            label="Posts"
            type="number"
            min="0"
            {...register('media_count')}
            error={errors.media_count?.message}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {editItem ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
