import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { LeadWithRelations } from '@/types/database'
import { leadSchema } from '@/types/forms'
import type { LeadFormData } from '@/types/forms'
import { useCreateLead, useUpdateLead } from '@/hooks/useLeads'
import { useClients } from '@/hooks/useClients'
import { useProfiles } from '@/hooks/useUsers'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  CLIENT_SCOPE_STATUSES,
  CLIENT_SCOPE_STATUS_LABELS,
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
} from '@/lib/constants'

interface LeadFormModalProps {
  open: boolean
  onClose: () => void
  lead?: LeadWithRelations | null
}

export function LeadFormModal({ open, onClose, lead }: LeadFormModalProps) {
  const isEditing = !!lead
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()
  const { data: clientsData } = useClients()
  const { data: profiles } = useProfiles()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      source: undefined,
      status: 'à_relancer',
      client_status: 'contacté',
      client_id: null,
      assigned_to: null,
      ca_contracté: 0,
      ca_collecté: 0,
      commission_setter: 0,
      commission_closer: 0,
      notes: '',
    },
  })

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        email: lead.email ?? '',
        phone: lead.phone ?? '',
        source: lead.source ?? undefined,
        status: lead.status,
        client_status: lead.client_status,
        client_id: lead.client_id,
        assigned_to: lead.assigned_to,
        ca_contracté: lead.ca_contracté,
        ca_collecté: lead.ca_collecté,
        commission_setter: lead.commission_setter,
        commission_closer: lead.commission_closer,
        notes: lead.notes ?? '',
      })
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        source: undefined,
        status: 'à_relancer',
        client_status: 'contacté',
        client_id: null,
        assigned_to: null,
        ca_contracté: 0,
        ca_collecté: 0,
        commission_setter: 0,
        commission_closer: 0,
        notes: '',
      })
    }
  }, [lead, reset])

  const onSubmit = async (data: LeadFormData) => {
    const cleanData = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      source: data.source || undefined,
      notes: data.notes || undefined,
    }

    if (isEditing && lead) {
      await updateLead.mutateAsync({ id: lead.id, ...cleanData })
    } else {
      await createLead.mutateAsync(cleanData)
    }
    onClose()
  }

  const sourceOptions = [
    { value: '', label: 'Aucune source' },
    ...LEAD_SOURCES.map((s) => ({ value: s, label: LEAD_SOURCE_LABELS[s] })),
  ]

  const statusOptions = LEAD_STATUSES.map((s) => ({
    value: s,
    label: LEAD_STATUS_LABELS[s],
  }))

  const clientStatusOptions = CLIENT_SCOPE_STATUSES.map((s) => ({
    value: s,
    label: CLIENT_SCOPE_STATUS_LABELS[s],
  }))

  const clientOptions = [
    { value: '', label: 'Aucun client' },
    ...(clientsData?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
  ]

  const profileOptions = [
    { value: '', label: 'Non assigne' },
    ...(profiles ?? []).map((p) => ({ value: p.id, label: p.full_name })),
  ]

  const watchedSource = watch('source')
  const watchedStatus = watch('status')
  const watchedClientStatus = watch('client_status')
  const watchedClientId = watch('client_id')
  const watchedAssignedTo = watch('assigned_to')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le lead' : 'Nouveau lead'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nom"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Téléphone"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Select
            label="Source"
            options={sourceOptions}
            value={watchedSource ?? ''}
            onChange={(val) => setValue('source', val === '' ? undefined : val as LeadFormData['source'])}
            error={errors.source?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Statut"
            options={statusOptions}
            value={watchedStatus}
            onChange={(val) => setValue('status', val as LeadFormData['status'])}
            error={errors.status?.message}
          />
          <Select
            label="Statut Client"
            options={clientStatusOptions}
            value={watchedClientStatus}
            onChange={(val) => setValue('client_status', val as LeadFormData['client_status'])}
            error={errors.client_status?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Client"
            options={clientOptions}
            value={watchedClientId ?? ''}
            onChange={(val) => setValue('client_id', val || null)}
            error={errors.client_id?.message}
          />
          <Select
            label="Assigné à"
            options={profileOptions}
            value={watchedAssignedTo ?? ''}
            onChange={(val) => setValue('assigned_to', val || null)}
            error={errors.assigned_to?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input
            label="CA Contracté"
            type="number"
            step="0.01"
            {...register('ca_contracté')}
            error={errors.ca_contracté?.message}
          />
          <Input
            label="CA Collecté"
            type="number"
            step="0.01"
            {...register('ca_collecté')}
            error={errors.ca_collecté?.message}
          />
          <Input
            label="Com. Setter"
            type="number"
            step="0.01"
            {...register('commission_setter')}
            error={errors.commission_setter?.message}
          />
          <Input
            label="Com. Closer"
            type="number"
            step="0.01"
            {...register('commission_closer')}
            error={errors.commission_closer?.message}
          />
        </div>

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
