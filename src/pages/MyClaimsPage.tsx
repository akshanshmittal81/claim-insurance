import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Clock, CheckCircle2, XCircle, ChevronRight, RefreshCw, Plus, Search, ArrowUpDown } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store'
import { claimApi } from '@/services/api'
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
                <div className="text-xs font-semibold" style={{ color: done || active ? '#0F172A' : '#94A3B8' }}>
                  {step.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                  {done ? 'Completed' : active ? 'In progress...' : 'Pending'}
                </div>
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

export default function MyClaimsPage() {
  const navigate = useNavigate()
  const { claimList, setClaimList } = useAppStore()
  const [loading, setLoading] = useState(!claimList.length)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const fetchClaims = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    try { const res = await claimApi.list(); setClaimList(res.data.data) }
    catch { if (!silent) toast.error('Failed to load claims') }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { fetchClaims() }, [])

  const handleTrackClaim = (claim: Claim) => {
    const store = useAppStore.getState()
    store.setActiveClaim(claim)
    if (claim.status !== 'completed' && claim.status !== 'rejected') {
      store.setClaimResult(null)
    }
    if (typeof store.setClaimStatus === 'function') {
      store.setClaimStatus(claim.status)
    }
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

  const activeCount = claimList.filter(c => c.status !== 'completed' && c.status !== 'rejected').length
  const completedCount = claimList.filter(c => c.status === 'completed' || c.status === 'rejected').length

  // Filter + Search + Sort
  const filtered = claimList
    .filter(c => {
      if (filter === 'active') return c.status !== 'completed' && c.status !== 'rejected'
      if (filter === 'completed') return c.status === 'completed' || c.status === 'rejected'
      return true
    })
    .filter(c => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        claimIdToDisplay(c.id).toLowerCase().includes(q) ||
        c.status.replace(/_/g, ' ').toLowerCase().includes(q) ||
        c.vehicleNumber?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const da = new Date(a.createdAt).getTime()
      const db = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? db - da : da - db
    })

  return (
    <AppLayout>
      <div className="space-y-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Claims</h1>
            <p className="text-xs text-slate-500 mt-0.5">{claimList.length} total claims</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchClaims(true)}
              className="p-2 rounded-xl hover:bg-blue-50 transition-colors">
              <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <button onClick={() => navigate('/claim/new')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>
              <Plus className="w-3.5 h-3.5" /> New Claim
            </button>
          </div>
        </motion.div>

        {/* Search + Sort */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE' }}>
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by claim ID or status..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            )}
          </div>
          <button
            onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', color: '#64748B' }}>
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </motion.div>

        {/* Filter tabs */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex gap-2">
          {[
            { key: 'all', label: `All (${claimList.length})` },
            { key: 'active', label: `Active (${activeCount})` },
            { key: 'completed', label: `Completed (${completedCount})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === f.key ? 'linear-gradient(135deg, #2563EB, #0EA5E9)' : 'rgba(255,255,255,0.9)',
                color: filter === f.key ? 'white' : '#64748B',
                border: filter === f.key ? 'none' : '1px solid #DBEAFE',
              }}>
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Search results info */}
        {search && (
          <p className="text-xs text-slate-400">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="text-slate-600 font-semibold">{search}</span>"
          </p>
        )}

        {/* Claims */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="rounded-2xl p-4 shimmer-bg h-20" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl p-16 text-center"
            style={{ background: 'rgba(255,255,255,0.7)', border: '2px dashed #BFDBFE' }}>
            <FileText className="w-10 h-10 text-blue-200 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No claims found</p>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              {search ? `No results for "${search}"` : filter === 'all' ? 'Submit your first claim to get started' : `No ${filter} claims`}
            </p>
            {!search && (
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/claim/new')}>New Claim</Button>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>
            {filtered.map((claim, i) => {
              const badge = statusBadge(claim.status)
              const isExpanded = expandedId === claim.id
              return (
                <div key={claim.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #EFF6FF' : 'none' }}>

                  <div className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-blue-50/40 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : claim.id)}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: claim.status === 'completed' ? '#E1F5EE' : claim.status === 'rejected' ? '#FCEBEB' : '#FAEEDA' }}>
                      {statusIcon(claim.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-slate-700">
                          {claimIdToDisplay(claim.id)}
                        </span>
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
          </motion.div>
        )}

      </div>
    </AppLayout>
  )
}