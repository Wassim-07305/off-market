import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formationModuleSchema } from '@/types/forms'
import type { FormationModuleFormData } from '@/types/forms'
import type { FormationModule } from '@/types/database'
import { useCreateModule, useUpdateModule } from '@/hooks/useModules'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface ModuleFormModalProps {
  open: boolean
  onClose: () => void
  formationId: string
  module?: FormationModule | null
  nextSortOrder?: number
}

export function ModuleFormModal({ open, onClose, formationId, module, nextSortOrder = 0 }: ModuleFormModalProps) {
  const isEditing = !!module
  const createModule = useCreateModule()
  const updateModule = useUpdateModule()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormationModuleFormData>({
    resolver: zodResolver(formationModuleSchema) as any,
    defaultValues: {
      formation_id: formationId,
      title: '',
      description: '',
    },
  })

  useEffect(() => {
    if (module) {
      reset({
        formation_id: formationId,
        title: module.title,
        description: module.description ?? '',
      })
    } else {
      reset({
        formation_id: formationId,
        title: '',
        description: '',
      })
    }
  }, [module, formationId, reset])

  const onSubmit = async (data: FormationModuleFormData) => {
    if (isEditing && module) {
      await updateModule.mutateAsync({
        id: module.id,
        title: data.title,
        description: data.description || undefined,
      })
    } else {
      await createModule.mutateAsync({
        formation_id: formationId,
        title: data.title,
        description: data.description || undefined,
        sort_order: nextSortOrder,
      })
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le module' : 'Nouveau module'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Titre du module"
          {...register('title')}
          error={errors.title?.message}
        />

        <Textarea
          label="Description"
          {...register('description')}
          error={errors.description?.message}
        />

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
