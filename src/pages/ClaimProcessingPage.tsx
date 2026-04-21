import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, ExternalLink, Bell, BellOff } from 'lucide-react'
import { AppLayout, Breadcrumb } from '@/components/layout/AppLayout'
import { ClaimStepper } from '@/components/claim/ClaimStepper'
import { Button } from '@/components/ui/Button'
import { useClaimPolling } from '@/hooks/useClaimPolling'
import { useAppStore } from '@/store'
import { claimIdToDisplay } from '@/utils'
import { requestNotificationPermission } from '@/utils/notifications'
import { useState } from 'react'

export default function ClaimProcessingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { claimStatus, activeClaim } = useAppStore()
  const claimId = id ?? ''
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  )

  useClaimPolling({
    claimId,
    onComplete: (status) => {
      if (status === 'completed' || status === 'rejected')
        setTimeout(() => navigate(`/claim/${claimId}/result`), 1000)
    },
  })

  useEffect(() => { if (!claimId) navigate('/dashboard') }, [claimId, navigate])

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    setNotifPermission(granted ? 'granted' : 'denied')
  }

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
                {isTerminal
                  ? 'Processing complete — redirecting to results'
                  : 'Your claim is being processed in real-time. Usually under 10 minutes.'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {!isTerminal && (
            <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: '#BFDBFE' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #2563EB, #10B981)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
          )}
        </motion.div>

        {/* Notification Banner */}
        {notifPermission !== 'granted' && !isTerminal && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#FEF3C7' }}>
              {notifPermission === 'denied'
                ? <BellOff className="w-4 h-4 text-amber-500" />
                : <Bell className="w-4 h-4 text-amber-500" />
              }
            </div>
            <div className="flex-1 min-w-0">
              {notifPermission === 'denied' ? (
                <>
                  <p className="text-xs font-semibold text-amber-800">Notifications blocked</p>
                  <p className="text-xs text-amber-600 mt-0.5">Enable in browser settings to get claim updates</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-amber-800">Get notified when claim is ready</p>
                  <p className="text-xs text-amber-600 mt-0.5">We'll alert you on every status update</p>
                </>
              )}
            </div>
            {notifPermission !== 'denied' && (
              <button
                onClick={handleEnableNotifications}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white' }}>
                Enable
              </button>
            )}
          </motion.div>
        )}

        {/* Notification enabled badge */}
        {notifPermission === 'granted' && !isTerminal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Bell className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-xs font-semibold text-emerald-700">
              Notifications enabled — we'll alert you on every update
            </p>
          </motion.div>
        )}

        {/* Stepper */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <ClaimStepper currentStatus={claimStatus} />
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex-1">
            Back to Dashboard
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/claim/${claimId}/blockchain`)}
            icon={<ExternalLink className="w-4 h-4" />} className="flex-1">
            Blockchain Record
          </Button>
          {isTerminal && (
            <Button variant="primary" onClick={() => navigate(`/claim/${claimId}/result`)}
              icon={<ArrowRight className="w-4 h-4" />} iconPosition="right" className="flex-1">
              View Results
            </Button>
          )}
        </motion.div>

        <p className="text-xs text-slate-400 text-center">
          {notifPermission === 'granted'
            ? '🔔 Notifications on — you can safely close this tab'
            : 'Enable notifications to get updates when you close this tab'}
        </p>

      </div>
    </AppLayout>
  )
}