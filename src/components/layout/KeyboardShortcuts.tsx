import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

interface ShortcutGroup {
  title: string
  shortcuts: { keys: string[]; description: string }[]
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Ouvrir la recherche globale' },
      { keys: ['⌘', 'B'], description: 'Basculer la sidebar' },
      { keys: ['?'], description: 'Afficher les raccourcis clavier' },
      { keys: ['Esc'], description: 'Fermer les modales' },
    ],
  },
  {
    title: 'Actions rapides',
    shortcuts: [
      { keys: ['⌘', 'N'], description: 'Nouvelle conversation (messagerie)' },
      { keys: ['⌘', 'Enter'], description: 'Envoyer le message' },
      { keys: ['Enter'], description: 'Valider / Soumettre' },
    ],
  },
  {
    title: 'Édition',
    shortcuts: [
      { keys: ['⌘', 'S'], description: 'Sauvegarder' },
      { keys: ['⌘', 'Z'], description: 'Annuler' },
      { keys: ['⌘', '⇧', 'Z'], description: 'Rétablir' },
    ],
  },
]

export function KeyboardShortcuts() {
  const { keyboardShortcutsOpen, setKeyboardShortcutsOpen, setCommandPaletteOpen, toggleSidebar } = useUIStore()

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ? to open keyboard shortcuts (when not in input)
      if (e.key === '?' && !isInputFocused()) {
        e.preventDefault()
        setKeyboardShortcutsOpen(true)
      }
      // Cmd+B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        if (keyboardShortcutsOpen) {
          setKeyboardShortcutsOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [keyboardShortcutsOpen, setKeyboardShortcutsOpen, setCommandPaletteOpen, toggleSidebar])

  return (
    <AnimatePresence>
      {keyboardShortcutsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setKeyboardShortcutsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-border/40 bg-white shadow-2xl dark:bg-slate-900 dark:border-slate-700"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/40 px-6 py-4 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Keyboard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground dark:text-white">Raccourcis clavier</h2>
                    <p className="text-xs text-muted-foreground">Naviguez plus rapidement</p>
                  </div>
                </div>
                <button
                  onClick={() => setKeyboardShortcutsOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                <div className="space-y-6">
                  {SHORTCUT_GROUPS.map((group) => (
                    <div key={group.title}>
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.title}
                      </h3>
                      <div className="space-y-2">
                        {group.shortcuts.map((shortcut) => (
                          <div
                            key={shortcut.description}
                            className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 dark:hover:bg-slate-800/50"
                          >
                            <span className="text-sm text-foreground dark:text-slate-200">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, i) => (
                                <kbd
                                  key={i}
                                  className={cn(
                                    'inline-flex h-6 min-w-6 items-center justify-center rounded border px-1.5',
                                    'bg-muted border-border text-xs font-medium text-muted-foreground',
                                    'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                                  )}
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border/40 bg-muted/30 px-6 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-center text-xs text-muted-foreground">
                  Appuyez sur <kbd className="mx-1 rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium dark:bg-slate-700 dark:border-slate-600">?</kbd> pour afficher ce menu
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function isInputFocused(): boolean {
  const activeElement = document.activeElement
  if (!activeElement) return false
  const tagName = activeElement.tagName.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || (activeElement as HTMLElement).isContentEditable
}
