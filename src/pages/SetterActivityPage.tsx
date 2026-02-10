import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useSetterActivities } from '@/hooks/useSetterActivities'
import { SetterStats } from '@/components/setter/SetterStats'
import { SetterForm } from '@/components/setter/SetterForm'
import { SetterHistory } from '@/components/setter/SetterHistory'

export default function SetterActivityPage() {
  const { user } = useAuth()
  const { isAdmin } = useRole()
  const userId = user?.id

  const { data: activities, isLoading } = useSetterActivities(
    !isAdmin && userId ? { user_id: userId } : {}
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Activité Prospection</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Suivez l'activité de prospection de vos élèves"
            : 'Enregistrez et suivez votre activité de prospection quotidienne'}
        </p>
      </div>

      <SetterStats userId={!isAdmin ? userId : undefined} />

      <SetterForm />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Historique</h2>
        <SetterHistory data={activities ?? []} isLoading={isLoading} />
      </div>
    </div>
  )
}
