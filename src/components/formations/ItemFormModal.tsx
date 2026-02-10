import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { moduleItemSchema } from '@/types/forms'
import type { ModuleItemFormData } from '@/types/forms'
import type { ModuleItem } from '@/types/database'
import { useCreateModuleItem, useUpdateModuleItem } from '@/hooks/useModuleItems'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface ItemFormModalProps {
  open: boolean
  onClose: () => void
  moduleId: string
  item?: ModuleItem | null
  nextSortOrder?: number
}

const TYPE_OPTIONS = [
  { value: 'video', label: 'Vidéo' },
  { value: 'document', label: 'Document' },
]

export function ItemFormModal({ open, onClose, moduleId, item, nextSortOrder = 0 }: ItemFormModalProps) {
  const isEditing = !!item
  const createItem = useCreateModuleItem()
  const updateItem = useUpdateModuleItem()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ModuleItemFormData>({
    resolver: zodResolver(moduleItemSchema) as any,
    defaultValues: {
      module_id: moduleId,
      title: '',
      type: 'video',
      url: '',
      duration: undefined,
    },
  })

  const watchedType = watch('type')

  useEffect(() => {
    if (item) {
      reset({
        module_id: moduleId,
        title: item.title,
        type: item.type,
        url: item.url ?? '',
        duration: item.duration ?? undefined,
      })
    } else {
      reset({
        module_id: moduleId,
        title: '',
        type: 'video',
        url: '',
        duration: undefined,
      })
    }
  }, [item, moduleId, reset])

  const onSubmit = async (data: ModuleItemFormData) => {
    const clean = {
      title: data.title,
      type: data.type,
      url: data.url || undefined,
      duration: data.duration || undefined,
    }

    if (isEditing && item) {
      await updateItem.mutateAsync({ id: item.id, ...clean })
    } else {
      await createItem.mutateAsync({
        module_id: moduleId,
        ...clean,
        sort_order: nextSortOrder,
      })
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier l\'item' : 'Nouvel item'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Titre"
          {...register('title')}
          error={errors.title?.message}
        />

        <Select
          label="Type"
          options={TYPE_OPTIONS}
          value={watchedType}
          onChange={(val) => setValue('type', val as 'video' | 'document')}
          error={errors.type?.message}
        />

        <Input
          label="URL"
          type="url"
          placeholder={watchedType === 'video' ? 'https://youtube.com/...' : 'https://...'}
          {...register('url')}
          error={errors.url?.message}
        />

        {watchedType === 'video' && (
          <Input
            label="Durée (minutes)"
            type="number"
            min="0"
            {...register('duration')}
            error={errors.duration?.message}
          />
        )}

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
