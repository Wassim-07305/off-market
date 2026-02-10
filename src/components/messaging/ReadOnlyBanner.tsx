import { Lock } from 'lucide-react'

export function ReadOnlyBanner() {
  return (
    <div className="flex items-center gap-2 border-t border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
      <Lock className="h-4 w-4 shrink-0" />
      <span>Ce canal est en lecture seule. Seuls les administrateurs peuvent envoyer des messages.</span>
    </div>
  )
}
