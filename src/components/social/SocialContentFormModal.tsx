import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SocialContent } from '@/types/database'
import { socialContentSchema } from '@/types/forms'
import type { SocialContentFormData } from '@/types/forms'
import { useCreateSocialContent, useUpdateSocialContent } from '@/hooks/useSocialContent'
import { useClients } from '@/hooks/useClients'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  SOCIAL_CONTENT_STATUSES,
  SOCIAL_CONTENT_STATUS_LABELS,
  SOCIAL_FORMATS,
  SOCIAL_FORMAT_LABELS,
  VIDEO_TYPES,
  VIDEO_TYPE_LABELS,
} from '@/lib/constants'

interface SocialContentFormModalProps {
  open: boolean
  onClose: () => void
  editItem: SocialContent | null
}

export function SocialContentFormModal({ open, onClose, editItem }: SocialContentFormModalProps) {
  const isEditing = !!editItem
  const createContent = useCreateSocialContent()
  const updateContent = useUpdateSocialContent()
  const { data: clientsData } = useClients()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SocialContentFormData>({
    resolver: zodResolver(socialContentSchema) as any,
    defaultValues: {
      client_id: '',
      title: '',
      status: 'idée',
      format: null,
      video_type: null,
      planned_date: '',
      text_content: '',
      link: '',
      is_validated: false,
    },
  })

  const watchedClientId = watch('client_id')
  const watchedStatus = watch('status')
  const watchedFormat = watch('format')
  const watchedVideoType = watch('video_type')
  const watchedIsValidated = watch('is_validated')

  useEffect(() => {
    if (editItem) {
      reset({
        client_id: editItem.client_id ?? '',
        title: editItem.title,
        status: editItem.status,
        format: editItem.format,
        video_type: editItem.video_type,
        planned_date: editItem.planned_date ?? '',
        text_content: editItem.text_content ?? '',
        link: editItem.link ?? '',
        is_validated: editItem.is_validated,
      })
    } else {
      reset({
        client_id: '',
        title: '',
        status: 'idée',
        format: null,
        video_type: null,
        planned_date: '',
        text_content: '',
        link: '',
        is_validated: false,
      })
    }
  }, [editItem, reset])

  const onSubmit = async (data: SocialContentFormData) => {
    const cleanData = {
      ...data,
      link: data.link || undefined,
      text_content: data.text_content || undefined,
      planned_date: data.planned_date || undefined,
    }

    if (isEditing && editItem) {
      await updateContent.mutateAsync({ id: editItem.id, ...cleanData })
    } else {
      await createContent.mutateAsync(cleanData)
    }
    onClose()
  }

  const clientOptions = (clientsData?.data ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const statusOptions = SOCIAL_CONTENT_STATUSES.map((s) => ({
    value: s,
    label: SOCIAL_CONTENT_STATUS_LABELS[s],
  }))

  const formatOptions = [
    { value: '', label: 'Aucun' },
    ...SOCIAL_FORMATS.map((f) => ({ value: f, label: SOCIAL_FORMAT_LABELS[f] })),
  ]

  const videoTypeOptions = [
    { value: '', label: 'Aucun' },
    ...VIDEO_TYPES.map((v) => ({ value: v, label: VIDEO_TYPE_LABELS[v] })),
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier le contenu' : 'Nouveau contenu'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Client"
          options={clientOptions}
          value={watchedClientId}
          onChange={(val) => setValue('client_id', val)}
          error={errors.client_id?.message}
        />

        <Input
          label="Titre"
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Statut"
            options={statusOptions}
            value={watchedStatus}
            onChange={(val) => setValue('status', val as SocialContentFormData['status'])}
            error={errors.status?.message}
          />
          <Select
            label="Format"
            options={formatOptions}
            value={watchedFormat ?? ''}
            onChange={(val) => setValue('format', (val || null) as SocialContentFormData['format'])}
            error={errors.format?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Type de vidéo"
            options={videoTypeOptions}
            value={watchedVideoType ?? ''}
            onChange={(val) => setValue('video_type', (val || null) as SocialContentFormData['video_type'])}
            error={errors.video_type?.message}
          />
          <Input
            label="Date prévue"
            type="date"
            {...register('planned_date')}
            error={errors.planned_date?.message}
          />
        </div>

        <Textarea
          label="Contenu texte"
          {...register('text_content')}
          error={errors.text_content?.message}
        />

        <Input
          label="Lien"
          type="url"
          placeholder="https://..."
          {...register('link')}
          error={errors.link?.message}
        />

        <Checkbox
          label="Validé"
          description="Marquer ce contenu comme validé"
          checked={watchedIsValidated}
          onChange={(e) => setValue('is_validated', (e.target as HTMLInputElement).checked)}
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
