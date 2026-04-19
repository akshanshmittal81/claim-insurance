import { motion } from 'framer-motion'
import { Upload, ScanLine, ShieldCheck, Eye, Cpu, MapPin, Banknote, CheckCircle2, Loader2, Circle } from 'lucide-react'
import type { ClaimStatus } from '@/types'
import { CLAIM_STEPS } from '@/constants'
import { cn } from '@/utils'

const iconMap: Record<string, React.ElementType> = { Upload, ScanLine, ShieldCheck, Eye, Cpu, MapPin, Banknote }

function getStepIndex(status: ClaimStatus | null): number {
  if (!status) return -1
  return CLAIM_STEPS.findIndex((s) => s.id === status)
}

export function ClaimStepper({ currentStatus }: { currentStatus: ClaimStatus | null }) {
  const activeIndex = getStepIndex(currentStatus)
  return (
    <div className="space-y-2">
      {CLAIM_STEPS.map((step, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending'
        const Icon = iconMap[step.icon] ?? Circle
        return (
          <motion.div key={step.id}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-500"
            style={{
              background: state === 'done' ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)'
                : state === 'active' ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)'
                : 'rgba(255,255,255,0.6)',
              border: state === 'done' ? '1px solid #BBF7D0'
                : state === 'active' ? '1.5px solid #93C5FD'
                : '1px solid #F1F5F9',
              boxShadow: state === 'active' ? '0 4px 20px rgba(59,130,246,0.12)' : 'none',
              opacity: state === 'pending' ? 0.5 : 1
            }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: state === 'done' ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)'
                  : state === 'active' ? 'linear-gradient(135deg, #DBEAFE, #BFDBFE)'
                  : '#F1F5F9'
              }}>
              {state === 'done' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                : state === 'active' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="w-5 h-5 text-blue-500" />
                  </motion.div>
                ) : <Icon className="w-5 h-5 text-slate-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-bold',
                  state === 'done' ? 'text-emerald-600' : state === 'active' ? 'text-blue-600' : 'text-slate-400')}>
                  {step.label}
                </span>
                {state === 'active' && (
                  <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs text-blue-400 font-mono">processing...</motion.span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
            </div>
            <span className="text-xs font-mono text-slate-300 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
          </motion.div>
        )
      })}
    </div>
  )
}