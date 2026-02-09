import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  clients: 'Clients',
  leads: 'Leads',
  'call-calendar': 'Calendrier',
  'closer-calls': 'Closer Calls',
  'setter-activity': 'Activité Setter',
  'social-content': 'Contenus Social',
  finances: 'Finances',
  instagram: 'Instagram',
  interviews: 'Entretiens',
  users: 'Utilisateurs',
  documentation: 'Documentation',
}

export function Breadcrumb() {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  if (pathSegments.length === 0) {
    return (
      <nav className="flex items-center text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <ChevronRight className="mx-1.5 h-3.5 w-3.5" />
        <span className="font-medium text-foreground">Dashboard</span>
      </nav>
    )
  }

  return (
    <nav className="flex min-w-0 items-center text-sm text-muted-foreground">
      <Link
        to="/"
        className="shrink-0 transition-colors hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/')
        const isLast = index === pathSegments.length - 1
        const label = ROUTE_LABELS[segment] ?? decodeURIComponent(segment)

        return (
          <span key={path} className="flex min-w-0 items-center">
            <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0" />
            {isLast ? (
              <span className="max-w-[180px] truncate font-medium text-foreground">
                {label}
              </span>
            ) : (
              <Link
                to={path}
                className="shrink-0 transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
