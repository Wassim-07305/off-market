import { useState, useMemo } from 'react'
import { Plus, MoreVertical, Pencil, Trash2, Target, ListChecks, Calendar } from 'lucide-react'
import {
  useCoachingGoals,
  useDeleteGoal,
  useStudentTasks,
  useDeleteTask,
} from '@/hooks/useCoaching'
import { GoalFormModal } from '@/components/coaching/GoalFormModal'
import { TaskFormModal } from '@/components/coaching/TaskFormModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsList, TabsContent } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import { formatDate, cn } from '@/lib/utils'
import type { CoachingGoal, StudentTask } from '@/types/database'
import { usePageTitle } from '@/hooks/usePageTitle'

// ─── Constants ──────────────────────────────────────────────────────────────

const TABS = [
  { value: 'objectifs', label: 'Objectifs' },
  { value: 'taches', label: 'Tâches' },
]

const GOAL_STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'atteint', label: 'Atteint' },
  { value: 'abandonné', label: 'Abandonné' },
]

const TASK_STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'a_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminé' },
]

const GOAL_STATUS_COLORS: Record<string, string> = {
  en_cours: 'bg-blue-100 text-blue-700',
  atteint: 'bg-green-100 text-green-700',
  abandonné: 'bg-red-100 text-red-700',
}

const GOAL_STATUS_LABELS: Record<string, string> = {
  en_cours: 'En cours',
  atteint: 'Atteint',
  abandonné: 'Abandonné',
}

const TASK_PRIORITY_COLORS: Record<string, string> = {
  haute: 'bg-red-100 text-red-700',
  moyenne: 'bg-amber-100 text-amber-700',
  basse: 'bg-green-100 text-green-700',
}

const TASK_PRIORITY_LABELS: Record<string, string> = {
  haute: 'Haute',
  moyenne: 'Moyenne',
  basse: 'Basse',
}

const TASK_STATUS_COLORS: Record<string, string> = {
  a_faire: 'bg-gray-100 text-gray-600',
  en_cours: 'bg-blue-100 text-blue-700',
  termine: 'bg-green-100 text-green-700',
}

