import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { PaymentSchedule } from '@/types/database'
import { paymentScheduleSchema } from '@/types/forms'
import type { PaymentScheduleFormData } from '@/types/forms'
import { useCreatePaymentSchedule, useUpdatePaymentSchedule, useFinancialEntries } from '@/hooks/useFinances'
import { useClients } from '@/hooks/useClients'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface PaymentScheduleFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: PaymentSchedule | null
}

export function PaymentScheduleFormModal({ open, onClose, editItem }: PaymentScheduleFormModalProps) {
  const createMutation = useCreatePaymentSchedule()
  const updateMutation = useUpdatePaymentSchedule()
  const { data: clientsData } = useClients()
  const { data: entriesData } = useFinancialEntries()
  const clients = clientsData?.data ?? []
  const entries = entriesData?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentScheduleFormData>({
    resolver: zodResolver(paymentScheduleSchema) as any,
    defaultValues: {
      client_id: '',
      financial_entry_id: null,
      amount: 0,
      due_date: '',
      is_paid: false,
    },
  })

  useEffect(() => {
    if (editItem) {
      reset({
        client_id: editItem.client_id ?? '',
        financial_entry_id: editItem.financial_entry_id ?? null,
        amount: Number(editItem.amount),
        due_date: editItem.due_date,
        is_paid: editItem.is_paid,
      })
    } else {
      reset({
        client_id: '',
        financial_entry_id: null,
        amount: 0,
        due_date: '',
        is_paid: false,
      })
    }
  }, [editItem, reset, open])

  const onSubmit = (data: PaymentScheduleFormData) => {
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
  const entryOptions = [
    { value: '', label: 'Aucune' },
    ...entries.map((e) => ({ value: e.id, label: `${e.label} (${e.type})` })),
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Modifier l\'échéancier' : 'Nouvel échéancier'}
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
          name="financial_entry_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Entrée financière (optionnel)"
              options={entryOptions}
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              placeholder="Aucune"
            />
          )}
        />

        <Input
          label="Montant"
          type="number"
          step="0.01"
          min="0"
          {...register('amount')}
          error={errors.amount?.message}
        />

        <Input
          label="Date d'échéance"
          type="date"
          {...register('due_date')}
          error={errors.due_date?.message}
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
