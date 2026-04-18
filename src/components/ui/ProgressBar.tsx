import { motion } from 'framer-motion'
import { cn } from '@/utils'

interface ProgressBarProps {
  value: number // 0-100
  label?: string
  colorClass?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const sizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  label,
  colorClass = 'bg-blue-500',
  showValue = true,
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-ink-secondary">{label}</span>}
          {showValue && (
            <span className="text-xs font-mono font-semibold text-ink-primary">{clamped}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-surface-3 rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          className={cn('h-full rounded-full', colorClass)}
          initial={animated ? { width: 0 } : { width: `${clamped}%` }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  )
}
