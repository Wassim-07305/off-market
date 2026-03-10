import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  SOCIAL_CONTENT_STATUSES,
  SOCIAL_CONTENT_STATUS_LABELS,
  SOCIAL_CONTENT_STATUS_COLORS,
  SOCIAL_FORMAT_LABELS,
  VIDEO_TYPE_LABELS,
} from '@/lib/constants'
import type { SocialContentStatus } from '@/lib/constants'
import type { SocialContentWithRelations } from '@/types/database'

interface SocialContentBoardProps {
  data: SocialContentWithRelations[]
  isLoading: boolean
}

const COLUMN_BORDER_COLORS: Record<SocialContentStatus, string> = {
  idée: 'border-t-slate-400',
  a_tourner: 'border-t-amber-500',
  en_cours: 'border-t-blue-500',
  publié: 'border-t-emerald-500',
  reporté: 'border-t-orange-500',
}

export function SocialContentBoard({ data, isLoading }: SocialContentBoardProps) {
  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="min-w-[280px] flex-1 space-y-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  const columns = SOCIAL_CONTENT_STATUSES.map((status) => ({
    id: status,
    label: SOCIAL_CONTENT_STATUS_LABELS[status],
    items: data.filter((item) => item.status === status),
    borderColor: COLUMN_BORDER_COLORS[status],
  }))

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column.id} className="min-w-[280px] flex-1">
          <div
            className={cn(
              'mb-3 flex items-center justify-between rounded-lg border-t-2 bg-secondary/50 px-3 py-2',
              column.borderColor
            )}
          >
            <span className="text-sm font-semibold text-foreground">{column.label}</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-medium text-muted-foreground">
              {column.items.length}
            </span>
          </div>

          <div className="space-y-3">
            {column.items.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}

            {column.items.length === 0 && (
              <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border/60">
                <p className="text-xs text-muted-foreground">Aucun contenu</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ContentCard({ item }: { item: SocialContentWithRelations }) {
  return (
    <Card className="cursor-pointer">
      <CardContent className="p-3">
        <p className="text-sm font-medium text-foreground line-clamp-2">{item.title}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.format && (
            <Badge className={cn(SOCIAL_CONTENT_STATUS_COLORS[item.status])}>
              {SOCIAL_FORMAT_LABELS[item.format]}
            </Badge>
          )}
          {item.video_type && (
            <span className="text-xs text-muted-foreground">
              {VIDEO_TYPE_LABELS[item.video_type]}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          {item.client && (
            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
              {item.client.name}
            </span>
          )}
          {item.planned_date && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(item.planned_date), 'dd MMM', { locale: fr })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
