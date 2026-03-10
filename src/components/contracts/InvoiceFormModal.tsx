import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useClients } from '@/hooks/useClients'
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/useContracts'
import { formatCurrency } from '@/lib/utils'
import type { Invoice } from '@/types/database'

const STATUS_OPTIONS = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoyee', label: 'Envoyée' },
  { value: 'payee', label: 'Payée' },
  { value: 'en_retard', label: 'En retard' },
]

interface InvoiceFormData {
  invoice_number: string
  client_id: string
  amount: number
  tax: number
  due_date: string
  status: string
  notes: string
}

interface InvoiceFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: Invoice | null
}

export function InvoiceFormModal({ open, onClose, editItem }: InvoiceFormModalProps) {
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()
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
  } = useForm<InvoiceFormData>({
    defaultValues: {
      invoice_number: '',
      client_id: '',
      amount: 0,
      tax: 20,
      due_date: '',
      status: 'brouillon',
      notes: '',
    },
  })

  const watchedStatus = watch('status')
  const watchedClientId = watch('client_id')
  const watchedAmount = watch('amount') || 0
  const watchedTax = watch('tax') || 0
  const computedTotal = watchedAmount + (watchedAmount * watchedTax / 100)

  useEffect(() => {
    if (editItem) {
      reset({
        invoice_number: editItem.invoice_number ?? '',
        client_id: editItem.client_id ?? '',
        amount: editItem.amount,
        tax: editItem.tax,
        due_date: editItem.due_date ?? '',
        status: editItem.status,
        notes: editItem.notes ?? '',
      })
    } else {
      reset({ invoice_number: '', client_id: '', amount: 0, tax: 20, due_date: '', status: 'brouillon', notes: '' })
    }
  }, [editItem, reset])

  const onSubmit = (data: InvoiceFormData) => {
    const total = data.amount + (data.amount * data.tax / 100)
    const payload = {
      invoice_number: data.invoice_number || null,
      client_id: data.client_id || null,
      amount: data.amount,
      tax: data.tax,
      total,
      due_date: data.due_date || null,
      status: data.status,
      notes: data.notes || null,
    }

    if (isEditing) {
      updateInvoice.mutate(
        { id: editItem.id, ...payload },
        { onSuccess: () => { reset(); onClose() } }
      )
    } else {
      createInvoice.mutate(payload, {
        onSuccess: () => { reset(); onClose() },
      })
    }
  }

  const isPending = createInvoice.isPending || updateInvoice.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier la facture' : 'Nouvelle facture'}
      description={isEditing ? 'Mettre à jour les informations de la facture.' : 'Créer une nouvelle facture.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="N° Facture"
          placeholder="FAC-001"
          {...register('invoice_number')}
          error={errors.invoice_number?.message}
        />

        <Select
          label="Client"
          options={[{ value: '', label: 'Sélectionner un client' }, ...clientOptions]}
          value={watchedClientId}
          onChange={(val) => setValue('client_id', val)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Montant HT *"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount', { required: 'Le montant est requis', valueAsNumber: true })}
            error={errors.amount?.message}
          />
          <Input
            label="TVA (%)"
            type="number"
            step="0.01"
            placeholder="20"
            {...register('tax', { valueAsNumber: true })}
            error={errors.tax?.message}
          />
        </div>

        <div className="rounded-lg bg-muted/30 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Total TTC :</span>{' '}
          <span className="font-semibold text-foreground">{formatCurrency(computedTotal)}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Date d'échéance"
            type="date"
            {...register('due_date')}
            error={errors.due_date?.message}
          />
          <Select
            label="Statut"
            options={STATUS_OPTIONS}
            value={watchedStatus}
            onChange={(val) => setValue('status', val)}
            error={errors.status?.message}
          />
        </div>

        <Textarea
          label="Notes"
          placeholder="Notes sur la facture..."
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
