import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Target, MessageSquare, Calendar, FileText, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAddOption {
  id: string
  label: string
  description: string
  icon: typeof Plus
  color: string
  path: string
}

const QUICK_ADD_OPTIONS: QuickAddOption[] = [
  {
    id: 'lead',
    label: 'Nouveau lead',
    description: 'Ajouter un prospect au pipeline',
    icon: Target,
    color: 'bg-red-500/10 text-red-600',
    path: '/pipeline?action=new',
  },
  {
    id: 'message',
    label: 'Nouveau message',
    description: 'Démarrer une conversation',
    icon: MessageSquare,
    color: 'bg-blue-500/10 text-blue-600',
    path: '/messaging?action=new',
  },
  {
    id: 'call',
    label: 'Planifier un call',
    description: 'Ajouter un appel au calendrier',
    icon: Calendar,
    color: 'bg-amber-500/10 text-amber-600',
    path: '/calendrier?action=new',
  },
  {
    id: 'client',
    label: 'Nouveau client',
    description: 'Ajouter un client',
    icon: User,
    color: 'bg-emerald-500/10 text-emerald-600',
    path: '/clients?action=new',
  },
  {
    id: 'journal',
    label: 'Entrée journal',
    description: 'Noter vos réflexions',
    icon: FileText,
    color: 'bg-purple-500/10 text-purple-600',
    path: '/journal?action=new',
  },
]

interface QuickAddModalProps {
  open: boolean
  onClose: () => void
}

export function QuickAddModal({ open, onClose }: QuickAddModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  // Reset selection when opening
  useEffect(() => {
    if (open) setSelectedIndex(0)
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => (i + 1) % QUICK_ADD_OPTIONS.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => (i - 1 + QUICK_ADD_OPTIONS.length) % QUICK_ADD_OPTIONS.length)
          break
        case 'Enter':
          e.preventDefault()
          handleSelect(QUICK_ADD_OPTIONS[selectedIndex])
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, selectedIndex, onClose])

  const handleSelect = (option: QuickAddOption) => {
    onClose()
    navigate(option.path)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-2xl border border-border/40 bg-white shadow-2xl dark:bg-slate-900 dark:border-slate-700"
              initial={{ scale: 0.95, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-4 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground dark:text-white">Création rapide</h2>
                    <p className="text-xs text-muted-foreground">Cmd+N depuis n'importe où</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Options */}
              <div className="p-2">
                {QUICK_ADD_OPTIONS.map((option, index) => {
                  const Icon = option.icon
                  const isSelected = index === selectedIndex

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                        isSelected
                          ? 'bg-primary/5 dark:bg-slate-800'
                          : 'hover:bg-muted/50 dark:hover:bg-slate-800/50'
                      )}
                    >
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', option.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground dark:text-white">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                      {isSelected && (
                        <kbd className="rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-slate-700 dark:border-slate-600">
                          Entrée
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-border/40 bg-muted/30 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-white px-1.5 py-0.5 font-medium dark:bg-slate-700 dark:border-slate-600">↑↓</kbd>
                    Naviguer
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-white px-1.5 py-0.5 font-medium dark:bg-slate-700 dark:border-slate-600">↵</kbd>
                    Sélectionner
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-white px-1.5 py-0.5 font-medium dark:bg-slate-700 dark:border-slate-600">Esc</kbd>
                    Fermer
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
