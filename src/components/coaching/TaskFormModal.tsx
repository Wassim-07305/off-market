import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateTask, useUpdateTask } from '@/hooks/useCoaching'
import { studentTaskSchema } from '@/types/forms'
import type { StudentTaskFormData } from '@/types/forms'
import type { StudentTask } from '@/types/database'

const PRIORITY_OPTIONS = [
  { value: 'haute', label: 'Haute' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'basse', label: 'Basse' },
]

const STATUS_OPTIONS = [
  { value: 'a_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' },
]

interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: StudentTask | null
}

export function TaskFormModal({ open, onClose, editItem }: TaskFormModalProps) {
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const isEditing = !!editItem

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentTaskFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(studentTaskSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      due_date: '',
      priority: 'moyenne',
      status: 'a_faire',
    },
  })

  const watchedPriority = watch('priority')
  const watchedStatus = watch('status')

  useEffect(() => {
    if (editItem) {
      reset({
        title: editItem.title,
        description: editItem.description ?? '',
        due_date: editItem.due_date ? editItem.due_date.split('T')[0] : '',
        priority: editItem.priority as StudentTaskFormData['priority'],
        status: editItem.status as StudentTaskFormData['status'],
      })
    } else {
      reset({ title: '', description: '', due_date: '', priority: 'moyenne', status: 'a_faire' })
    }
  }, [editItem, reset])

  const onSubmit = (data: StudentTaskFormData) => {
    if (isEditing) {
      updateTask.mutate(
        { id: editItem.id, ...data },
        { onSuccess: () => { reset(); onClose() } }
      )
    } else {
      createTask.mutate(data, {
        onSuccess: () => { reset(); onClose() },
      })
    }
  }

  const isPending = createTask.isPending || updateTask.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}
      description={isEditing ? 'Mettre à jour les informations de la tâche.' : 'Assigner une nouvelle tâche.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Titre *"
          placeholder="Ex: Envoyer 50 DMs cette semaine"
          {...register('title')}
          error={errors.title?.message}
        />

        <Textarea
          label="Description"
          placeholder="Détails sur la tâche..."
          rows={3}
          {...register('description')}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Priorité"
            options={PRIORITY_OPTIONS}
            value={watchedPriority}
            onChange={(val) => setValue('priority', val as StudentTaskFormData['priority'])}
            error={errors.priority?.message}
          />
          <Select
            label="Statut"
            options={STATUS_OPTIONS}
            value={watchedStatus}
            onChange={(val) => setValue('status', val as StudentTaskFormData['status'])}
            error={errors.status?.message}
          />
        </div>

        <Input
          label="Échéance"
          type="date"
          {...register('due_date')}
          error={errors.due_date?.message}
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
