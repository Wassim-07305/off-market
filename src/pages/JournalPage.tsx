import { useState, useMemo } from 'react'
import { Plus, BookOpen, MoreVertical, Pencil, Trash2, CalendarCheck } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  useJournalEntries,
  useDeleteJournalEntry,
  useWeeklyCheckins,
} from '@/hooks/useJournal'
import { JournalEntryModal } from '@/components/journal/JournalEntryModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TabsList, TabsContent } from '@/components/ui/tabs'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import type { JournalEntry } from '@/types/database'
import { usePageTitle } from '@/hooks/usePageTitle'

const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
}

const MOOD_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-lime-100 text-lime-700',
  5: 'bg-green-100 text-green-700',
}

const TABS = [
  { value: 'journal', label: 'Journal' },
  { value: 'checkins', label: 'Check-ins hebdo' },
]

export default function JournalPage() {
  usePageTitle('Journal')
  const [activeTab, setActiveTab] = useState('journal')
  const [journalPage, setJournalPage] = useState(1)
  const [checkinPage, setCheckinPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<JournalEntry | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<JournalEntry | null>(null)

  // Requêtes
  const { data: journalResult, isLoading: journalLoading } = useJournalEntries({ page: journalPage })
  const deleteEntry = useDeleteJournalEntry()
  const { data: checkinResult, isLoading: checkinLoading } = useWeeklyCheckins({ page: checkinPage })

  const entries = useMemo(() => journalResult?.data ?? [], [journalResult?.data])
  const journalTotal = journalResult?.count ?? 0
  const journalTotalPages = Math.ceil(journalTotal / ITEMS_PER_PAGE)

  const checkins = useMemo(() => checkinResult?.data ?? [], [checkinResult?.data])
  const checkinTotal = checkinResult?.count ?? 0
  const checkinTotalPages = Math.ceil(checkinTotal / ITEMS_PER_PAGE)

  const handleEdit = (entry: JournalEntry) => {
    setEditItem(entry)
    setModalOpen(true)
  }

  const handleDelete = (entry: JournalEntry) => {
    setDeleteConfirm(entry)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteEntry.mutate(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Journal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez vos progrès, réflexions et check-ins hebdomadaires.
          </p>
        </div>
        {activeTab === 'journal' && (
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditItem(null)
              setModalOpen(true)
            }}
          >
            Nouvelle entrée
          </Button>
        )}
      </div>

      {/* Tabs */}
      <TabsList tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {/* Tab: Journal */}
      <TabsContent value="journal" activeValue={activeTab}>
        {journalLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="Aucune entrée"
            description="Commencez à écrire vos réflexions et suivre vos progrès."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group relative rounded-xl border border-border/40 bg-white p-5 transition-all hover:shadow-md"
                >
                  {/* Top row: mood + actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {entry.mood && (
                        <span
                          className={cn(
                            'inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg',
                            MOOD_COLORS[entry.mood]
                          )}
                        >
                          {MOOD_EMOJIS[entry.mood]}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                    <DropdownMenu
                      align="right"
                      trigger={
                        <button className="rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      }
                    >
                      <DropdownMenuItem onClick={() => handleEdit(entry)} icon={<Pencil className="h-4 w-4" />}>
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(entry)} destructive icon={<Trash2 className="h-4 w-4" />}>
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>

                  {/* Title */}
                  {entry.title && (
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                      {entry.title}
                    </h3>
                  )}

                  {/* Content preview */}
                  {entry.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {entry.content}
                    </p>
                  )}

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} className="bg-muted/50 text-muted-foreground text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Private indicator */}
                  {entry.is_private && (
                    <span className="absolute top-3 right-12 text-xs text-muted-foreground/60">
                      🔒
                    </span>
                  )}
                </div>
              ))}
            </div>

            {journalTotalPages > 1 && (
              <Pagination
                currentPage={journalPage}
                totalPages={journalTotalPages}
                onPageChange={setJournalPage}
                totalItems={journalTotal}
              />
            )}
          </>
        )}
      </TabsContent>

      {/* Tab: Check-ins hebdo */}
      <TabsContent value="checkins" activeValue={activeTab}>
        {checkinLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : checkins.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck className="h-6 w-6" />}
            title="Aucun check-in"
            description="Les check-ins hebdomadaires apparaîtront ici."
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/40 bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Semaine</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">CA</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Prospection</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Humeur</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Objectif</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Feedback coach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {checkins.map((checkin) => (
                    <tr key={checkin.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {format(new Date(checkin.week_start), "'Sem.' w — dd MMM", { locale: fr })}
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium">
                        {formatCurrency(checkin.revenue)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {checkin.prospection_count} contacts
                      </td>
                      <td className="px-4 py-3">
                        {checkin.mood ? (
                          <span
                            className={cn(
                              'inline-flex h-7 w-7 items-center justify-center rounded-md text-sm',
                              MOOD_COLORS[checkin.mood]
                            )}
                          >
                            {MOOD_EMOJIS[checkin.mood]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-48 truncate">
                        {checkin.goal_next_week ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell max-w-48 truncate">
                        {checkin.coach_feedback ? (
                          <span className="text-foreground">{checkin.coach_feedback}</span>
                        ) : (
                          <span className="italic text-muted-foreground/60">En attente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {checkinTotalPages > 1 && (
              <Pagination
                currentPage={checkinPage}
                totalPages={checkinTotalPages}
                onPageChange={setCheckinPage}
                totalItems={checkinTotal}
              />
            )}
          </>
        )}
      </TabsContent>

      {/* Modal */}
      <JournalEntryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditItem(null)
        }}
        editItem={editItem}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'entrée"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm?.title || 'cette entrée'}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
      />
    </div>
  )
}
