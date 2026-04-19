import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitBranch, ExternalLink, Copy, RefreshCw, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { AppLayout, Breadcrumb } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { blockchainApi } from '@/services/api'
import { useAppStore } from '@/store'
import { truncateHash, formatDate, claimIdToDisplay } from '@/utils'
import type { BlockchainRecord } from '@/types'
import toast from 'react-hot-toast'

export default function BlockchainPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { blockchainRecord, setBlockchainRecord } = useAppStore()
  const [record, setRecord] = useState<BlockchainRecord | null>(blockchainRecord)
  const [loading, setLoading] = useState(!blockchainRecord)

  const fetchRecord = async () => {
    if (!id) return; setLoading(true)
    try { const res = await blockchainApi.getRecord(id); setRecord(res.data.data); setBlockchainRecord(res.data.data) }
    catch { toast.error('Blockchain record not yet available') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (!blockchainRecord) fetchRecord() }, [id])

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied!`))
  }

  const statusIcon = record?.status === 'confirmed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    : record?.status === 'failed' ? <XCircle className="w-5 h-5 text-red-500" />
    : <Clock className="w-5 h-5 text-amber-500" />

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: id ? claimIdToDisplay(id) : 'Claim' }, { label: 'Blockchain' }]} />
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6" style={{
            background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
            border: '1.5px solid #C4B5FD',
            boxShadow: '0 4px 24px rgba(124,58,237,0.1)'
          }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}>
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Blockchain Record</h1>
              <p className="text-xs text-slate-500">Immutable, tamper-proof claim audit trail</p>
            </div>
          </div>
        </motion.div>

        {/* Record */}
        {loading ? (
          <div className="rounded-3xl p-6 space-y-4 shimmer-bg h-64" />
        ) : record ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 24px rgba(59,130,246,0.06)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {statusIcon}
                <span className="font-bold text-slate-700">Transaction Status</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: record.status === 'confirmed' ? '#D1FAE5' : record.status === 'failed' ? '#FEE2E2' : '#FEF3C7',
                  color: record.status === 'confirmed' ? '#065F46' : record.status === 'failed' ? '#991B1B' : '#92400E',
                }}>
                {record.status}
              </span>
            </div>

            <div className="h-px" style={{ background: '#EFF6FF' }} />

            {[
              { label: 'Claim ID', value: record.claimId },
              { label: 'Transaction Hash', value: record.txHash, display: truncateHash(record.txHash), copyable: true },
              { label: 'Block Number', value: String(record.blockNumber) },
              { label: 'Network', value: record.network },
              { label: 'Timestamp', value: formatDate(record.timestamp) },
            ].map(({ label, value, display, copyable }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex-shrink-0">{label}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-mono text-slate-700 truncate">{display ?? value}</span>
                  {copyable && (
                    <button type="button" onClick={() => copy(value, label)}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="h-px" style={{ background: '#EFF6FF' }} />

            {record.txHash && <a href={record.explorerUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', color: 'white', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
              <ExternalLink className="w-4 h-4" />
              View on Block Explorer
            </a>}
          </motion.div>
        ) : (
          <div className="rounded-3xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.7)', border: '2px dashed #BFDBFE' }}>
            <GitBranch className="w-10 h-10 text-blue-200 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">Record not available yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-6">Blockchain confirmation may take a few minutes</p>
            <Button variant="secondary" size="sm" onClick={fetchRecord} icon={<RefreshCw className="w-4 h-4" />}>Refresh</Button>
          </div>
        )}

        {/* Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', border: '1px solid #DDD6FE' }}>
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700">Why blockchain? </span>
            Every claim decision is written to an immutable smart contract — protecting both policyholders and insurers from post-decision disputes.
          </p>
        </motion.div>

        <Button variant="ghost" onClick={() => navigate(-1)} className="w-full">← Go Back</Button>
      </div>
    </AppLayout>
  )
}