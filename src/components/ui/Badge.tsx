import { cn } from '@/utils'

interface BadgeProps {
  variant?: 'active' | 'expired' | 'pending' | 'info' | 'default'
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variants = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  expired: 'bg-red-500/10 text-red-400 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  default: 'bg-surface-3 text-ink-secondary border-surface-4',
}

const dotColors = {
  active: 'bg-emerald-400',
  expired: 'bg-red-400',
  pending: 'bg-amber-400',
  info: 'bg-blue-400',
  default: 'bg-ink-muted',
}

export function Badge({ variant = 'default', children, className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}
