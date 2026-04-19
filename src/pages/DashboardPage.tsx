import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ListChecks, Car, FileText, Clock, CheckCircle2, XCircle, ChevronRight, RefreshCw } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store'
import { claimApi, authApi } from '@/services/api'
import { formatDate, claimIdToDisplay } from '@/utils'
import type { Claim } from '@/types'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, setUser, claimList, setClaimList } = useAppStore()
  const [_loadingUser, setLoadingUser] = useState(!user)
  const [loadingClaims, setLoadingClaims] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchUser = async () => {
    try { const res = await authApi.getUser(); setUser(res.data.data) }
    catch { } finally { setLoadingUser(false) }
  }

  const fetchClaims = async (silent = false) => {
    if (!silent) setLoadingClaims(true); else setRefreshing(true)
    try { const res = await claimApi.list(); setClaimList(res.data.data) }
    catch { if (!silent) toast.error('Failed to load claims') }
    finally { setLoadingClaims(false); setRefreshing(false) }
  }

  useEffect(() => { if (!user) fetchUser(); fetchClaims() }, [])

  const handleTrackClaim = (claim: Claim) => {
    useAppStore.getState().setActiveClaim(claim)
    navigate(claim.status === 'completed' || claim.status === 'rejected'
      ? `/claim/${claim.id}/result` : `/claim/${claim.id}/processing`)
  }

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    if (status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />
    return <Clock className="w-4 h-4 text-amber-500" />
  }

  const statusBadge = (status: string) => {
    if (status === 'completed') return { bg: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', border: '#6EE7B7', color: '#065F46' }
    if (status === 'rejected') return { bg: '#FEE2E2', border: '#FCA5A5', color: '#991B1B' }
    return { bg: '#FEF3C7', border: '#FCD34D', color: '#92400E' }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Welcome back, {user?.name?.split(' ')[0] ?? 'User'} 👋
          </h1>
          <p className="text-slate-500 text-sm">Manage your vehicle insurance claims</p>
        </motion.div>

        {/* Vehicle Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl p-6" style={{
            background: 'linear-gradient(135deg, #1D4ED8, #0EA5E9, #10B981)',
            boxShadow: '0 8px 32px rgba(37,99,235,0.25)'
          }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Car className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono font-bold text-xl text-white">{user?.vehicleNumber}</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  {user?.policyStatus === 'active' ? 'Policy Active' : 'Policy Expired'}
                </span>
              </div>
              <p className="text-blue-100 text-sm mt-1">
                {user?.policyExpiry
                  ? `Expires: ${new Date(user.policyExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`
                  : 'Policy details unavailable'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs uppercase tracking-wide">Registered</p>
              <p className="text-white font-mono font-semibold">{user?.phone}</p>
            </div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            onClick={() => navigate('/claim/new')}
            className="rounded-3xl p-6 text-left transition-all duration-300 hover:scale-[1.02] group"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid #BFDBFE', boxShadow: '0 4px 20px rgba(59,130,246,0.08)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-800">New Claim</h3>
                <p className="text-xs text-slate-500 mt-1">Upload damage photos &amp; submit</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>

          <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onClick={() => fetchClaims(true)}
            className="rounded-3xl p-6 text-left transition-all duration-300 hover:scale-[1.02] group"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid #BBF7D0', boxShadow: '0 4px 20px rgba(16,185,129,0.08)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                  <ListChecks className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-800">My Claims</h3>
                <p className="text-xs text-slate-500 mt-1">View all submitted claims</p>
              </div>
              <RefreshCw className={`w-4 h-4 text-slate-300 transition-all ${refreshing ? 'animate-spin text-emerald-500' : 'group-hover:rotate-180'}`} />
            </div>
          </motion.button>
        </div>

        {/* Claims List */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Recent Claims
            </h2>
            {claimList.length > 0 && <span className="text-xs text-slate-400 font-mono">{claimList.length} total</span>}
          </div>

          {loadingClaims ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl p-4 shimmer-bg h-16" />
              ))}
            </div>
          ) : claimList.length === 0 ? (
            <div className="rounded-3xl p-16 text-center" style={{
              background: 'rgba(255,255,255,0.7)',
              border: '2px dashed #BFDBFE'
            }}>
              <FileText className="w-10 h-10 text-blue-200 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold">No claims yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-6">Submit your first claim to get started</p>
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/claim/new')}>
                New Claim
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {claimList.map((claim, i) => {
                const badge = statusBadge(claim.status)
                return (
                  <motion.div key={claim.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] group"
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 2px 12px rgba(59,130,246,0.06)' }}
                    onClick={() => handleTrackClaim(claim)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: claim.status === 'completed' ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' : claim.status === 'rejected' ? '#FEE2E2' : '#FEF3C7' }}>
                        {statusIcon(claim.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-700">{claimIdToDisplay(claim.id)}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}>
                            {claim.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(claim.createdAt)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
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