import { useState, useMemo } from 'react'
import {
  Trophy,
  Star,
  Flame,
  Target,
  Zap,
  Medal,
  Crown,
  Clock,
  TrendingUp,
  Award,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import {
  useMyXp,
  useXpHistory,
  useLevels,
  useBadges,
  useMyBadges,
  useChallenges,
  useMyChallengeParticipations,
  useJoinChallenge,
} from '@/hooks/useGamification'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TabsList, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/utils'
import type { LevelConfig, GamificationBadge } from '@/types/database'

// --- Icones dynamiques ---

const ICON_MAP: Record<string, LucideIcon> = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  target: Target,
  zap: Zap,
  medal: Medal,
  crown: Crown,
  clock: Clock,
  trending_up: TrendingUp,
  award: Award,
  shield_check: ShieldCheck,
  sparkles: Sparkles,
}

function DynamicIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = ICON_MAP[name ?? ''] ?? Star
  return <Icon className={className} />
}

// --- Couleurs par rarete ---

const RARITY_STYLES: Record<string, { badge: string; border: string; bg: string }> = {
  commun: {
    badge: 'bg-zinc-100 text-zinc-600',
    border: 'border-zinc-200',
    bg: 'from-zinc-50 to-zinc-100/50',
  },
  rare: {
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
    bg: 'from-blue-50 to-blue-100/50',
  },
  epique: {
    badge: 'bg-purple-100 text-purple-700',
    border: 'border-purple-200',
    bg: 'from-purple-50 to-purple-100/50',
  },
  legendaire: {
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
    bg: 'from-amber-50 to-amber-100/50',
  },
}

const RARITY_LABELS: Record<string, string> = {
  commun: 'Commun',
  rare: 'Rare',
  epique: 'Epique',
  legendaire: 'Legendaire',
}

// --- Helpers niveau ---

function getCurrentLevel(xp: number, levels: LevelConfig[]): LevelConfig {
  const sorted = [...levels].sort((a, b) => b.min_xp - a.min_xp)
  return sorted.find((l) => xp >= l.min_xp) ?? levels[0] ?? { level: 1, name: 'Debutant', min_xp: 0, icon: 'star', color: null }
}

function getNextLevel(current: LevelConfig, levels: LevelConfig[]): LevelConfig | null {
  return levels.find((l) => l.level === current.level + 1) ?? null
}

function getProgressPercent(xp: number, current: LevelConfig, next: LevelConfig | null): number {
  if (!next) return 100
  const range = next.min_xp - current.min_xp
  if (range <= 0) return 100
  const progress = xp - current.min_xp
  return Math.min(100, Math.round((progress / range) * 100))
}

// --- XP action labels ---

const ACTION_LABELS: Record<string, string> = {
  lead_created: 'Nouveau lead cree',
  call_completed: 'Appel realise',
  deal_closed: 'Deal close',
  message_sent: 'Message envoye',
  formation_completed: 'Formation terminee',
  ritual_completed: 'Rituel complete',
  daily_login: 'Connexion quotidienne',
  badge_earned: 'Badge obtenu',
  challenge_completed: 'Defi termine',
}

const ACTION_ICONS: Record<string, LucideIcon> = {
  lead_created: Target,
  call_completed: Zap,
  deal_closed: Trophy,
  message_sent: Sparkles,
  formation_completed: Award,
  ritual_completed: ShieldCheck,
  daily_login: Flame,
  badge_earned: Medal,
  challenge_completed: Crown,
}

// --- Composants ---

