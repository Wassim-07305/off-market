import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateGoal, useUpdateGoal } from '@/hooks/useCoaching'
import { coachingGoalSchema } from '@/types/forms'
import type { CoachingGoalFormData } from '@/types/forms'
import type { CoachingGoal } from '@/types/database'

const STATUS_OPTIONS = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'atteint', label: 'Atteint' },
  { value: 'abandonné', label: 'Abandonné' },
]

interface GoalFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: CoachingGoal | null
}

export function GoalFormModal({ open, onClose, editItem }: GoalFormModalProps) {
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const isEditing = !!editItem

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CoachingGoalFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(coachingGoalSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      target_value: 0,
      unit: '',
      deadline: '',
      status: 'en_cours',
    },
  })

  const watchedStatus = watch('status')

  useEffect(() => {
    if (editItem) {
      reset({
        title: editItem.title,
        description: editItem.description ?? '',
        target_value: editItem.target_value,
        unit: editItem.unit ?? '',
        deadline: editItem.deadline ?? '',
        status: editItem.status as CoachingGoalFormData['status'],
      })
    } else {
      reset({ title: '', description: '', target_value: 0, unit: '', deadline: '', status: 'en_cours' })
    }
  }, [editItem, reset])

  const onSubmit = (data: CoachingGoalFormData) => {
    if (isEditing) {
      updateGoal.mutate(
        { id: editItem.id, ...data },
        { onSuccess: () => { reset(); onClose() } }
      )
    } else {
      createGoal.mutate(data, {
        onSuccess: () => { reset(); onClose() },
      })
    }
  }

  const isPending = createGoal.isPending || updateGoal.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Modifier l'objectif" : 'Nouvel objectif'}
      description={isEditing ? "Mettre à jour les informations de l'objectif." : 'Définir un nouvel objectif de coaching.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Titre *"
          placeholder="Ex: Atteindre 10K€ de CA mensuel"
          {...register('title')}
          error={errors.title?.message}
        />

        <Textarea
          label="Description"
          placeholder="Détails sur l'objectif..."
          rows={3}
          {...register('description')}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Valeur cible *"
            type="number"
            placeholder="10000"
            {...register('target_value')}
            error={errors.target_value?.message}
          />
          <Input
            label="Unité"
            placeholder="Ex: €, appels, clients"
            {...register('unit')}
            error={errors.unit?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Échéance"
            type="date"
            {...register('deadline')}
            error={errors.deadline?.message}
          />
          <Select
            label="Statut"
            options={STATUS_OPTIONS}
            value={watchedStatus}
            onChange={(val) => setValue('status', val as CoachingGoalFormData['status'])}
            error={errors.status?.message}
          />
        </div>

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
