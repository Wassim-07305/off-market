import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateJournalEntry, useUpdateJournalEntry } from '@/hooks/useJournal'
import { cn } from '@/lib/utils'
import type { JournalEntry } from '@/types/database'

const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊'] as const

const journalEntrySchema = z.object({
  title: z.string().optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  mood: z.number().min(1).max(5).nullable(),
  tags: z.string().optional().or(z.literal('')),
  is_private: z.boolean(),
})

type JournalEntryFormData = z.infer<typeof journalEntrySchema>

interface JournalEntryModalProps {
  open: boolean
  onClose: () => void
  editItem?: JournalEntry | null
}

export function JournalEntryModal({ open, onClose, editItem }: JournalEntryModalProps) {
  const createEntry = useCreateJournalEntry()
  const updateEntry = useUpdateJournalEntry()
  const isEditing = !!editItem

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      title: '',
      content: '',
      mood: null,
      tags: '',
      is_private: false,
    },
  })

  const watchedMood = watch('mood')

  useEffect(() => {
    if (editItem) {
      reset({
        title: editItem.title ?? '',
        content: editItem.content ?? '',
        mood: editItem.mood ?? null,
        tags: editItem.tags?.join(', ') ?? '',
        is_private: editItem.is_private,
      })
    } else {
      reset({ title: '', content: '', mood: null, tags: '', is_private: false })
    }
  }, [editItem, reset])

  const onSubmit = (data: JournalEntryFormData) => {
    const tagsArray = data.tags
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    const payload = {
      title: data.title || undefined,
      content: data.content || undefined,
      mood: data.mood ?? undefined,
      tags: tagsArray,
      is_private: data.is_private,
    }

    if (isEditing) {
      updateEntry.mutate(
        { id: editItem.id, ...payload },
        { onSuccess: () => { reset(); onClose() } }
      )
    } else {
      createEntry.mutate(payload, {
        onSuccess: () => { reset(); onClose() },
      })
    }
  }

  const isPending = createEntry.isPending || updateEntry.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Modifier l\'entrée' : 'Nouvelle entrée'}
      description={isEditing ? 'Mettre à jour votre entrée de journal.' : 'Notez vos pensées, progrès et réflexions.'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Titre"
          placeholder="Titre de l'entrée (optionnel)"
          {...register('title')}
          error={errors.title?.message}
        />

        <Textarea
          label="Contenu"
          placeholder="Écrivez vos pensées, progrès, réflexions..."
          rows={6}
          {...register('content')}
          error={errors.content?.message}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Humeur
          </label>
          <div className="flex items-center gap-2">
            {MOOD_EMOJIS.map((emoji, index) => {
              const value = index + 1
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('mood', watchedMood === value ? null : value)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all duration-200 cursor-pointer',
                    watchedMood === value
                      ? 'bg-primary/10 ring-2 ring-primary scale-110'
                      : 'bg-muted/30 hover:bg-muted/60'
                  )}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
        </div>

        <Input
          label="Tags"
          placeholder="motivation, prospection, mindset (séparés par des virgules)"
          {...register('tags')}
          error={errors.tags?.message}
        />

        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            {...register('is_private')}
            className="rounded border-border"
          />
          Entrée privée (visible uniquement par moi)
        </label>

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
