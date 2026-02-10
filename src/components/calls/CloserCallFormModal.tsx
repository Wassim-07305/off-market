import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CloserCallWithRelations } from '@/types/database'
import { closerCallSchema } from '@/types/forms'
import type { CloserCallFormData } from '@/types/forms'
import { useCreateCloserCall, useUpdateCloserCall } from '@/hooks/useCloserCalls'
import { useClients } from '@/hooks/useClients'
import { useLeadsByClient } from '@/hooks/useLeads'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CLOSER_CALL_STATUSES } from '@/lib/constants'
import type { CloserCallStatus } from '@/lib/constants'

interface CloserCallFormModalProps {
  open: boolean
  onClose: () => void
  call?: CloserCallWithRelations | null
}

const statusLabels: Record<CloserCallStatus, string> = {
  closé: 'Closé',
  non_closé: 'Non closé',
}

export function CloserCallFormModal({ open, onClose, call }: CloserCallFormModalProps) {
  const isEditing = !!call
  const createCall = useCreateCloserCall()
  const updateCall = useUpdateCloserCall()
  const { data: clientsData } = useClients()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
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

  const watchedClientId = watch('client_id')
  const watchedStatus = watch('status')
  const watchedLeadId = watch('lead_id')

  const { data: clientLeads } = useLeadsByClient(watchedClientId || undefined)

  useEffect(() => {
    if (call) {
      reset({
        client_id: call.client_id ?? '',
        lead_id: call.lead_id,
        closer_id: call.closer_id,
        date: call.date,
        status: call.status,
        revenue: call.revenue,
        nombre_paiements: call.nombre_paiements,
        link: call.link ?? '',
        debrief: call.debrief ?? '',
        notes: call.notes ?? '',
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
  }, [call, reset])

  const onSubmit = async (data: CloserCallFormData) => {
    const cleanData = {
      ...data,
      link: data.link || undefined,
      debrief: data.debrief || undefined,
      notes: data.notes || undefined,
    }

    if (isEditing && call) {
      await updateCall.mutateAsync({ id: call.id, ...cleanData })
    } else {
      await createCall.mutateAsync(cleanData)
    }
    onClose()
  }

  const clientOptions = (clientsData?.data ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const leadOptions = [
    { value: '', label: 'Aucun lead' },
    ...(clientLeads ?? []).map((l) => ({ value: l.id, label: l.name })),
  ]

  const statusOptions = CLOSER_CALL_STATUSES.map((s) => ({
    value: s,
    label: statusLabels[s],
  }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le closer call' : 'Nouveau closer call'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Client"
            options={clientOptions}
            value={watchedClientId}
            onChange={(val) => {
              setValue('client_id', val)
              setValue('lead_id', null)
            }}
            error={errors.client_id?.message}
          />
          <Select
            label="Lead"
            options={leadOptions}
            value={watchedLeadId ?? ''}
            onChange={(val) => setValue('lead_id', val || null)}
            error={errors.lead_id?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Date"
            type="date"
            {...register('date')}
            error={errors.date?.message}
          />
          <Select
            label="Statut"
            options={statusOptions}
            value={watchedStatus}
            onChange={(val) => setValue('status', val as CloserCallFormData['status'])}
            error={errors.status?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Revenue"
            type="number"
            step="0.01"
            {...register('revenue')}
            error={errors.revenue?.message}
          />
          <Input
            label="Nb paiements"
            type="number"
            min="1"
            {...register('nombre_paiements')}
            error={errors.nombre_paiements?.message}
          />
        </div>

        <Input
          label="Lien"
          type="url"
          placeholder="https://..."
          {...register('link')}
          error={errors.link?.message}
        />

        <Textarea
          label="Debrief"
          {...register('debrief')}
          error={errors.debrief?.message}
        />

        <Textarea
          label="Notes"
          {...register('notes')}
          error={errors.notes?.message}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Mettre a jour' : 'Creer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
