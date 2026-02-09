import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Blockage } from '@/types/database'

interface BlockageAccordionProps {
  blockages: Blockage[]
}

const CATEGORY_COLORS: Record<string, string> = {
  technique: 'bg-blue-100 text-blue-700',
  motivation: 'bg-orange-100 text-orange-700',
  organisation: 'bg-purple-100 text-purple-700',
  communication: 'bg-green-100 text-green-700',
  formation: 'bg-yellow-100 text-yellow-700',
  autre: 'bg-gray-100 text-gray-600',
}

const CATEGORY_LABELS: Record<string, string> = {
  technique: 'Technique',
  motivation: 'Motivation',
  organisation: 'Organisation',
  communication: 'Communication',
  formation: 'Formation',
  autre: 'Autre',
}

export function BlockageAccordion({ blockages }: BlockageAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (blockages.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Aucun blocage enregistré.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {blockages.map((blockage) => {
        const isExpanded = expandedIds.has(blockage.id)
        const whys = [
          blockage.why_1,
          blockage.why_2,
          blockage.why_3,
          blockage.why_4,
          blockage.why_5,
        ].filter(Boolean) as string[]

        return (
          <div
            key={blockage.id}
            className="rounded-lg border border-border bg-card"
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => toggleExpand(blockage.id)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left',
                'transition-colors duration-150',
                'hover:bg-secondary/50',
                'cursor-pointer'
              )}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              {blockage.category && (
                <Badge
                  className={cn(
                    CATEGORY_COLORS[blockage.category] ?? CATEGORY_COLORS.autre
                  )}
                >
                  {CATEGORY_LABELS[blockage.category] ?? blockage.category}
                </Badge>
              )}
              <span className="flex-1 truncate text-sm font-medium text-foreground">
                {blockage.problem}
              </span>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-border px-4 py-4">
                {/* 5 Whys chain */}
                {whys.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Analyse 5 Pourquoi
                    </h4>
                    <div className="flex flex-col gap-1">
                      {whys.map((why, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2"
                          style={{ paddingLeft: `${index * 16}px` }}
                        >
                          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                            {index > 0 && (
                              <span className="text-muted-foreground/50">
                                &rarr;
                              </span>
                            )}
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{why}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Root cause */}
                {blockage.root_cause && (
                  <div className="mb-3">
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cause racine
                    </h4>
                    <p className="text-sm text-foreground">{blockage.root_cause}</p>
                  </div>
                )}

                {/* Decided action */}
                {blockage.decided_action && (
                  <div className="mb-3">
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action décidée
                    </h4>
                    <p className="text-sm text-foreground">{blockage.decided_action}</p>
                  </div>
                )}

                {/* Result */}
                {blockage.result && (
                  <div>
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Résultat
                    </h4>
                    <p className="text-sm text-foreground">{blockage.result}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
