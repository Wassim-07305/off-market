import { BookOpen, Rocket, Grid3x3, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const steps = [
  'Connectez-vous avec vos identifiants',
  'Consultez le Dashboard pour voir vos KPIs',
  'Gérez vos clients depuis l\'onglet Prospects',
  'Suivez votre pipeline de leads',
  'Planifiez vos appels dans le calendrier',
]

const modules = [
  { name: 'Dashboard', description: 'Vue d\'ensemble des performances' },
  { name: 'Pipeline', description: 'Suivi des leads et prospection' },
  { name: 'Calendrier', description: 'Planification des appels' },
  { name: 'CA & Calls', description: 'Suivi des appels de closing' },
  { name: 'Contenus Social', description: 'Pipeline de création de contenu' },
  { name: 'Finances', description: 'Gestion financière' },
  { name: 'Instagram', description: 'Analytics des réseaux sociaux' },
  { name: 'Messagerie', description: 'Communication d\'équipe' },
  { name: 'Formations', description: 'Cours et progressions' },
]

const roles = [
  { name: 'Admin', description: 'Accès complet à tous les modules' },
  { name: 'Coach', description: 'Gestion des prospects, calendrier, contenus' },
  { name: 'Prospect', description: 'Dashboard, pipeline, formations, messagerie' },
]

export default function DocumentationPage() {
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
        </div>
        <p className="text-muted-foreground">
          Guide d&apos;utilisation de la plateforme Off-Market.
        </p>
      </div>

      {/* Section 1 : Prise en main rapide */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <CardTitle>Prise en main rapide</CardTitle>
          </div>
          <CardDescription>
            Suivez ces étapes pour démarrer sur la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Section 2 : Modules disponibles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            <CardTitle>Modules disponibles</CardTitle>
          </div>
          <CardDescription>
            Tous les modules accessibles depuis la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <div
                key={mod.name}
                className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50"
              >
                <p className="text-sm font-medium">{mod.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mod.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3 : Rôles et permissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Rôles et permissions</CardTitle>
          </div>
          <CardDescription>
            Niveaux d&apos;accès selon votre rôle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.name}
                className="flex items-start gap-3 rounded-lg border border-border/50 p-4"
              >
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {role.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {role.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
