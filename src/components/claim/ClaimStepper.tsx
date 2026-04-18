import { motion } from 'framer-motion'
import {
  Upload, ScanLine, ShieldCheck, Eye, Cpu, MapPin, Banknote,
  CheckCircle2, Loader2, Circle,
} from 'lucide-react'
import type { ClaimStatus } from '@/types'
import { CLAIM_STEPS } from '@/constants'
import { cn } from '@/utils'

const iconMap: Record<string, React.ElementType> = {
  Upload, ScanLine, ShieldCheck, Eye, Cpu, MapPin, Banknote,
}

type StepState = 'done' | 'active' | 'pending'

function getStepIndex(status: ClaimStatus | null): number {
  if (!status) return -1
  return CLAIM_STEPS.findIndex((s) => s.id === status)
}

interface ClaimStepperProps {
  currentStatus: ClaimStatus | null
}

export function ClaimStepper({ currentStatus }: ClaimStepperProps) {
  const activeIndex = getStepIndex(currentStatus)

  return (
    <div className="space-y-2">
      {CLAIM_STEPS.map((step, i) => {
        const state: StepState =
          i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending'
        const Icon = iconMap[step.icon] ?? Circle

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className={cn(
              'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500',
              state === 'done' && 'bg-emerald-500/5 border-emerald-500/15',
              state === 'active' && 'bg-blue-500/8 border-blue-500/25 glow-blue',
              state === 'pending' && 'bg-surface-1 border-surface-2 opacity-50'
            )}
          >
            {/* Step icon */}
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500',
                state === 'done' && 'bg-emerald-500/15',
                state === 'active' && 'bg-blue-500/15',
                state === 'pending' && 'bg-surface-3'
              )}
            >
              {state === 'done' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : state === 'active' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-5 h-5 text-blue-400" />
                </motion.div>
              ) : (
                <Icon className="w-5 h-5 text-ink-muted" />
              )}
            </div>

            {/* Step info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    state === 'done' && 'text-emerald-400',
                    state === 'active' && 'text-blue-400',
                    state === 'pending' && 'text-ink-muted'
                  )}
                >
                  {step.label}
                </span>
                {state === 'active' && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs text-blue-400/70 font-mono"
                  >
                    processing...
                  </motion.span>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-0.5">{step.description}</p>
            </div>

            {/* Step number */}
            <span className="text-xs font-mono text-ink-muted flex-shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