const TASK_STATUS_LABELS: Record<string, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  termine: 'Terminé',
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CoachingPage() {
  usePageTitle('Coaching')
  const [activeTab, setActiveTab] = useState('objectifs')

  // Goals state
  const [goalStatusFilter, setGoalStatusFilter] = useState('')
  const [goalPage, setGoalPage] = useState(1)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<CoachingGoal | null>(null)
  const [deleteGoalConfirm, setDeleteGoalConfirm] = useState<CoachingGoal | null>(null)

  // Tasks state
  const [taskStatusFilter, setTaskStatusFilter] = useState('')
  const [taskPage, setTaskPage] = useState(1)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<StudentTask | null>(null)
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<StudentTask | null>(null)

  // Goals query
  const goalFilters = useMemo(
    () => ({ status: goalStatusFilter || undefined, page: goalPage }),
    [goalStatusFilter, goalPage]
  )
  const { data: goalsResult, isLoading: goalsLoading } = useCoachingGoals(goalFilters)
  const deleteGoalMutation = useDeleteGoal()

  const goals = useMemo(() => goalsResult?.data ?? [], [goalsResult?.data])
  const goalsTotalItems = goalsResult?.count ?? 0
  const goalsTotalPages = Math.ceil(goalsTotalItems / ITEMS_PER_PAGE)

  // Tasks query
  const taskFilters = useMemo(
    () => ({ status: taskStatusFilter || undefined, page: taskPage }),
    [taskStatusFilter, taskPage]
  )
  const { data: tasksResult, isLoading: tasksLoading } = useStudentTasks(taskFilters)
  const deleteTaskMutation = useDeleteTask()

  const tasks = useMemo(() => tasksResult?.data ?? [], [tasksResult?.data])
  const tasksTotalItems = tasksResult?.count ?? 0
  const tasksTotalPages = Math.ceil(tasksTotalItems / ITEMS_PER_PAGE)

  // Goal handlers
  const handleEditGoal = (goal: CoachingGoal) => {
    setEditGoal(goal)
    setGoalModalOpen(true)
  }

  const handleDeleteGoal = (goal: CoachingGoal) => {
    setDeleteGoalConfirm(goal)
  }

  const confirmDeleteGoal = () => {
    if (deleteGoalConfirm) {
      deleteGoalMutation.mutate(deleteGoalConfirm.id)
      setDeleteGoalConfirm(null)
    }
  }

  // Task handlers
  const handleEditTask = (task: StudentTask) => {
    setEditTask(task)
    setTaskModalOpen(true)
  }

  const handleDeleteTask = (task: StudentTask) => {
    setDeleteTaskConfirm(task)
  }

  const confirmDeleteTask = () => {
    if (deleteTaskConfirm) {
      deleteTaskMutation.mutate(deleteTaskConfirm.id)
      setDeleteTaskConfirm(null)
    }
  }

  // Progress helper
  const getProgressPercent = (goal: CoachingGoal) => {
    if (goal.target_value <= 0) return 0
    return Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Coaching</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Objectifs et tâches de coaching pour vos clients.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Target className="h-4 w-4" />}
            onClick={() => {
              setEditGoal(null)
              setGoalModalOpen(true)
            }}
          >
            Nouvel objectif
          </Button>
          <Button
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditTask(null)
              setTaskModalOpen(true)
            }}
          >
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <TabsList tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {/* Objectifs Tab */}
      <TabsContent value="objectifs" activeValue={activeTab}>
        <div className="space-y-6">
          {/* Filtre */}
          <div className="flex items-center gap-3">
            <Select
              options={GOAL_STATUS_OPTIONS}
              value={goalStatusFilter}
              onChange={(v) => { setGoalStatusFilter(v); setGoalPage(1) }}
              placeholder="Tous les statuts"
              className="w-full sm:w-44"
            />
          </div>

          {/* Contenu */}
          {goalsLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <EmptyState
              icon={<Target className="h-6 w-6" />}
              title="Aucun objectif"
              description={goalStatusFilter ? 'Aucun objectif ne correspond au filtre.' : 'Créez votre premier objectif de coaching.'}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => {
                  const progress = getProgressPercent(goal)

                  return (
                    <Card key={goal.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base line-clamp-2">{goal.title}</CardTitle>
                          <DropdownMenu
                            align="right"
                            trigger={
                              <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            }
                          >
                            <DropdownMenuItem onClick={() => handleEditGoal(goal)} icon={<Pencil className="h-4 w-4" />}>
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteGoal(goal)} destructive icon={<Trash2 className="h-4 w-4" />}>
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {goal.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {goal.description}
                          </p>
                        )}

                        {/* Barre de progression */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {goal.current_value} / {goal.target_value}
                              {goal.unit ? ` ${goal.unit}` : ''}
                            </span>
                            <span className="font-medium text-foreground">{progress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                progress >= 100
                                  ? 'bg-green-500'
                                  : progress >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={GOAL_STATUS_COLORS[goal.status] ?? 'bg-gray-100 text-gray-600'}>
                            {GOAL_STATUS_LABELS[goal.status] ?? goal.status}
                          </Badge>
                          {goal.deadline && (
                            <Badge className="bg-slate-100 text-slate-700">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(goal.deadline)}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {goalsTotalPages > 1 && (
                <Pagination
                  currentPage={goalPage}
                  totalPages={goalsTotalPages}
                  onPageChange={setGoalPage}
                  totalItems={goalsTotalItems}
                />
              )}
            </>
          )}
        </div>
      </TabsContent>

      {/* Tâches Tab */}
      <TabsContent value="taches" activeValue={activeTab}>
        <div className="space-y-6">
          {/* Filtre */}
          <div className="flex items-center gap-3">
            <Select
              options={TASK_STATUS_OPTIONS}
              value={taskStatusFilter}
              onChange={(v) => { setTaskStatusFilter(v); setTaskPage(1) }}
              placeholder="Tous les statuts"
              className="w-full sm:w-44"
            />
          </div>

          {/* Contenu */}
          {tasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={<ListChecks className="h-6 w-6" />}
              title="Aucune tâche"
              description={taskStatusFilter ? 'Aucune tâche ne correspond au filtre.' : 'Créez votre première tâche de coaching.'}
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border/40">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/40 bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Titre</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Priorité</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Échéance</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <Badge className={TASK_PRIORITY_COLORS[task.priority] ?? 'bg-gray-100 text-gray-600'}>
                            {TASK_PRIORITY_LABELS[task.priority] ?? task.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={TASK_STATUS_COLORS[task.status] ?? 'bg-gray-100 text-gray-600'}>
                            {TASK_STATUS_LABELS[task.status] ?? task.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {task.due_date ? formatDate(task.due_date) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu
                            align="right"
                            trigger={
                              <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            }
                          >
                            <DropdownMenuItem onClick={() => handleEditTask(task)} icon={<Pencil className="h-4 w-4" />}>
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTask(task)} destructive icon={<Trash2 className="h-4 w-4" />}>
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {tasksTotalPages > 1 && (
                <Pagination
                  currentPage={taskPage}
                  totalPages={tasksTotalPages}
                  onPageChange={setTaskPage}
                  totalItems={tasksTotalItems}
                />
              )}
            </>
          )}
        </div>
      </TabsContent>

      {/* Modals */}
      <GoalFormModal
        open={goalModalOpen}
        onClose={() => {
          setGoalModalOpen(false)
          setEditGoal(null)
        }}
        editItem={editGoal}
      />

      <TaskFormModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false)
          setEditTask(null)
        }}
        editItem={editTask}
      />

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={!!deleteGoalConfirm}
        onClose={() => setDeleteGoalConfirm(null)}
        onConfirm={confirmDeleteGoal}
        title="Supprimer l'objectif"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteGoalConfirm?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
      />

      <ConfirmDialog
        open={!!deleteTaskConfirm}
        onClose={() => setDeleteTaskConfirm(null)}
        onConfirm={confirmDeleteTask}
        title="Supprimer la tâche"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteTaskConfirm?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
      />
    </div>
  )
}
