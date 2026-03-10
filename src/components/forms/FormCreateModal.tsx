import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateForm } from '@/hooks/useForms'

const formCreateSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200, 'Le titre est trop long'),
  description: z.string().max(1000, 'La description est trop longue').optional().or(z.literal('')),
})

type FormCreateData = z.infer<typeof formCreateSchema>

interface FormCreateModalProps {
  open: boolean
  onClose: () => void
}

export function FormCreateModal({ open, onClose }: FormCreateModalProps) {
  const createForm = useCreateForm()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormCreateData>({
    resolver: zodResolver(formCreateSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  useEffect(() => {
    if (!open) {
      reset({ title: '', description: '' })
    }
  }, [open, reset])

  const onSubmit = (data: FormCreateData) => {
    createForm.mutate(
      { title: data.title, description: data.description || undefined },
      { onSuccess: () => { reset(); onClose() } }
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouveau formulaire"
      description="Créer un nouveau formulaire pour collecter des réponses."
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Titre *"
          placeholder="Titre du formulaire"
          {...register('title')}
          error={errors.title?.message}
        />

        <Textarea
          label="Description"
          placeholder="Description du formulaire..."
          rows={3}
          {...register('description')}
          error={errors.description?.message}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={createForm.isPending}>
            Créer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
