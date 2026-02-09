import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Client } from '@/types/database'
import { clientSchema } from '@/types/forms'
import type { ClientFormData } from '@/types/forms'
import { useCreateClient, useUpdateClient } from '@/hooks/useClients'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CLIENT_STATUSES } from '@/lib/constants'

interface ClientFormModalProps {
  open: boolean
  onClose: () => void
  client?: Client | null
}

const statusOptions = CLIENT_STATUSES.map((s) => ({
  value: s,
  label: s.charAt(0).toUpperCase() + s.slice(1),
}))

function ClientFormModal({ open, onClose, client }: ClientFormModalProps) {
  const isEdit = !!client
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
      status: 'actif',
    },
  })

  const statusValue = watch('status')

  useEffect(() => {
    if (open && client) {
      reset({
        name: client.name,
        email: client.email ?? '',
        phone: client.phone ?? '',
        notes: client.notes ?? '',
        status: client.status,
      })
    } else if (open) {
      reset({
        name: '',
        email: '',
        phone: '',
        notes: '',
        status: 'actif',
      })
    }
  }, [open, client, reset])

  const onSubmit = async (data: ClientFormData) => {
    if (isEdit && client) {
      await updateClient.mutateAsync({ id: client.id, ...data })
    } else {
      await createClient.mutateAsync(data)
    }
    onClose()
  }

  const isLoading = createClient.isPending || updateClient.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le client' : 'Nouveau client'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nom *"
          placeholder="Nom du client"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="email@exemple.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Téléphone"
          type="tel"
          placeholder="+33 6 00 00 00 00"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Select
          label="Statut"
          options={statusOptions}
          value={statusValue}
          onChange={(value) => setValue('status', value as ClientFormData['status'])}
          error={errors.status?.message}
        />

        <Textarea
          label="Notes"
          placeholder="Notes sur le client..."
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEdit ? 'Enregistrer' : 'Creer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export { ClientFormModal }
