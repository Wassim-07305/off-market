import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  SOCIAL_STATUSES,
  SOCIAL_STATUS_LABELS,
  SOCIAL_FORMATS,
  VIDEO_TYPES,
} from '@/lib/constants'

const FORMAT_LABELS: Record<string, string> = {
  réel: 'Réel',
  story: 'Story',
  carrousel: 'Carrousel',
  post: 'Post',
}

const VIDEO_TYPE_LABELS: Record<string, string> = {
  réact: 'Réact',
  'b-roll': 'B-Roll',
  vidéo_virale: 'Vidéo virale',
  preuve_sociale: 'Preuve sociale',
  facecam: 'Facecam',
  talking_head: 'Talking Head',
  vlog: 'Vlog',
}

interface SocialContentFormModalProps {
  open: boolean
  onClose: () => void
  editItem?: SocialContent | null
}

export function SocialContentFormModal({ open, onClose, editItem }: SocialContentFormModalProps) {
  const createMutation = useCreateSocialContent()
  const updateMutation = useUpdateSocialContent()
  const { data: clientsData } = useClients()

  const clients = clientsData?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SocialContentFormData>({
    resolver: zodResolver(socialContentSchema) as any,
    defaultValues: {
      client_id: '',
      title: '',
      status: 'idée',
      format: null,
      video_type: null,
      link: '',
      text_content: '',
      planned_date: '',
      is_validated: false,
    },
  })

  useEffect(() => {
    if (editItem) {
      reset({
        client_id: editItem.client_id ?? '',
        title: editItem.title,
        status: editItem.status,
        format: editItem.format,
        video_type: editItem.video_type,
        link: editItem.link ?? '',
        text_content: editItem.text_content ?? '',
        planned_date: editItem.planned_date ?? '',
        is_validated: editItem.is_validated,
      })
    } else {
      reset({
        client_id: '',
        title: '',
        status: 'idée',
        format: null,
        video_type: null,
        link: '',
        text_content: '',
        planned_date: '',
        is_validated: false,
      })
    }
  }, [editItem, reset, open])

  const onSubmit = (data: SocialContentFormData) => {
    const cleanData = {
      ...data,
      link: data.link || undefined,
      text_content: data.text_content || undefined,
      planned_date: data.planned_date || undefined,
    }

    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id, ...cleanData },
        { onSuccess: () => onClose() }
      )
    } else {
      createMutation.mutate(cleanData, { onSuccess: () => onClose() })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }))
  const statusOptions = SOCIAL_STATUSES.map((s) => ({
    value: s,
    label: SOCIAL_STATUS_LABELS[s],
  }))
  const formatOptions = SOCIAL_FORMATS.map((f) => ({
    value: f,
    label: FORMAT_LABELS[f] ?? f,
  }))
  const videoTypeOptions = VIDEO_TYPES.map((v) => ({
    value: v,
    label: VIDEO_TYPE_LABELS[v] ?? v,
  }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Modifier le contenu' : 'Nouveau contenu'}
      size="lg"
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

        <Input
          label="Titre"
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Statut"
                options={statusOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.status?.message}
              />
            )}
          />

          <Controller
            name="format"
            control={control}
            render={({ field }) => (
              <Select
                label="Format"
                options={formatOptions}
                value={field.value ?? ''}
                onChange={(v) => field.onChange(v || null)}
                placeholder="Aucun"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="video_type"
            control={control}
            render={({ field }) => (
              <Select
                label="Type vidéo"
                options={videoTypeOptions}
                value={field.value ?? ''}
                onChange={(v) => field.onChange(v || null)}
                placeholder="Aucun"
              />
            )}
          />

          <Input
            label="Date prévue"
            type="date"
            {...register('planned_date')}
            error={errors.planned_date?.message}
          />
        </div>

        <Input
          label="Lien"
          type="url"
          placeholder="https://..."
          {...register('link')}
          error={errors.link?.message}
        />

        <Textarea
          label="Contenu texte"
          {...register('text_content')}
          error={errors.text_content?.message}
          rows={3}
        />

        <Controller
          name="is_validated"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Validé"
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
