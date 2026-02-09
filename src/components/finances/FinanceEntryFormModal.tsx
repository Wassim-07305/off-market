import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FinancialEntry } from '@/types/database'
import { financialEntrySchema } from '@/types/forms'
import type { FinancialEntryFormData } from '@/types/forms'
import { useCreateFinancialEntry, useUpdateFinancialEntry } from '@/hooks/useFinances'
import { useClients } from '@/hooks/useClients'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FINANCIAL_TYPES, FINANCIAL_TYPE_LABELS, RECURRENCE_OPTIONS, RECURRENCE_LABELS } from '@/lib/constants'

interface FinanceEntryFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: FinancialEntry | null
}

export function FinanceEntryFormModal({ open, onClose, editItem }: FinanceEntryFormModalProps) {
  const createMutation = useCreateFinancialEntry()
  const updateMutation = useUpdateFinancialEntry()
  const { data: clientsData } = useClients()
  const clients = clientsData?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FinancialEntryFormData>({
    resolver: zodResolver(financialEntrySchema) as any,
    defaultValues: {
      client_id: '',
      type: 'ca',
      label: '',
      amount: 0,
      prestataire: '',
      is_paid: false,
      date: new Date().toISOString().split('T')[0],
      recurrence: null,
    },
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (editItem) {
      reset({
        client_id: editItem.client_id ?? '',
        type: editItem.type,
        label: editItem.label,
        amount: Number(editItem.amount),
        prestataire: editItem.prestataire ?? '',
        is_paid: editItem.is_paid,
        date: editItem.date,
        recurrence: editItem.recurrence ?? null,
      })
    } else {
      reset({
        client_id: '',
        type: 'ca',
        label: '',
        amount: 0,
        prestataire: '',
        is_paid: false,
        date: new Date().toISOString().split('T')[0],
        recurrence: null,
      })
    }
  }, [editItem, reset, open])

  const recurrenceOptions = [
    { value: '', label: 'Aucune récurrence' },
    ...RECURRENCE_OPTIONS.map((r) => ({ value: r, label: RECURRENCE_LABELS[r] })),
  ]

  const onSubmit = (data: FinancialEntryFormData) => {
    const cleanData = {
      ...data,
      prestataire: data.prestataire || undefined,
      recurrence: data.recurrence || null,
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
  const typeOptions = FINANCIAL_TYPES.map((t) => ({
    value: t,
    label: FINANCIAL_TYPE_LABELS[t],
  }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Modifier l\'entrée' : 'Nouvelle entrée financière'}
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
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Type"
              options={typeOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />

        <Input
          label="Libellé"
          {...register('label')}
          error={errors.label?.message}
        />

        <Input
          label="Montant"
          type="number"
          step="0.01"
          min="0"
          {...register('amount')}
          error={errors.amount?.message}
        />

        {selectedType === 'prestataire' && (
          <Input
            label="Prestataire"
            {...register('prestataire')}
            error={errors.prestataire?.message}
            placeholder="Nom du prestataire..."
          />
        )}

        {selectedType === 'récurrent' && (
          <Controller
            name="recurrence"
            control={control}
            render={({ field }) => (
              <Select
                label="Récurrence"
                options={recurrenceOptions}
                value={field.value ?? ''}
                onChange={(v) => field.onChange(v || null)}
                error={errors.recurrence?.message}
              />
            )}
          />
        )}

        <Input
          label="Date"
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />

        <Controller
          name="is_paid"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Payé"
              checked={field.value}
              onChange={(e) => field.onChange((e.target as HTMLInputElement).checked)}
            />
          )}
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
