import {
  Users,
  UserCheck,
  Phone,
  PhoneCall,
  MessageSquare,
  Film,
  DollarSign,
  Instagram,
  ClipboardList,
  BarChart3,
  Search,
  Shield,
} from 'lucide-react'

const modules = [
  {
    icon: BarChart3,
    title: 'Tableau de bord',
    description:
      'Vue d\'ensemble de votre activité avec les indicateurs clés : chiffre d\'affaires, nombre d\'appels, taux de closing et messages envoyés. Les tendances sont calculées par rapport au mois précédent.',
  },
  {
    icon: Users,
    title: 'Gestion des clients',
    description:
      'Centralisez toutes les informations de vos clients : coordonnées, statut (actif, inactif, archivé), notes et historique complet. Chaque client peut être assigné à un ou plusieurs membres de l\'équipe.',
  },
  {
    icon: UserCheck,
    title: 'Gestion des leads',
    description:
      'Suivez vos prospects du premier contact jusqu\'à la conversion. Gérez les statuts (à relancer, booké, no show, pas intéressé, en cours), les sources d\'acquisition et les commissions setter/closer.',
  },
  {
    icon: Phone,
    title: 'Calendrier d\'appels',
    description:
      'Planifiez et suivez tous vos appels. Supportez différents types (manuel, iClosed, Calendly) avec suivi des statuts : planifié, réalisé, no show, annulé ou reporté.',
  },
  {
    icon: PhoneCall,
    title: 'Appels closer',
    description:
      'Enregistrez les résultats de vos appels de closing : statut (closé ou non closé), revenu généré, nombre de paiements et debrief détaillé pour améliorer vos performances.',
  },
  {
    icon: MessageSquare,
    title: 'Activité setter',
    description:
      'Suivez l\'activité quotidienne de vos setters : nombre de messages envoyés par jour et par client, avec possibilité d\'ajouter des notes pour chaque session.',
  },
  {
    icon: Film,
    title: 'Contenus sociaux',
    description:
      'Gérez votre pipeline de création de contenu. Suivez chaque contenu de l\'idée à la publication avec les formats (réel, story, carrousel, post) et types de vidéo (réact, b-roll, facecam, etc.).',
  },
  {
    icon: DollarSign,
    title: 'Finances',
    description:
      'Gardez une vue complète de votre santé financière : chiffre d\'affaires, revenus récurrents, charges et prestataires. Gérez les échéanciers de paiement avec suivi des encaissements.',
  },
  {
    icon: Instagram,
    title: 'Instagram',
    description:
      'Connectez les comptes Instagram de vos clients et suivez les statistiques de leurs publications : likes, commentaires, partages, sauvegardes, portée et taux d\'engagement.',
  },
  {
    icon: ClipboardList,
    title: 'Entretiens',
    description:
      'Menez des entretiens structurés avec vos collaborateurs. Documentez les points positifs, axes d\'amélioration et actions décidées. Analysez les blocages avec la méthode des 5 Pourquoi.',
  },
  {
    icon: Shield,
    title: 'Gestion des utilisateurs',
    description:
      'Administrez les comptes et les rôles de votre équipe : admin, manager, coach, setter, closer et monteur. Chaque rôle dispose de permissions spécifiques adaptées à ses responsabilités.',
  },
  {
    icon: Search,
    title: 'Recherche globale',
    description:
      'Trouvez rapidement n\'importe quel client, lead ou contenu grâce à la barre de recherche globale disponible dans l\'en-tête. Les résultats apparaissent en temps réel pendant la saisie.',
  },
]

export default function DocumentationPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Documentation</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Bienvenue dans la documentation de Off-Market. Retrouvez ci-dessous la description
          de chaque module disponible dans l'application. Cette plateforme a été conçue
          pour centraliser la gestion de vos clients, leads, finances et contenus en un
          seul endroit.
        </p>
      </div>

      {/* Quick start */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Prise en main rapide</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Commencez par ajouter vos clients dans le module <strong>Clients</strong>.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Créez des leads et suivez leur progression dans le pipeline de vente.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Planifiez vos appels via le <strong>Calendrier d'appels</strong> et enregistrez les résultats.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Consultez le <strong>Tableau de bord</strong> pour avoir une vue d'ensemble de vos performances.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Utilisez la <strong>Recherche globale</strong> en haut de page pour retrouver rapidement n'importe quelle information.
          </li>
        </ul>
      </div>

      {/* Modules grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Modules disponibles</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <div
                key={mod.title}
                className="group rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-blue-700">{mod.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {mod.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Roles section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Rôles et permissions</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Off-Market dispose d'un système de rôles pour contrôler l'accès aux différents modules :
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { role: 'Admin', desc: 'Accès complet à tous les modules et à la gestion des utilisateurs.' },
            { role: 'Manager', desc: 'Vue d\'ensemble de l\'équipe, gestion des clients et des leads.' },
            { role: 'Coach', desc: 'Suivi de ses clients assignés, entretiens et progression.' },
            { role: 'Setter', desc: 'Gestion de l\'activité de prospection et des messages envoyés.' },
            { role: 'Closer', desc: 'Gestion des appels de closing et suivi des conversions.' },
            { role: 'Monteur', desc: 'Gestion des contenus sociaux et du pipeline de création.' },
          ].map((item) => (
            <div key={item.role} className="rounded-md border border-border bg-background p-3">
              <span className="text-sm font-medium text-foreground">{item.role}</span>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
