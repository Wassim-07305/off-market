interface ActivityBadgeProps {
  lastSeenAt: string | null
}

function getHoursAgo(lastSeenAt: string): number {
  const seen = new Date(lastSeenAt).getTime()
  return (Date.now() - seen) / (1000 * 60 * 60)
}

export function ActivityBadge({ lastSeenAt }: ActivityBadgeProps) {
  if (!lastSeenAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        Jamais connecté
      </span>
    )
  }

  const hoursAgo = getHoursAgo(lastSeenAt)

  if (hoursAgo < 24) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Actif
      </span>
    )
  }

  if (hoursAgo < 72) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Récemment
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Inactif
    </span>
  )
}
