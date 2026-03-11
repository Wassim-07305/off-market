import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateClient, useUpdateClient } from '@/hooks/useClients'
import { clientSchema } from '@/types/forms'
import type { ClientFormData } from '@/types/forms'
import type { Client } from '@/types/database'

const STATUS_OPTIONS = [
  { value: 'actif', label: 'Actif' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'archivé', label: 'Archivé' },
]

interface ClientFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: Client | null
}

export function ClientFormModal({ open, onClose, editItem }: ClientFormModalProps) {
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const isEditing = !!editItem

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
      status: 'actif',
    },
  })

  const watchedStatus = watch('status')

  useEffect(() => {
    if (editItem) {
      reset({
        name: editItem.name,
        email: editItem.email ?? '',
        phone: editItem.phone ?? '',
        notes: editItem.notes ?? '',
        status: editItem.status,
      })
    } else {
      reset({ name: '', email: '', phone: '', notes: '', status: 'actif' })
    }
  }, [editItem, reset])

  const onSubmit = (data: ClientFormData) => {
    if (isEditing) {
      updateClient.mutate(
        { id: editItem.id, ...data },
        { onSuccess: () => { reset(); onClose() } }
      )
    } else {
      createClient.mutate(data, {
        onSuccess: () => { reset(); onClose() },
      })
    }
  }

  const isPending = createClient.isPending || updateClient.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le client' : 'Nouveau client'}
      description={isEditing ? 'Mettre à jour les informations du client.' : 'Ajouter un nouveau client au CRM.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nom *"
          placeholder="Nom du client"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            placeholder="email@exemple.fr"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Téléphone"
            placeholder="06 12 34 56 78"
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>

        <Select
          label="Statut"
          options={STATUS_OPTIONS}
          value={watchedStatus}
          onChange={(val) => setValue('status', val as ClientFormData['status'])}
          error={errors.status?.message}
        />

        <Textarea
          label="Notes"
          placeholder="Notes sur le client..."
          rows={3}
          {...register('notes')}
          error={errors.notes?.message}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={isPending}>
            {isEditing ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
