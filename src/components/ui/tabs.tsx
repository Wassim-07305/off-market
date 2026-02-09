import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabItem {
  value: string
  label: ReactNode
  disabled?: boolean
}

interface TabsListProps {
  tabs: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

function TabsList({ tabs, value, onChange, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto border-b border-border',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          disabled={tab.disabled}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative inline-flex shrink-0 whitespace-nowrap items-center px-4 py-2.5 text-sm font-medium',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-50',
            'cursor-pointer',
            value === tab.value
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground',
            value === tab.value &&
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-red-500 after:to-rose-500 after:content-[""] after:rounded-full'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

interface TabsContentProps {
  value: string
  activeValue: string
  children: ReactNode
  className?: string
}

function TabsContent({ value, activeValue, children, className }: TabsContentProps) {
  if (value !== activeValue) return null

  return (
    <div
      role="tabpanel"
      className={cn('mt-4 focus-visible:outline-none', className)}
    >
      {children}
    </div>
  )
}

export { TabsList, TabsContent }
export type { TabItem, TabsListProps, TabsContentProps }
