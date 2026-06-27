import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Users, FileText, Car, BarChart3, CheckCircle2,
  XCircle, Clock, AlertTriangle, TrendingUp, RefreshCw,
  Search, Download,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type DiagnosisStatus = 'claim_filed' | 'no_claim' | 'rejected'
type ClaimStatus = 'completed' | 'rejected' | 'processing' | 'ai_analysis' | 'uploaded' | 'garage'

interface DiagnosisRecord {
  id: string; user: string; initials: string; phone: string; damageType: string
  repairMin: number; repairMax: number; confidence: number; status: DiagnosisStatus
  date: string; claimId?: string
}
interface ClaimRecord {
  id: string; user: string; initials: string; damageType: string; estimatedCost: number
  aiDiagnosis: boolean; status: ClaimStatus; date: string; fraudScore: number
}
interface UserRecord {
  id: string; name: string; initials: string; phone: string; vehicle: string
  diagnoses: number; claims: number; status: 'active' | 'review' | 'inactive'; joined: string
}

const DIAGNOSES: DiagnosisRecord[] = [
  { id: 'D001', user: 'Rahul Sharma', initials: 'RS', phone: '+91 98101 23456', damageType: 'Dent + Scratch (front bumper)', repairMin: 28000, repairMax: 38000, confidence: 89, status: 'claim_filed', date: 'Aaj, 3:22 AM', claimId: 'CT-2041' },
  { id: 'D002', user: 'Priya Mehta', initials: 'PM', phone: '+91 97342 67890', damageType: 'Broken windshield', repairMin: 40000, repairMax: 55000, confidence: 94, status: 'claim_filed', date: 'Kal, 11:15 PM', claimId: 'CT-2040' },
  { id: 'D003', user: 'Aman Verma', initials: 'AV', phone: '+91 99001 11223', damageType: 'Minor scratch (uncertain)', repairMin: 3000, repairMax: 8000, confidence: 42, status: 'no_claim', date: '1 ghanta pehle' },
  { id: 'D004', user: 'Sunita Kapoor', initials: 'SK', phone: '+91 88765 43210', damageType: 'Side panel dent + door crumple', repairMin: 65000, repairMax: 90000, confidence: 82, status: 'claim_filed', date: '2 Jun', claimId: 'CT-2039' },
  { id: 'D005', user: 'Vijay Kumar', initials: 'VK', phone: '+91 91234 56789', damageType: 'Hood buckle, fender scratch', repairMin: 15000, repairMax: 22000, confidence: 76, status: 'rejected', date: '1 Jun', claimId: 'CT-2038' },
]

const CLAIMS: ClaimRecord[] = [
  { id: 'CT-2041', user: 'Rahul Sharma', initials: 'RS', damageType: 'Dent + Scratch', estimatedCost: 32000, aiDiagnosis: true, status: 'processing', date: 'Aaj', fraudScore: 12 },
  { id: 'CT-2040', user: 'Priya Mehta', initials: 'PM', damageType: 'Broken glass', estimatedCost: 45000, aiDiagnosis: true, status: 'completed', date: 'Kal', fraudScore: 8 },
  { id: 'CT-2039', user: 'Sunita Kapoor', initials: 'SK', damageType: 'Major collision', estimatedCost: 120000, aiDiagnosis: false, status: 'completed', date: '2 Jun', fraudScore: 5 },
  { id: 'CT-2038', user: 'Vijay Kumar', initials: 'VK', damageType: 'Hood damage', estimatedCost: 18500, aiDiagnosis: true, status: 'rejected', date: '1 Jun', fraudScore: 71 },
  { id: 'CT-2037', user: 'Deepak Singh', initials: 'DS', damageType: 'Rear bumper crack', estimatedCost: 22000, aiDiagnosis: true, status: 'ai_analysis', date: '31 May', fraudScore: 18 },
]

