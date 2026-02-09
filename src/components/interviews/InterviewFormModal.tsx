import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { interviewSchema } from '@/types/forms'
import type { InterviewFormData } from '@/types/forms'
import type { InterviewWithRelations } from '@/types/database'
import { useCreateInterview, useUpdateInterview } from '@/hooks/useInterviews'
import { useProfiles } from '@/hooks/useUsers'
import { INTERVIEW_STATUSES } from '@/lib/constants'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface InterviewFormModalProps {
  open: boolean
  onClose: () => void
  interview?: InterviewWithRelations | null
}

const STATUS_OPTIONS = INTERVIEW_STATUSES.map((s) => ({
  value: s,
  label: s.charAt(0).toUpperCase() + s.slice(1),
}))

export function InterviewFormModal({ open, onClose, interview }: InterviewFormModalProps) {
  const isEdit = !!interview
  const { data: profiles } = useProfiles()
  const createInterview = useCreateInterview()
  const updateInterview = useUpdateInterview()

  const profileOptions = (profiles ?? []).map((p) => ({
    value: p.id,
    label: p.full_name,
  }))

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema) as any,
    defaultValues: {
      coach_id: '',
      member_id: '',
      date: '',
      status: 'planifié',
      positive_points: '',
      improvement_areas: '',
      actions: '',
      deadline: '',
      notes: '',
    },
  })

  const coachId = watch('coach_id')
  const memberId = watch('member_id')
  const status = watch('status')

  useEffect(() => {
    if (open && interview) {
      reset({
        coach_id: interview.coach_id,
        member_id: interview.member_id,
        date: interview.date ? interview.date.slice(0, 16) : '',
        status: interview.status,
        positive_points: interview.positive_points ?? '',
        improvement_areas: interview.improvement_areas ?? '',
        actions: interview.actions ?? '',
        deadline: interview.deadline ?? '',
        notes: interview.notes ?? '',
      })
    } else if (open) {
      reset({
        coach_id: '',
        member_id: '',
        date: '',
        status: 'planifié',
        positive_points: '',
        improvement_areas: '',
        actions: '',
        deadline: '',
        notes: '',
      })
    }
  }, [open, interview, reset])

  const onSubmit = async (data: InterviewFormData) => {
    if (isEdit && interview) {
      await updateInterview.mutateAsync({ id: interview.id, ...data })
    } else {
      await createInterview.mutateAsync(data)
    }
    onClose()
  }

  const isLoading = createInterview.isPending || updateInterview.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier l\'entretien' : 'Nouvel entretien'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Coach"
            options={profileOptions}
            value={coachId}
            onChange={(val) => setValue('coach_id', val, { shouldValidate: true })}
            placeholder="Sélectionner un coach"
            error={errors.coach_id?.message}
          />
          <Select
            label="Membre"
            options={profileOptions}
            value={memberId}
            onChange={(val) => setValue('member_id', val, { shouldValidate: true })}
            placeholder="Sélectionner un membre"
            error={errors.member_id?.message}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Date et heure"
            type="datetime-local"
            {...register('date')}
            error={errors.date?.message}
          />
          <Select
            label="Statut"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => setValue('status', val as InterviewFormData['status'], { shouldValidate: true })}
            error={errors.status?.message}
          />
        </div>

        <Textarea
          label="Points positifs"
          placeholder="Points positifs observés..."
          {...register('positive_points')}
          error={errors.positive_points?.message}
          autoGrow
        />

        <Textarea
          label="Axes d'amélioration"
          placeholder="Axes d'amélioration identifiés..."
          {...register('improvement_areas')}
          error={errors.improvement_areas?.message}
          autoGrow
        />

        <Textarea
          label="Actions"
          placeholder="Actions décidées..."
          {...register('actions')}
          error={errors.actions?.message}
          autoGrow
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Deadline"
            type="date"
            {...register('deadline')}
            error={errors.deadline?.message}
          />
        </div>

        <Textarea
          label="Notes"
          placeholder="Notes complémentaires..."
          {...register('notes')}
          error={errors.notes?.message}
          autoGrow
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
