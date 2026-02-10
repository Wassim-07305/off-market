import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CallCalendarWithRelations } from '@/types/database'
import { callCalendarSchema } from '@/types/forms'
import type { CallCalendarFormData } from '@/types/forms'
import { useCreateCall, useUpdateCall } from '@/hooks/useCallCalendar'
import { useClients } from '@/hooks/useClients'
import { useLeadsByClient } from '@/hooks/useLeads'
import { useProfiles } from '@/hooks/useUsers'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  CALL_TYPES,
  CALL_TYPE_LABELS,
  CALL_STATUSES,
  CALL_STATUS_LABELS,
} from '@/lib/constants'

interface CallFormModalProps {
  open: boolean
  onClose: () => void
  call?: CallCalendarWithRelations | null
}

export function CallFormModal({ open, onClose, call }: CallFormModalProps) {
  const isEditing = !!call
  const createCall = useCreateCall()
  const updateCall = useUpdateCall()
  const { data: clientsData } = useClients()
  const { data: profiles } = useProfiles()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CallCalendarFormData>({
    resolver: zodResolver(callCalendarSchema) as any,
    defaultValues: {
      client_id: '',
      lead_id: null,
      assigned_to: null,
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      type: 'manuel',
      status: 'planifié',
      link: '',
      notes: '',
    },
  })

  const watchedClientId = watch('client_id')
  const watchedType = watch('type')
  const watchedStatus = watch('status')
  const watchedLeadId = watch('lead_id')
  const watchedAssignedTo = watch('assigned_to')

  const { data: clientLeads } = useLeadsByClient(
    watchedClientId || undefined
  )

  useEffect(() => {
    if (call) {
      reset({
        client_id: call.client_id ?? '',
        lead_id: call.lead_id,
        assigned_to: call.assigned_to,
        date: call.date,
        time: call.time,
        type: call.type,
        status: call.status,
        link: call.link ?? '',
        notes: call.notes ?? '',
      })
    } else {
      reset({
        client_id: '',
        lead_id: null,
        assigned_to: null,
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'manuel',
        status: 'planifié',
        link: '',
        notes: '',
      })
    }
  }, [call, reset])

  const onSubmit = async (data: CallCalendarFormData) => {
    const cleanData = {
      ...data,
      link: data.link || undefined,
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

  const profileOptions = [
    { value: '', label: 'Non assigne' },
    ...(profiles ?? []).map((p) => ({ value: p.id, label: p.full_name })),
  ]

  const typeOptions = CALL_TYPES.map((t) => ({
    value: t,
    label: CALL_TYPE_LABELS[t],
  }))

  const statusOptions = CALL_STATUSES.map((s) => ({
    value: s,
    label: CALL_STATUS_LABELS[s],
  }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le call' : 'Nouveau call'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Date"
            type="date"
            {...register('date')}
            error={errors.date?.message}
          />
          <Input
            label="Heure"
            type="time"
            {...register('time')}
            error={errors.time?.message}
          />
        </div>

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
          <Select
            label="Type"
            options={typeOptions}
            value={watchedType}
            onChange={(val) => setValue('type', val as CallCalendarFormData['type'])}
            error={errors.type?.message}
          />
          <Select
            label="Statut"
            options={statusOptions}
            value={watchedStatus}
            onChange={(val) => setValue('status', val as CallCalendarFormData['status'])}
            error={errors.status?.message}
          />
        </div>

        <Select
          label="Assigné à"
          options={profileOptions}
          value={watchedAssignedTo ?? ''}
          onChange={(val) => setValue('assigned_to', val || null)}
          error={errors.assigned_to?.message}
        />

        <Input
          label="Lien de la reunion"
          type="url"
          placeholder="https://..."
          {...register('link')}
          error={errors.link?.message}
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
            {isEditing ? 'Mettre a jour' : 'Planifier'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
