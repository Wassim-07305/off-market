import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateRitual, useUpdateRitual } from '@/hooks/useRituals'
import { ritualSchema } from '@/types/forms'
import type { RitualFormData } from '@/types/forms'
import type { Ritual } from '@/types/database'

const FREQUENCY_OPTIONS = [
  { value: 'quotidien', label: 'Quotidien' },
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'mensuel', label: 'Mensuel' },
]

interface RitualFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: Ritual | null
}

export function RitualFormModal({ open, onClose, editItem }: RitualFormModalProps) {
  const createRitual = useCreateRitual()
  const updateRitual = useUpdateRitual()
  const isEditing = !!editItem

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RitualFormData>({
    resolver: zodResolver(ritualSchema),
    defaultValues: {
      title: '',
      description: '',
      frequency: undefined,
    },
  })

  const watchedFrequency = watch('frequency')

  useEffect(() => {
    if (editItem) {
      reset({
        title: editItem.title,
        description: editItem.description ?? '',
        frequency: editItem.frequency,
      })
    } else {
      reset({ title: '', description: '', frequency: undefined })
    }
  }, [editItem, reset])

  const onSubmit = (data: RitualFormData) => {
    if (isEditing) {
      updateRitual.mutate(
        { id: editItem.id, ...data },
        { onSuccess: () => { reset(); onClose() } }
      )
    } else {
      createRitual.mutate(data, {
        onSuccess: () => { reset(); onClose() },
      })
    }
  }

  const isPending = createRitual.isPending || updateRitual.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le rituel' : 'Nouveau rituel'}
      description={isEditing ? 'Mettre à jour les informations du rituel.' : 'Ajouter un nouveau rituel.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Titre *"
          placeholder="Nom du rituel"
          {...register('title')}
          error={errors.title?.message}
        />

        <Select
          label="Fréquence"
          options={FREQUENCY_OPTIONS}
          value={watchedFrequency ?? ''}
          onChange={(val) => setValue('frequency', val ? val as RitualFormData['frequency'] : undefined)}
          placeholder="Sélectionner une fréquence"
          error={errors.frequency?.message}
        />

        <Textarea
          label="Description"
          placeholder="Description du rituel..."
          rows={3}
          {...register('description')}
          error={errors.description?.message}
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
