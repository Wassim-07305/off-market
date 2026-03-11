import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OffMarketLogo } from '@/components/ui/OffMarketLogo'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Page introuvable')
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-background to-red-50/30 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="relative text-center">
        <OffMarketLogo size={48} showText={false} className="mx-auto mb-6 opacity-20" />

        <div className="mb-2 text-8xl font-bold tracking-tighter text-primary/20">
          404
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Page introuvable
        </h1>

        <p className="mb-8 max-w-md text-muted-foreground">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Retour
          </Button>
          <Button
            onClick={() => navigate('/')}
            icon={<Home className="h-4 w-4" />}
          >
            Accueil
          </Button>
        </div>
      </div>
    </div>
  )
}
