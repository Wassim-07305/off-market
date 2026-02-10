import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formationSchema } from '@/types/forms'
import type { FormationFormData } from '@/types/forms'
import type { Formation } from '@/types/database'
import { useCreateFormation, useUpdateFormation } from '@/hooks/useFormations'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface FormationFormModalProps {
  open: boolean
  onClose: () => void
  formation?: Formation | null
}

export function FormationFormModal({ open, onClose, formation }: FormationFormModalProps) {
  const isEditing = !!formation
  const createFormation = useCreateFormation()
  const updateFormation = useUpdateFormation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormationFormData>({
    resolver: zodResolver(formationSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      thumbnail_url: '',
      is_published: false,
    },
  })

  useEffect(() => {
    if (formation) {
      reset({
        title: formation.title,
        description: formation.description ?? '',
        thumbnail_url: formation.thumbnail_url ?? '',
        is_published: formation.is_published,
      })
    } else {
      reset({
        title: '',
        description: '',
        thumbnail_url: '',
        is_published: false,
      })
    }
  }, [formation, reset])

  const onSubmit = async (data: FormationFormData) => {
    const clean = {
      title: data.title,
      description: data.description || undefined,
      thumbnail_url: data.thumbnail_url || undefined,
      is_published: data.is_published,
    }

    if (isEditing && formation) {
      await updateFormation.mutateAsync({ id: formation.id, ...clean })
    } else {
      await createFormation.mutateAsync(clean)
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier la formation' : 'Nouvelle formation'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Titre"
          {...register('title')}
          error={errors.title?.message}
        />

        <Textarea
          label="Description"
          {...register('description')}
          error={errors.description?.message}
        />

        <Input
          label="URL de la miniature"
          type="url"
          placeholder="https://..."
          {...register('thumbnail_url')}
          error={errors.thumbnail_url?.message}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...register('is_published')}
            className="h-4 w-4 rounded border-border"
          />
          <span className="font-medium text-foreground">Publier la formation</span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