function XpProgressBar({ xp, levels }: { xp: number; levels: LevelConfig[] }) {
  const currentLevel = getCurrentLevel(xp, levels)
  const nextLevel = getNextLevel(currentLevel, levels)
  const progress = getProgressPercent(xp, currentLevel, nextLevel)

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <DynamicIcon name={currentLevel.icon} className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Niveau {currentLevel.level}</p>
              <p className="text-xl font-bold">{currentLevel.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{xp.toLocaleString('fr-FR')}</p>
            <p className="text-sm text-white/80">XP total</p>
          </div>
        </div>

        {nextLevel ? (
          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-white/80">Progression vers {nextLevel.name}</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/60">
              {(nextLevel.min_xp - xp).toLocaleString('fr-FR')} XP restants
            </p>
          </div>
        ) : (
          <p className="text-sm text-white/80">Niveau maximum atteint !</p>
        )}
      </CardContent>
    </Card>
  )
}

function StatsCards({ xp, level, badgesCount }: { xp: number; level: LevelConfig; badgesCount: number }) {
  const stats = [
    {
      label: 'XP Total',
      value: xp.toLocaleString('fr-FR'),
      icon: Zap,
      color: 'text-amber-500',
      bgLight: 'bg-amber-50',
    },
    {
      label: 'Niveau actuel',
      value: `Niv. ${level.level}`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      label: 'Badges gagnes',
      value: badgesCount.toString(),
      icon: Medal,
      color: 'text-purple-500',
      bgLight: 'bg-purple-50',
    },
    {
      label: 'Streak actuel',
      value: '--',
      icon: Flame,
      color: 'text-rose-500',
      bgLight: 'bg-rose-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="group">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.bgLight)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function BadgeCard({ badge, earned }: { badge: GamificationBadge; earned: boolean }) {
  const rarity = badge.rarity ?? 'commun'
  const styles = RARITY_STYLES[rarity] ?? RARITY_STYLES.commun

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        earned
          ? cn('border', styles.border, 'shadow-md')
          : 'opacity-50 grayscale border-border/30'
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', earned ? styles.bg : 'from-gray-50 to-gray-100')} />
      <CardContent className="relative p-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl',
              earned ? 'bg-white shadow-sm' : 'bg-muted'
            )}
          >
            <DynamicIcon name={badge.icon} className={cn('h-7 w-7', earned ? 'text-foreground' : 'text-muted-foreground')} />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{badge.name}</p>
            {badge.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('text-[10px]', styles.badge)}>
              {RARITY_LABELS[rarity] ?? rarity}
            </Badge>
            {badge.xp_reward > 0 && (
              <Badge variant="outline" className="text-[10px]">
                +{badge.xp_reward} XP
              </Badge>
            )}
          </div>
          {earned && (
            <div className="absolute top-3 right-3">
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function BadgesTab() {
  const { data: allBadges, isLoading: loadingBadges } = useBadges()
  const { data: myBadges, isLoading: loadingMyBadges } = useMyBadges()

  const isLoading = loadingBadges || loadingMyBadges
  const earnedIds = useMemo(
    () => new Set(myBadges?.map((ub) => ub.badge_id) ?? []),
    [myBadges]
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!allBadges?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Medal className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm">Aucun badge disponible pour le moment.</p>
      </div>
    )
  }

  // Badges gagnes en premier
  const sorted = [...allBadges].sort((a, b) => {
    const aEarned = earnedIds.has(a.id) ? 0 : 1
    const bEarned = earnedIds.has(b.id) ? 0 : 1
    return aEarned - bEarned
  })

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {earnedIds.size} / {allBadges.length} badges debloques
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sorted.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} earned={earnedIds.has(badge.id)} />
        ))}
      </div>
    </div>
  )
}

