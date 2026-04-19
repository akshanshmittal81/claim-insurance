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
      if (status === 'completed' || status === 'rejected')
        setTimeout(() => navigate(`/claim/${claimId}/result`), 1000)
    },
  })

  useEffect(() => { if (!claimId) navigate('/dashboard') }, [claimId, navigate])

  const isTerminal = claimStatus === 'completed' || claimStatus === 'rejected'

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Claim' }, { label: 'Processing' }]} />
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6" style={{
            background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            border: '1.5px solid #93C5FD',
            boxShadow: '0 4px 24px rgba(59,130,246,0.1)'
          }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-slate-800">{claimId ? claimIdToDisplay(claimId) : 'Processing Claim'}</h1>
                {activeClaim?.vehicleNumber && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-lg text-blue-700"
                    style={{ background: '#DBEAFE', border: '1px solid #BFDBFE' }}>
                    {activeClaim.vehicleNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTerminal ? 'Processing complete — redirecting to results'
                  : 'Your claim is being processed in real-time. Usually under 60 seconds.'}
              </p>
            </div>
          </div>
          {!isTerminal && (
            <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: '#BFDBFE' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #2563EB, #10B981)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
          )}
        </motion.div>

        {/* Stepper */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <ClaimStepper currentStatus={claimStatus} />
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex-1">Back to Dashboard</Button>
          <Button variant="secondary" onClick={() => navigate(`/claim/${claimId}/blockchain`)}
            icon={<ExternalLink className="w-4 h-4" />} className="flex-1">Blockchain Record</Button>
          {isTerminal && (
            <Button variant="primary" onClick={() => navigate(`/claim/${claimId}/result`)}
              icon={<ArrowRight className="w-4 h-4" />} iconPosition="right" className="flex-1">View Results</Button>
          )}
        </motion.div>
        <p className="text-xs text-slate-400 text-center">You can close this page. We'll notify you when ready.</p>
      </div>
    </AppLayout>
  )
}