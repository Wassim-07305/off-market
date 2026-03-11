import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useClients } from '@/hooks/useClients'
import { useCreateContract, useUpdateContract } from '@/hooks/useContracts'
import type { Contract } from '@/types/database'

const STATUS_OPTIONS = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoye', label: 'Envoyé' },
  { value: 'signe', label: 'Signé' },
  { value: 'expire', label: 'Expiré' },
]

interface ContractFormData {
  title: string
  client_id: string
  content: string
  status: string
}

interface ContractFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: Contract | null
}

export function ContractFormModal({ open, onClose, editItem }: ContractFormModalProps) {
  const createContract = useCreateContract()
  const updateContract = useUpdateContract()
  const { data: clientsResult } = useClients({ page: 1 })
  const isEditing = !!editItem

  const clientOptions = (clientsResult?.data ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractFormData>({
    defaultValues: {
      title: '',
      client_id: '',
      content: '',
      status: 'brouillon',
    },
  })

  const watchedStatus = watch('status')
  const watchedClientId = watch('client_id')

  useEffect(() => {
    if (editItem) {
      reset({
        title: editItem.title,
        client_id: editItem.client_id ?? '',
        content: editItem.content ?? '',
        status: editItem.status,
      })
    } else {
      reset({ title: '', client_id: '', content: '', status: 'brouillon' })
    }
  }, [editItem, reset])

  const onSubmit = (data: ContractFormData) => {
    const payload = {
      title: data.title,
      client_id: data.client_id || null,
      content: data.content || null,
      status: data.status,
    }

    if (isEditing) {
      updateContract.mutate(
        { id: editItem.id, ...payload },
        { onSuccess: () => { reset(); onClose() } }
      )
    } else {
      createContract.mutate(payload, {
        onSuccess: () => { reset(); onClose() },
      })
    }
  }

  const isPending = createContract.isPending || updateContract.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le contrat' : 'Nouveau contrat'}
      description={isEditing ? 'Mettre à jour les informations du contrat.' : 'Créer un nouveau contrat.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Titre *"
          placeholder="Titre du contrat"
          {...register('title', { required: 'Le titre est requis' })}
          error={errors.title?.message}
        />

        <Select
          label="Client"
          options={[{ value: '', label: 'Sélectionner un client' }, ...clientOptions]}
          value={watchedClientId}
          onChange={(val) => setValue('client_id', val)}
        />

        <Select
          label="Statut"
          options={STATUS_OPTIONS}
          value={watchedStatus}
          onChange={(val) => setValue('status', val)}
          error={errors.status?.message}
        />

        <Textarea
          label="Contenu"
          placeholder="Contenu du contrat..."
          rows={8}
          {...register('content')}
          error={errors.content?.message}
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
