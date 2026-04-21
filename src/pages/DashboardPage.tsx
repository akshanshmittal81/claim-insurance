import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ListChecks, FileText, Clock, CheckCircle2, XCircle, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store'
import { claimApi, authApi } from '@/services/api'
import { formatDate, claimIdToDisplay } from '@/utils'
import type { Claim } from '@/types'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'uploaded',    label: 'Submitted' },
  { key: 'processing',  label: 'Photos Verified' },
  { key: 'ai_analysis', label: 'AI Analysis' },
  { key: 'garage',      label: 'Garage Assigned' },
  { key: 'completed',   label: 'Payment Released' },
]

function getStepIndex(status: string) {
  if (status === 'completed' || status === 'rejected') return STEPS.length
  const idx = STEPS.findIndex(s => s.key === status)
  return idx === -1 ? 0 : idx
}

function ClaimTracker({ claim }: { claim: Claim }) {
  const activeIdx = getStepIndex(claim.status)
  return (
    <div className="flex gap-4 pt-3 pb-1 px-1">
      <div className="flex flex-col items-center" style={{ paddingTop: 2 }}>
        {STEPS.map((_, i) => (
          <div key={i}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i < activeIdx ? '#1D9E75' : i === activeIdx ? '#378ADD' : '#D3D1C7',
              boxShadow: i === activeIdx ? '0 0 0 3px #B5D4F4' : 'none',
            }} />
            {i < STEPS.length - 1 && (
              <div style={{ width: 2, height: 28, margin: '3px auto', background: i < activeIdx ? '#1D9E75' : '#D3D1C7' }} />
            )}
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col gap-4">
        {STEPS.map((step, i) => {
          const done = i < activeIdx
          const active = i === activeIdx
          return (
            <div key={step.key} className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold" style={{ color: done || active ? '#0F172A' : '#94A3B8' }}>{step.label}</div>
                <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{done ? 'Completed' : active ? 'In progress...' : 'Pending'}</div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: done ? '#E1F5EE' : active ? '#E6F1FB' : '#F1EFE8',
                  color: done ? '#0F6E56' : active ? '#185FA5' : '#5F5E5A',
                }}>
                {done ? 'done' : active ? 'active' : 'pending'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ✅ greeting function
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, setUser, claimList, setClaimList } = useAppStore()
  const [loadingUser, setLoadingUser] = useState(!user)
  const [loadingClaims, setLoadingClaims] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchUser = async () => {
    try { const res = await authApi.getUser(); setUser(res.data.data) }
    catch { }
    finally { setLoadingUser(false) }
  }

  const fetchClaims = async (silent = false) => {
    if (!silent) setLoadingClaims(true); else setRefreshing(true)
    try {
      const res = await claimApi.list()
      setClaimList(res.data.data)
    } catch {
      if (!silent) toast.error('Failed to load claims', { id: 'claims-error' })
    } finally {
      setLoadingClaims(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      if (!user) await fetchUser()
      await fetchClaims()
    }
    init()
  }, [])

  // ✅ policy expiry check
  const daysUntilExpiry = user?.policyExpiry
    ? Math.ceil((new Date(user.policyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const showExpiryWarning = daysUntilExpiry !== null && daysUntilExpiry <= 30

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
    if (status === 'completed') return { bg: '#E1F5EE', border: '#9FE1CB', color: '#0F6E56' }
    if (status === 'rejected') return { bg: '#FCEBEB', border: '#F09595', color: '#A32D2D' }
    return { bg: '#FAEEDA', border: '#FAC775', color: '#854F0B' }
  }

  const total = claimList.length
  const completed = claimList.filter(c => c.status === 'completed').length
  const inProgress = claimList.filter(c => c.status !== 'completed' && c.status !== 'rejected').length

  return (
    <AppLayout>
      <div className="space-y-4">

        {/* ✅ Welcome message */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-lg font-bold text-slate-800">
            {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'}! 👋
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* ✅ Policy expiry warning */}
        {showExpiryWarning && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-semibold">
              Your policy expires in <span className="font-bold">{daysUntilExpiry} days</span> — renew to stay covered.
            </p>
          </motion.div>
        )}

        {/* User Profile Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
              {user?.name?.[0] ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-800 text-base">{user?.name ?? 'User'}</div>
              <div className="text-xs text-slate-500 mt-0.5">+91 {user?.phone}</div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: '#E1F5EE', color: '#0F6E56', border: '1px solid #9FE1CB' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
          <div className="h-px mb-3" style={{ background: '#EFF6FF' }} />
          <div className="grid grid-cols-2 gap-0">
            {[
              { label: 'Vehicle', value: user?.vehicleNumber ?? '—', mono: true },
              { label: 'Policy', value: user?.policyStatus === 'active' ? 'Active' : 'Expired', green: true },
              { label: 'Expires', value: user?.policyExpiry ? new Date(user.policyExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
              { label: 'Claims', value: `${total} total` },
            ].map((item, i) => (
              <div key={i} className="py-2 flex justify-between items-center"
                style={{
                  borderRight: i % 2 === 0 ? '1px solid #EFF6FF' : 'none',
                  borderBottom: i < 2 ? '1px solid #EFF6FF' : 'none',
                  paddingRight: i % 2 === 0 ? 12 : 0,
                  paddingLeft: i % 2 === 1 ? 12 : 0,
                }}>
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className={`text-xs font-semibold ${item.mono ? 'font-mono' : ''}`}
                  style={{ color: item.green ? '#1D9E75' : '#0F172A' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: total, color: '#0F172A' },
            { label: 'Completed', value: completed, color: '#1D9E75' },
            { label: 'In Progress', value: inProgress, color: '#378ADD' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE' }}>
              <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={() => navigate('/claim/new')}
            className="rounded-3xl p-5 text-left transition-all duration-300 hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid #BFDBFE', boxShadow: '0 4px 20px rgba(59,130,246,0.08)' }}>
            {/* ✅ icon fix — missing # added */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div className="font-bold text-slate-800 text-sm">New Claim</div>
            <div className="text-xs text-slate-500 mt-0.5">Upload photos & submit</div>
          </motion.button>

          <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            onClick={() => navigate('/claims')}
            className="rounded-3xl p-5 text-left transition-all duration-300 hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid #BBF7D0', boxShadow: '0 4px 20px rgba(16,185,129,0.08)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
              <ListChecks className="w-4 h-4 text-white" />
            </div>
            <div className="font-bold text-slate-800 text-sm">My Claims</div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
              {refreshing ? 'Refreshing...' : 'View all submissions'}
            </div>
          </motion.button>
        </div>

        {/* Claims List */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-blue-500" /> Recent Claims
            </h2>
            {claimList.length > 0 && <span className="text-xs text-slate-400 font-mono">{claimList.length} total</span>}
          </div>

          {loadingClaims ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="rounded-2xl p-4 shimmer-bg h-16" />)}
            </div>
          ) : claimList.length === 0 ? (
            <div className="rounded-3xl p-16 text-center"
              style={{ background: 'rgba(255,255,255,0.7)', border: '2px dashed #BFDBFE' }}>
              <FileText className="w-10 h-10 text-blue-200 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold">No claims yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-6">Submit your first claim to get started</p>
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/claim/new')}>New Claim</Button>
            </div>
          ) : (
            <div className="rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>
              {claimList.map((claim, i) => {
                const badge = statusBadge(claim.status)
                const isExpanded = expandedId === claim.id
                return (
                  <div key={claim.id} style={{ borderBottom: i < claimList.length - 1 ? '1px solid #EFF6FF' : 'none' }}>
                    <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50/40 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : claim.id)}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: claim.status === 'completed' ? '#E1F5EE' : claim.status === 'rejected' ? '#FCEBEB' : '#FAEEDA' }}>
                        {statusIcon(claim.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-slate-700">{claimIdToDisplay(claim.id)}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}>
                            {claim.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(claim.createdAt)}</p>
                      </div>
                      <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                          <div className="px-4 pb-4" style={{ borderTop: '1px solid #EFF6FF' }}>
                            <ClaimTracker claim={claim} />
                            <button onClick={(e) => { e.stopPropagation(); handleTrackClaim(claim) }}
                              className="mt-3 w-full py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01]"
                              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white' }}>
                              View Full Details →
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

      </div>
    </AppLayout>
  )
}