import { Search } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

export function GlobalSearch() {
  const { setCommandPaletteOpen } = useUIStore()

  return (
    <button
      onClick={() => setCommandPaletteOpen(true)}
      className={cn(
        'flex h-10 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-muted-foreground',
        'transition-all duration-200',
        'hover:border-primary/30 hover:bg-secondary/80'
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">Rechercher ou naviguer...</span>
      <kbd className="hidden items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
        ⌘K
      </kbd>
    </button>
  )
}