function ChallengesTab() {
  const { data: challenges, isLoading: loadingChallenges } = useChallenges()
  const { data: participations, isLoading: loadingParts } = useMyChallengeParticipations()
  const joinChallenge = useJoinChallenge()

  const isLoading = loadingChallenges || loadingParts

  const participationMap = useMemo(() => {
    const map = new Map<string, { progress: number; completed: boolean }>()
    participations?.forEach((p) => {
      map.set(p.challenge_id, { progress: p.progress, completed: p.completed })
    })
    return map
  }, [participations])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!challenges?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Target className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm">Aucun defi actif pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => {
        const participation = participationMap.get(challenge.id)
        const hasJoined = !!participation
        const progressPct = participation ? Math.min(100, Math.round(participation.progress)) : 0

        return (
          <Card key={challenge.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-orange-50">
                    <Target className="h-5 w-5 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{challenge.title}</p>
                      {participation?.completed && (
                        <Badge variant="success" className="text-[10px]">Termine</Badge>
                      )}
                    </div>
                    {challenge.description && (
                      <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                    )}

                    {hasJoined && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
                          <span>Progression</span>
                          <span className="font-medium text-foreground">{progressPct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              participation?.completed
                                ? 'bg-green-500'
                                : 'bg-gradient-to-r from-rose-500 to-orange-500'
                            )}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    <Zap className="h-3 w-3 mr-1" />
                    +{challenge.xp_reward} XP
                  </Badge>
                  {!hasJoined && (
                    <button
                      onClick={() => joinChallenge.mutate(challenge.id)}
                      disabled={joinChallenge.isPending}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium',
                        'bg-gradient-to-r from-rose-500 to-orange-500 text-white',
                        'shadow-sm shadow-rose-500/20',
                        'hover:shadow-md hover:shadow-rose-500/30 transition-all duration-200',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'cursor-pointer'
                      )}
                    >
                      Rejoindre
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function HistoryTab() {
  const [page, setPage] = useState(1)
  const { data: result, isLoading } = useXpHistory(page)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const transactions = result?.data ?? []
  const totalPages = Math.ceil((result?.count ?? 0) / 20)

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Clock className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm">Aucune transaction XP pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {transactions.map((tx) => {
          const ActionIcon = ACTION_ICONS[tx.action] ?? Star
          const label = ACTION_LABELS[tx.action] ?? tx.action
          const isPositive = tx.xp_amount >= 0

          return (
            <div
              key={tx.id}
              className="flex items-center gap-4 rounded-xl border border-border/40 bg-white p-4 transition-colors hover:bg-muted/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50">
                <ActionIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeDate(tx.created_at)}</p>
              </div>
              <span
                className={cn(
                  'text-sm font-bold tabular-nums',
                  isPositive ? 'text-green-600' : 'text-red-500'
                )}
              >
                {isPositive ? '+' : ''}{tx.xp_amount} XP
              </span>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Precedent
          </button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}

// --- Page principale ---

const TABS = [
  { value: 'badges', label: 'Badges' },
  { value: 'defis', label: 'Defis' },
  { value: 'historique', label: 'Historique XP' },
]

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState('badges')
  const { data: xp, isLoading: loadingXp } = useMyXp()
  const { data: levels, isLoading: loadingLevels } = useLevels()
  const { data: myBadges } = useMyBadges()

  const isLoading = loadingXp || loadingLevels
  const totalXp = xp ?? 0
  const currentLevel = levels?.length
    ? getCurrentLevel(totalXp, levels)
    : { level: 1, name: 'Debutant', min_xp: 0, icon: 'star', color: null }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Progression</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gagnez de l&apos;XP, debloquez des badges et relevez des defis.
        </p>
      </div>

      {/* XP Progress */}
      {isLoading ? (
        <Skeleton className="h-44 w-full rounded-xl" />
      ) : levels?.length ? (
        <XpProgressBar xp={totalXp} levels={levels} />
      ) : null}

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsCards
          xp={totalXp}
          level={currentLevel}
          badgesCount={myBadges?.length ?? 0}
        />
      )}

      {/* Tabs */}
      <div>
        <TabsList tabs={TABS} value={activeTab} onChange={setActiveTab} />

        <TabsContent value="badges" activeValue={activeTab}>
          <BadgesTab />
        </TabsContent>

        <TabsContent value="defis" activeValue={activeTab}>
          <ChallengesTab />
        </TabsContent>

        <TabsContent value="historique" activeValue={activeTab}>
          <HistoryTab />
        </TabsContent>
      </div>
    </div>
  )
}
