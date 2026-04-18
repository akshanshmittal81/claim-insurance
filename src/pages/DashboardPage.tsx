import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  ListChecks,
  Car,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton'
import { useAppStore } from '@/store'
import { claimApi, authApi } from '@/services/api'
import { formatDate, claimIdToDisplay } from '@/utils'
import type { Claim } from '@/types'
import toast from 'react-hot-toast'

const statusIconMap: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  rejected: <XCircle className="w-4 h-4 text-red-400" />,
  default: <Clock className="w-4 h-4 text-amber-400" />,
}

const statusBadgeMap: Record<string, 'active' | 'expired' | 'pending'> = {
  completed: 'active',
  rejected: 'expired',
  default: 'pending',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, setUser, claimList, setClaimList } = useAppStore()
  const [loadingUser, setLoadingUser] = useState(!user)
  const [loadingClaims, setLoadingClaims] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchUser = async () => {
    try {
      const res = await authApi.getUser()
      setUser(res.data.data)
    } catch {
      // user already in store
    } finally {
      setLoadingUser(false)
    }
  }

  const fetchClaims = async (silent = false) => {
    if (!silent) setLoadingClaims(true)
    else setRefreshing(true)
    try {
      const res = await claimApi.list()
      setClaimList(res.data.data)
    } catch {
      if (!silent) toast.error('Failed to load claims')
    } finally {
      setLoadingClaims(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!user) fetchUser()
    fetchClaims()
  }, [])

  const handleTrackClaim = (claim: Claim) => {
    useAppStore.getState().setActiveClaim(claim)
    if (claim.status === 'completed' || claim.status === 'rejected') {
      navigate(`/claim/${claim.id}/result`)
    } else {
      navigate(`/claim/${claim.id}/processing`)
    }
  }

  const policyBadgeVariant =
    user?.policyStatus === 'active'
      ? 'active'
      : user?.policyStatus === 'expired'
      ? 'expired'
      : 'pending'

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-ink-primary mb-1">
            {loadingUser ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <>Welcome back, {user?.name?.split(' ')[0] ?? 'User'} 👋</>
            )}
          </h1>
          <p className="text-ink-secondary text-sm">Manage your vehicle insurance claims</p>
        </motion.div>

        {/* Vehicle & Policy card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card border border-white/5"
        >
          {loadingUser ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Car className="w-7 h-7 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-lg text-ink-primary">
                    {user?.vehicleNumber}
                  </span>
                  <Badge variant={policyBadgeVariant} dot>
                    {user?.policyStatus === 'active'
                      ? 'Policy Active'
                      : user?.policyStatus === 'expired'
                      ? 'Policy Expired'
                      : 'Policy Pending'}
                  </Badge>
                </div>
                <p className="text-sm text-ink-secondary mt-0.5">
                  {user?.policyExpiry
                    ? `Policy expires: ${new Date(user.policyExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`
                    : 'Policy details unavailable'}
                </p>
              </div>
              <div className="text-sm text-ink-muted">
                <span className="text-xs uppercase tracking-wide">Registered</span>
                <p className="text-ink-secondary">{user?.phone}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <button
            onClick={() => navigate('/claim/new')}
            className="card border border-blue-500/20 hover:border-blue-500/40 group transition-all duration-300 hover:scale-[1.02] text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-ink-primary">New Claim</h3>
                <p className="text-xs text-ink-secondary mt-1">Upload damage photos &amp; submit</p>
              </div>
              <ChevronRight className="w-5 h-5 text-ink-muted group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          <button
            onClick={() => fetchClaims(true)}
            className="card border border-white/5 hover:border-white/10 group transition-all duration-300 hover:scale-[1.02] text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center mb-3">
                  <ListChecks className="w-5 h-5 text-ink-secondary" />
                </div>
                <h3 className="font-semibold text-ink-primary">My Claims</h3>
                <p className="text-xs text-ink-secondary mt-1">View all submitted claims</p>
              </div>
              <RefreshCw
                className={`w-4 h-4 text-ink-muted transition-all ${refreshing ? 'animate-spin text-blue-400' : 'group-hover:rotate-180'}`}
              />
            </div>
          </button>
        </motion.div>

        {/* Claims list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-primary flex items-center gap-2">
              <FileText className="w-4 h-4 text-ink-muted" />
              Recent Claims
            </h2>
            {claimList.length > 0 && (
              <span className="text-xs text-ink-muted font-mono">{claimList.length} total</span>
            )}
          </div>

          {loadingClaims ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : claimList.length === 0 ? (
            <div className="card border border-dashed border-surface-4 py-16 text-center">
              <FileText className="w-10 h-10 text-ink-muted mx-auto mb-3" />
              <p className="text-ink-secondary font-medium">No claims yet</p>
              <p className="text-xs text-ink-muted mt-1 mb-6">
                Submit your first claim to get started
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/claim/new')}
              >
                New Claim
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {claimList.map((claim, i) => {
                const statusIcon = statusIconMap[claim.status] ?? statusIconMap.default
                const badgeVariant = statusBadgeMap[claim.status] ?? statusBadgeMap.default
                return (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card border border-white/5 hover:border-white/10 group transition-all duration-200 cursor-pointer"
                    onClick={() => handleTrackClaim(claim)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center flex-shrink-0">
                        {statusIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-ink-primary">
                            {claimIdToDisplay(claim.id)}
                          </span>
                          <Badge variant={badgeVariant}>
                            {claim.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {formatDate(claim.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink-secondary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  )
}