const USERS: UserRecord[] = [
  { id: 'U001', name: 'Rahul Sharma', initials: 'RS', phone: '+91 98101 23456', vehicle: 'DL 01 AB 1234', diagnoses: 5, claims: 2, status: 'active', joined: 'Jan 2025' },
  { id: 'U002', name: 'Priya Mehta', initials: 'PM', phone: '+91 97342 67890', vehicle: 'UP 80 CD 5678', diagnoses: 3, claims: 3, status: 'active', joined: 'Feb 2025' },
  { id: 'U003', name: 'Aman Verma', initials: 'AV', phone: '+91 99001 11223', vehicle: 'HR 26 EF 9012', diagnoses: 1, claims: 0, status: 'review', joined: 'Mar 2025' },
  { id: 'U004', name: 'Sunita Kapoor', initials: 'SK', phone: '+91 88765 43210', vehicle: 'MH 12 GH 3456', diagnoses: 7, claims: 5, status: 'active', joined: 'Dec 2024' },
  { id: 'U005', name: 'Vijay Kumar', initials: 'VK', phone: '+91 91234 56789', vehicle: 'RJ 14 IJ 7890', diagnoses: 2, claims: 1, status: 'inactive', joined: 'Apr 2025' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
}

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN') }

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 80 ? '#1D9E75' : value >= 60 ? '#D97706' : '#DC2626'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#EFF6FF' }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
    </div>
  )
}

function Avatar({ initials, color = 'blue' }: { initials: string; color?: string }) {
  const palettes: Record<string, { bg: string; text: string }> = {
    blue: { bg: '#DBEAFE', text: '#1D4ED8' }, green: { bg: '#D1FAE5', text: '#065F46' },
    amber: { bg: '#FEF3C7', text: '#92400E' }, red: { bg: '#FEE2E2', text: '#991B1B' },
    purple: { bg: '#EDE9FE', text: '#5B21B6' },
  }
  const p = palettes[color] ?? palettes.blue
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
      style={{ background: p.bg, color: p.text }}>
      {initials}
    </div>
  )
}

const avatarColor = (i: number) => ['blue', 'green', 'amber', 'red', 'purple'][i % 5]

function StatusBadge({ status }: { status: ClaimStatus | DiagnosisStatus | 'active' | 'review' | 'inactive' }) {
  const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
    completed:   { bg: '#E1F5EE', border: '#9FE1CB', color: '#0F6E56', label: 'Completed' },
    rejected:    { bg: '#FCEBEB', border: '#F09595', color: '#A32D2D', label: 'Rejected' },
    processing:  { bg: '#FAEEDA', border: '#FAC775', color: '#854F0B', label: 'Processing' },
    ai_analysis: { bg: '#EEF2FF', border: '#C7D2FE', color: '#3730A3', label: 'AI Analysis' },
    uploaded:    { bg: '#F0F9FF', border: '#BAE6FD', color: '#0369A1', label: 'Uploaded' },
    garage:      { bg: '#F0FDF4', border: '#BBF7D0', color: '#166534', label: 'Garage' },
    claim_filed: { bg: '#E1F5EE', border: '#9FE1CB', color: '#0F6E56', label: 'Claim Filed' },
    no_claim:    { bg: '#F1EFE8', border: '#D3D1C7', color: '#5F5E5A', label: 'No Claim' },
    active:      { bg: '#E1F5EE', border: '#9FE1CB', color: '#0F6E56', label: 'Active' },
    review:      { bg: '#FAEEDA', border: '#FAC775', color: '#854F0B', label: 'Review' },
    inactive:    { bg: '#F1EFE8', border: '#D3D1C7', color: '#5F5E5A', label: 'Inactive' },
  }
  const s = map[status] ?? map.inactive
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  )
}

