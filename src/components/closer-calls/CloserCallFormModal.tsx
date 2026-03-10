import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CloserCall } from '@/types/database'
import { closerCallSchema } from '@/types/forms'
import type { CloserCallFormData } from '@/types/forms'
import { useCreateCloserCall, useUpdateCloserCall } from '@/hooks/useCloserCalls'
import { useClients } from '@/hooks/useClients'
import { useLeads } from '@/hooks/useLeads'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CLOSER_CALL_STATUSES, CLOSER_CALL_STATUS_LABELS } from '@/lib/constants'

interface CloserCallFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: CloserCall | null
}

export function CloserCallFormModal({ open, onClose, editItem }: CloserCallFormModalProps) {
  const createMutation = useCreateCloserCall()
  const updateMutation = useUpdateCloserCall()
  const { data: clientsData } = useClients()
  const clients = clientsData?.data ?? []
  const { data: leadsData } = useLeads()
  const leads = leadsData?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CloserCallFormData>({
    resolver: zodResolver(closerCallSchema) as any,
    defaultValues: {
      client_id: '',
      lead_id: null,
      closer_id: null,
      date: new Date().toISOString().split('T')[0],
      status: 'non_closé',
      revenue: 0,
      nombre_paiements: 1,
      link: '',
      debrief: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (editItem) {
      reset({
        client_id: editItem.client_id ?? '',
        lead_id: editItem.lead_id ?? null,
        closer_id: editItem.closer_id ?? null,
        date: editItem.date,
        status: editItem.status,
        revenue: Number(editItem.revenue),
        nombre_paiements: editItem.nombre_paiements,
        link: editItem.link ?? '',
        debrief: editItem.debrief ?? '',
        notes: editItem.notes ?? '',
      })
    } else {
      reset({
        client_id: '',
        lead_id: null,
        closer_id: null,
        date: new Date().toISOString().split('T')[0],
        status: 'non_closé',
        revenue: 0,
        nombre_paiements: 1,
        link: '',
        debrief: '',
        notes: '',
      })
    }
  }, [editItem, reset, open])

  const onSubmit = (data: CloserCallFormData) => {
    const cleanData = {
      ...data,
      lead_id: data.lead_id || null,
      closer_id: data.closer_id || null,
      link: data.link || undefined,
      debrief: data.debrief || undefined,
      notes: data.notes || undefined,
    }

    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id, ...cleanData },
        { onSuccess: () => onClose() }
      )
    } else {
      createMutation.mutate(cleanData, { onSuccess: () => onClose() })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }))
  const leadOptions = [
    { value: '', label: 'Aucun lead' },
    ...leads.map((l) => ({ value: l.id, label: l.name })),
  ]
  const statusOptions = CLOSER_CALL_STATUSES.map((s) => ({
    value: s,
    label: CLOSER_CALL_STATUS_LABELS[s],
  }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? "Modifier l'appel closer" : 'Nouvel appel closer'}
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

        <Controller
          name="lead_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Lead"
              options={leadOptions}
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              error={errors.lead_id?.message}
              placeholder="Sélectionner un lead..."
            />
          )}
        />

        <Input
          label="Date"
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Statut"
              options={statusOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.status?.message}
            />
          )}
        />

        <Input
          label="Revenu"
          type="number"
          step="0.01"
          min="0"
          {...register('revenue')}
          error={errors.revenue?.message}
        />

        <Input
          label="Nombre de paiements"
          type="number"
          step="1"
          min="0"
          {...register('nombre_paiements')}
          error={errors.nombre_paiements?.message}
        />

        <Input
          label="Lien (replay, etc.)"
          type="url"
          {...register('link')}
          error={errors.link?.message}
          placeholder="https://..."
        />

        <Input
          label="Debrief"
          {...register('debrief')}
          error={errors.debrief?.message}
          placeholder="Points clés du debrief..."
        />

        <Input
          label="Notes"
          {...register('notes')}
          error={errors.notes?.message}
          placeholder="Notes additionnelles..."
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {editItem ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
