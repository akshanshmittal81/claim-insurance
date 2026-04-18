import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, ExternalLink } from 'lucide-react'
import { AppLayout, Breadcrumb } from '@/components/layout/AppLayout'
import { ClaimStepper } from '@/components/claim/ClaimStepper'
import { Button } from '@/components/ui/Button'
import { useClaimPolling } from '@/hooks/useClaimPolling'
import { useAppStore } from '@/store'
import { claimIdToDisplay } from '@/utils'

export default function ClaimProcessingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { claimStatus, activeClaim } = useAppStore()

  const claimId = id ?? ''

  useClaimPolling({
    claimId,
    onComplete: (status) => {
      if (status === 'completed' || status === 'rejected') {
        setTimeout(() => navigate(`/claim/${claimId}/result`), 1000)
      }
    },
  })

  useEffect(() => {
    if (!claimId) navigate('/dashboard')
  }, [claimId, navigate])

  const isTerminal = claimStatus === 'completed' || claimStatus === 'rejected'

  return (
    <AppLayout>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Claim', href: '#' },
          { label: 'Processing' },
        ]}
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border border-blue-500/15 bg-blue-500/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-ink-primary">
                  {claimId ? claimIdToDisplay(claimId) : 'Processing Claim'}
                </h1>
                {activeClaim?.vehicleNumber && (
                  <span className="font-mono text-xs bg-surface-3 px-2 py-0.5 rounded-lg text-ink-secondary">
                    {activeClaim.vehicleNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                {isTerminal
                  ? 'Processing complete — redirecting to results'
                  : 'Your claim is being processed in real-time. This usually takes under 60 seconds.'}
              </p>
            </div>
          </div>

          {/* Pulsing progress bar */}
          {!isTerminal && (
            <div className="mt-4 h-1 bg-surface-3 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          )}
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ClaimStepper currentStatus={claimStatus} />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            Back to Dashboard
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/claim/${claimId}/blockchain`)}
            icon={<ExternalLink className="w-4 h-4" />}
            className="flex-1"
          >
            Blockchain Record
          </Button>
          {isTerminal && (
            <Button
              variant="primary"
              onClick={() => navigate(`/claim/${claimId}/result`)}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="flex-1"
            >
              View Results
            </Button>
          )}
        </motion.div>

        {/* Footer note */}
        <p className="text-xs text-ink-muted text-center">
          You can close this page. We'll notify you when the decision is ready.
        </p>
      </div>
    </AppLayout>
  )
}