function SectionDashboard() {
  const activity = [
    { icon: Car, iconBg: '#E1F5EE', iconColor: '#0F6E56', text: 'Rahul Sharma ne car diagnosis submit ki — Dent + Scratch detect hua', time: '2 min pehle' },
    { icon: FileText, iconBg: '#EEF2FF', iconColor: '#3730A3', text: 'Priya Mehta ne claim file kiya — ₹45,000 estimated repair', time: '15 min pehle' },
    { icon: AlertTriangle, iconBg: '#FFFBEB', iconColor: '#D97706', text: 'Aman Verma — AI confidence low (42%) — manual review chahiye', time: '1 ghanta pehle' },
    { icon: CheckCircle2, iconBg: '#E1F5EE', iconColor: '#0F6E56', text: 'Sunita Kapoor ka claim approve hua — ₹28,500', time: '3 ghante pehle' },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
        {[
          { label: 'Total Users', value: '1,284', delta: '+12%', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
          { label: 'Claims Filed', value: '342', delta: '+8%', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
          { label: 'Diagnoses', value: '891', delta: '+34%', color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD' },
          { label: 'Pending Review', value: '47', delta: 'Action needed', color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3' },
        ].map((m, i) => (
          <motion.div key={m.label} initial="hidden" animate="visible" variants={fadeUp} custom={i}
            className="rounded-2xl p-3 md:p-4" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
            <div className="text-[10px] md:text-xs font-medium mb-1" style={{ color: m.color, opacity: 0.8 }}>{m.label}</div>
            <div className="text-xl md:text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[10px] md:text-xs mt-1 font-medium" style={{ color: m.color, opacity: 0.65 }}>{m.delta} this month</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.4}
        className="rounded-2xl md:rounded-3xl p-4 md:p-5"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" /> Recent Activity
        </h3>
        <div className="space-y-3">
          {activity.map((a, i) => {
            const Icon = a.icon
            return (
              <div key={i} className="flex items-start gap-3 py-2" style={{ borderBottom: i < activity.length - 1 ? '1px solid #EFF6FF' : 'none' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.iconBg }}>
                  <Icon className="w-4 h-4" style={{ color: a.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-2.5 md:gap-3">
        {[
          { label: 'Diagnosis → Claim', value: '38%', sub: 'Conversion', color: '#2563EB' },
          { label: 'Avg AI Confidence', value: '81%', sub: 'This month', color: '#059669' },
          { label: 'Avg Repair Cost', value: '₹42K', sub: 'Per claim', color: '#D97706' },
        ].map((s, i) => (
          <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i * 0.1 + 0.5}
            className="rounded-xl md:rounded-2xl p-3 md:p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE' }}>
            <div className="text-[10px] md:text-xs text-slate-400 mb-1">{s.label}</div>
            <div className="text-lg md:text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] md:text-xs text-slate-400 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SectionUsers() {
  const [search, setSearch] = useState('')
  const filtered = USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-xl md:rounded-2xl px-3 py-2 md:py-2.5"
          style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE' }}>
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="flex-1 text-xs md:text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl text-xs font-semibold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
      <div className="rounded-2xl md:rounded-3xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>
        {filtered.map((u, i) => (
          <motion.div key={u.id} initial="hidden" animate="visible" variants={fadeUp} custom={i * 0.08}
            className="flex items-center gap-3 px-3 md:px-4 py-3 hover:bg-blue-50/40 transition-colors"
            style={{ borderBottom: i < filtered.length - 1 ? '1px solid #EFF6FF' : 'none' }}>
            <Avatar initials={u.initials} color={avatarColor(i)} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 text-xs md:text-sm">{u.name}</div>
              <div className="text-[10px] md:text-xs text-slate-400 truncate">{u.phone}</div>
            </div>
            <div className="hidden sm:flex items-center gap-3 md:gap-4 text-center">
              <div>
                <div className="text-sm font-bold text-slate-700">{u.diagnoses}</div>
                <div className="text-xs text-slate-400">Diag.</div>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-700">{u.claims}</div>
                <div className="text-xs text-slate-400">Claims</div>
              </div>
            </div>
            <StatusBadge status={u.status} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SectionClaims() {
  const [filter, setFilter] = useState<'all' | 'processing' | 'completed' | 'rejected'>('all')
  const tabs = [
    { key: 'all', label: `All (${CLAIMS.length})` },
    { key: 'processing', label: 'Pending' },
    { key: 'completed', label: 'Done' },
    { key: 'rejected', label: 'Rejected' },
  ] as const

  const filtered = filter === 'all' ? CLAIMS : CLAIMS.filter(c =>
    filter === 'processing' ? !['completed', 'rejected'].includes(c.status) : c.status === filter
  )

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex gap-1 p-1 rounded-xl md:rounded-2xl overflow-x-auto"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', scrollbarWidth: 'none' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key as typeof filter)}
            className="flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
            style={filter === t.key
              ? { background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white' }
              : { color: '#64748B' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl md:rounded-3xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial="hidden" animate="visible" variants={fadeUp} custom={i * 0.08}
            className="flex items-center gap-3 px-3 md:px-4 py-3 hover:bg-blue-50/40 transition-colors"
            style={{ borderBottom: i < filtered.length - 1 ? '1px solid #EFF6FF' : 'none' }}>
            <Avatar initials={c.initials} color={avatarColor(i)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-blue-600">#{c.id}</span>
                <StatusBadge status={c.status} />
                {c.aiDiagnosis && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#3730A3' }}>AI</span>
                )}
              </div>
              <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 truncate">{c.user} · {c.damageType}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs md:text-sm font-bold text-slate-800">{fmt(c.estimatedCost)}</div>
              <div className="text-[10px] md:text-xs mt-0.5" style={{ color: c.fraudScore > 50 ? '#DC2626' : '#64748B' }}>
                Fraud: {c.fraudScore}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SectionDiagnosis() {
  const total = DIAGNOSES.length
  const converted = DIAGNOSES.filter(d => d.status === 'claim_filed').length
  const lowConf = DIAGNOSES.filter(d => d.confidence < 60).length

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-3 gap-2.5 md:gap-3">
        {[
          { label: 'Total Diagnoses', value: '891', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
          { label: 'Claim Convert', value: `${Math.round((converted / total) * 100)}%`, color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
          { label: 'Low Confidence', value: `${Math.round((lowConf / total) * 100 * 4)}%`, color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3' },
        ].map((s, i) => (
          <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i * 0.1}
            className="rounded-xl md:rounded-2xl p-3 md:p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="text-[10px] md:text-xs font-medium mb-1" style={{ color: s.color, opacity: 0.8 }}>{s.label}</div>
            <div className="text-xl md:text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl md:rounded-3xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>
        {DIAGNOSES.map((d, i) => (
          <motion.div key={d.id} initial="hidden" animate="visible" variants={fadeUp} custom={i * 0.08}
            className="px-3 md:px-4 py-3 hover:bg-blue-50/40 transition-colors"
            style={{ borderBottom: i < DIAGNOSES.length - 1 ? '1px solid #EFF6FF' : 'none' }}>
            <div className="flex items-start gap-3">
              <Avatar initials={d.initials} color={avatarColor(i)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-xs md:text-sm text-slate-800">{d.user}</span>
                  <StatusBadge status={d.status} />
                  {d.confidence < 60 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706' }}>
                      <AlertTriangle className="w-3 h-3" /> Low
                    </span>
                  )}
                </div>
                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">{d.damageType}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[10px] md:text-xs font-semibold text-slate-700">{fmt(d.repairMin)}–{fmt(d.repairMax)}</span>
                  {d.claimId && <span className="font-mono text-[10px] md:text-xs font-bold text-blue-600">#{d.claimId}</span>}
                </div>
                <div className="mt-2"><ConfidenceBar value={d.confidence} /></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SectionStats() {
  const damageTypes = [
    { label: 'Dent / Scratch', pct: 40, color: '#2563EB' },
    { label: 'Broken Glass', pct: 26, color: '#059669' },
    { label: 'Panel Damage', pct: 15, color: '#D97706' },
    { label: 'Major Collision', pct: 10, color: '#DC2626' },
    { label: 'Other', pct: 9, color: '#94A3B8' },
  ]
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const values = [45, 55, 40, 65, 78, 100]

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
        {[
          { label: 'Diag → Claim', value: '38%', sub: 'Conversion', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
          { label: 'Avg Confidence', value: '81%', sub: 'AI accuracy', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
          { label: 'Avg Repair Cost', value: '₹42K', sub: 'Per claim', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
          { label: 'Rejection Rate', value: '16%', sub: 'Claims rejected', color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3' },
        ].map((m, i) => (
          <motion.div key={m.label} initial="hidden" animate="visible" variants={fadeUp} custom={i * 0.1}
            className="rounded-xl md:rounded-2xl p-3 md:p-4" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
            <div className="text-[10px] md:text-xs font-medium mb-1" style={{ color: m.color, opacity: 0.8 }}>{m.label}</div>
            <div className="text-xl md:text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[10px] md:text-xs mt-1" style={{ color: m.color, opacity: 0.65 }}>{m.sub}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.4}
        className="rounded-2xl md:rounded-3xl p-4 md:p-5"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>
        <h3 className="font-bold text-slate-800 text-sm mb-4">Monthly Diagnoses</h3>
        <div className="flex items-end gap-1.5 md:gap-2 h-24 md:h-28">
          {months.map((m, i) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg"
                style={{ height: `${values[i]}%`, background: i === 5 ? 'linear-gradient(135deg, #2563EB, #0EA5E9)' : '#DBEAFE' }} />
              <span className="text-[10px] md:text-xs text-slate-400">{m}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.5}
        className="rounded-2xl md:rounded-3xl p-4 md:p-5"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>
        <h3 className="font-bold text-slate-800 text-sm mb-4">Damage Type Breakdown</h3>
        <div className="space-y-3">
          {damageTypes.map(d => (
            <div key={d.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">{d.label}</span>
                <span className="font-bold" style={{ color: d.color }}>{d.pct}%</span>
              </div>
              <div className="h-1.5 md:h-2 rounded-full overflow-hidden" style={{ background: '#EFF6FF' }}>
                <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-3">
        {[
          { label: 'Fastest conversion', title: 'Windshield damage', sub: '72% same-day claim', bg: '#EFF6FF', border: '#BFDBFE', color: '#2563EB' },
          { label: 'Highest AI confidence', title: 'Broken glass — 93%', sub: 'Easy to detect visually', bg: '#F0FDF4', border: '#BBF7D0', color: '#059669' },
          { label: 'Most review needed', title: 'Minor scratches', sub: 'Low contrast in photos', bg: '#FFFBEB', border: '#FDE68A', color: '#D97706' },
        ].map((ins, i) => (
          <motion.div key={ins.label} initial="hidden" animate="visible" variants={fadeUp} custom={i * 0.1 + 0.6}
            className="rounded-xl md:rounded-2xl p-3 md:p-4" style={{ background: ins.bg, border: `1px solid ${ins.border}` }}>
            <div className="text-[10px] md:text-xs font-medium mb-1" style={{ color: ins.color, opacity: 0.8 }}>{ins.label}</div>
            <div className="font-bold text-slate-800 text-sm">{ins.title}</div>
            <div className="text-xs text-slate-500 mt-0.5">{ins.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

type Tab = 'dashboard' | 'users' | 'claims' | 'diagnosis' | 'stats'

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'claims', label: 'Claims', icon: FileText },
  { key: 'diagnosis', label: 'Diagnosis', icon: Car },
  { key: 'stats', label: 'Analytics', icon: TrendingUp },
]

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="min-h-dvh" style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E8F5E9 50%, #F0F7FF 100%)' }}>

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50" style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(191,219,254,0.5)',
        boxShadow: '0 2px 20px rgba(59,130,246,0.07)',
      }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">
              Claim<span style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Titans</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B' }}>
              Admin
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
              style={{ background: '#DBEAFE', color: '#1D4ED8' }}>AD</div>
          </div>
        </div>
      </header>

      <div className="pt-14 max-w-5xl mx-auto px-3 md:px-4 pb-24">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-4 md:pt-6 pb-3 md:pb-4">
          <h1 className="text-base md:text-lg font-bold text-slate-800">
            {TABS.find(t => t.key === tab)?.label ?? 'Admin'} <span className="text-slate-400">·</span>{' '}
            <span className="text-sm font-normal text-slate-400">ClaimTitans</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Tab Nav — desktop only (mobile uses bottom bar) */}
        <div className="hidden md:flex gap-1 p-1 rounded-2xl mb-5"
          style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE' }}>
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.key
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                style={active
                  ? { background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: 'white' }
                  : { color: '#64748B' }}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {tab === 'dashboard' && <SectionDashboard />}
        {tab === 'users' && <SectionUsers />}
        {tab === 'claims' && <SectionClaims />}
        {tab === 'diagnosis' && <SectionDiagnosis />}
        {tab === 'stats' && <SectionStats />}
      </div>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden" style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(191,219,254,0.5)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div className="flex h-16">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.key
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all"
                style={{ color: active ? '#2563EB' : '#94A3B8' }}>
                <div className={`w-10 h-6 flex items-center justify-center rounded-full transition-all ${active ? 'bg-blue-100' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
