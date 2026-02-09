import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Database, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRole } from '@/hooks/useRole'
import { useAuthStore } from '@/stores/auth-store'
import { seedDemoData, clearDemoData, isDemoDataSeeded } from '@/lib/seedDemoData'

export function DemoDataButton() {
  const { isAdmin } = useRole()
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(isDemoDataSeeded)

  useEffect(() => {
    setSeeded(isDemoDataSeeded())
  }, [])

  if (!isAdmin || !user) return null

  async function handleSeed() {
    setLoading(true)
    try {
      const summary = await seedDemoData(user!.id)
      setSeeded(true)
      await queryClient.invalidateQueries()
      toast.success('Données de démo créées', { description: summary })
    } catch (err: any) {
      toast.error('Erreur lors du seed', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleClear() {
    setLoading(true)
    try {
      await clearDemoData()
      setSeeded(false)
      await queryClient.invalidateQueries()
      toast.success('Données de démo supprimées')
    } catch (err: any) {
      toast.error('Erreur lors de la suppression', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        {seeded ? 'Suppression...' : 'Génération...'}
      </div>
    )
  }

  if (seeded) {
    return (
      <button
        type="button"
        onClick={handleClear}
        className="fixed bottom-6 right-6 z-40 flex cursor-pointer items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-xl"
      >
        <Trash2 className="h-4 w-4" />
        Supprimer les données de démo
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleSeed}
      className="fixed bottom-6 right-6 z-40 flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-primary to-violet-500 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
    >
      <Database className="h-4 w-4" />
      Remplir avec des données de démo
    </button>
  )
}
