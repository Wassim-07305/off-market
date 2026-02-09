import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn, formatDateTime, formatDate } from '@/lib/utils'
import { INTERVIEW_STATUS_COLORS } from '@/lib/constants'
import { useInterview, useBlockages } from '@/hooks/useInterviews'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { BlockageAccordion } from './BlockageAccordion'
import { BlockageForm } from './BlockageForm'

interface InterviewDetailProps {
  interviewId: string
}

const STATUS_LABELS: Record<string, string> = {
  planifié: 'Planifié',
  réalisé: 'Réalisé',
  annulé: 'Annulé',
}

export function InterviewDetail({ interviewId }: InterviewDetailProps) {
  const { data: interview, isLoading } = useInterview(interviewId)
  const { data: blockages, isLoading: blockagesLoading } = useBlockages(interviewId)
  const [showBlockageForm, setShowBlockageForm] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <SkeletonText lines={4} />
      </div>
    )
  }

  if (!interview) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Entretien introuvable.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {interview.coach && (
              <div className="flex items-center gap-2">
                <Avatar
                  src={interview.coach.avatar_url}
                  name={interview.coach.full_name}
                  size="sm"
                />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Coach</span>
                  <span className="text-sm font-medium text-foreground">
                    {interview.coach.full_name}
                  </span>
                </div>
              </div>
            )}

            <span className="text-muted-foreground">&rarr;</span>

            {interview.member && (
              <div className="flex items-center gap-2">
                <Avatar
                  src={interview.member.avatar_url}
                  name={interview.member.full_name}
                  size="sm"
                />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Membre</span>
                  <span className="text-sm font-medium text-foreground">
                    {interview.member.full_name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {formatDateTime(interview.date)}
          </span>
          <Badge
            className={cn(
              INTERVIEW_STATUS_COLORS[interview.status as keyof typeof INTERVIEW_STATUS_COLORS]
            )}
          >
            {STATUS_LABELS[interview.status] ?? interview.status}
          </Badge>
        </div>
      </div>

      {/* Deadline */}
      {interview.deadline && (
        <div className="rounded-md border border-border bg-secondary/30 px-4 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Deadline :
          </span>{' '}
          <span className="text-sm font-medium text-foreground">
            {formatDate(interview.deadline)}
          </span>
        </div>
      )}

      {/* Content sections */}
      <div className="grid grid-cols-1 gap-4">
        {interview.positive_points && (
          <Section
            title="Points positifs"
            content={interview.positive_points}
            color="emerald"
          />
        )}
        {interview.improvement_areas && (
          <Section
            title="Axes d'amélioration"
            content={interview.improvement_areas}
            color="amber"
          />
        )}
        {interview.actions && (
          <Section
            title="Actions"
            content={interview.actions}
            color="blue"
          />
        )}
        {interview.notes && (
          <Section
            title="Notes"
            content={interview.notes}
            color="slate"
          />
        )}
      </div>

      {/* Blockages section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Blocages
          </h3>
          {!showBlockageForm && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowBlockageForm(true)}
            >
              Ajouter un blocage
            </Button>
          )}
        </div>

        {showBlockageForm && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-card p-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Nouveau blocage - Méthode 5 Pourquoi
            </h4>
            <BlockageForm
              interviewId={interviewId}
              memberId={interview.member_id}
              onSuccess={() => setShowBlockageForm(false)}
              onCancel={() => setShowBlockageForm(false)}
            />
          </div>
        )}

        {blockagesLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <BlockageAccordion blockages={blockages ?? interview.blockages ?? []} />
        )}
      </div>
    </div>
  )
}

const SECTION_COLORS: Record<string, { border: string; bg: string; title: string }> = {
  emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50/50', title: 'text-emerald-700' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50/50', title: 'text-amber-700' },
  blue: { border: 'border-blue-200', bg: 'bg-blue-50/50', title: 'text-blue-700' },
  red: { border: 'border-red-200', bg: 'bg-red-50/50', title: 'text-red-700' },
  slate: { border: 'border-border', bg: 'bg-card', title: 'text-muted-foreground' },
}

function Section({ title, content, color = 'slate' }: { title: string; content: string; color?: string }) {
  const colors = SECTION_COLORS[color] ?? SECTION_COLORS.slate
  return (
    <div className={cn('rounded-xl border p-4', colors.border, colors.bg)}>
      <h3 className={cn('mb-2 text-xs font-semibold uppercase tracking-wider', colors.title)}>
        {title}
      </h3>
      <p className="whitespace-pre-wrap text-sm text-foreground">{content}</p>
    </div>
  )
}
