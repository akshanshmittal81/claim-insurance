import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitBranch, ExternalLink, Copy, RefreshCw, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { AppLayout, Breadcrumb } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
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
    if (!id) return
    setLoading(true)
    try {
      const res = await blockchainApi.getRecord(id)
      setRecord(res.data.data)
      setBlockchainRecord(res.data.data)
    } catch {
      toast.error('Blockchain record not yet available')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!blockchainRecord) fetchRecord()
  }, [id])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`)
    })
  }

  const statusIcon =
    record?.status === 'confirmed' ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
    ) : record?.status === 'failed' ? (
      <XCircle className="w-5 h-5 text-red-400" />
    ) : (
      <Clock className="w-5 h-5 text-amber-400" />
    )

  const statusVariant =
    record?.status === 'confirmed'
      ? 'active'
      : record?.status === 'failed'
      ? 'expired'
      : 'pending'

  return (
    <AppLayout>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: id ? claimIdToDisplay(id) : 'Claim', href: '#' },
          { label: 'Blockchain' },
        ]}
      />

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border border-violet-500/20 bg-violet-500/5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="font-bold text-ink-primary">Blockchain Record</h1>
              <p className="text-xs text-ink-secondary">Immutable, tamper-proof claim audit trail</p>
            </div>
          </div>
        </motion.div>

        {/* Record details */}
        {loading ? (
          <div className="card space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </div>
        ) : record ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card border border-white/5 space-y-5"
          >
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {statusIcon}
                <span className="font-semibold text-ink-primary">Transaction Status</span>
              </div>
              <Badge variant={statusVariant} dot>
                {record.status}
              </Badge>
            </div>

            <div className="h-px bg-surface-3" />

            {/* Fields */}
            {[
              { label: 'Claim ID', value: record.claimId, monospace: true },
              { label: 'Transaction Hash', value: record.txHash, monospace: true, copyable: true, display: truncateHash(record.txHash) },
              { label: 'Block Number', value: String(record.blockNumber), monospace: true },
              { label: 'Network', value: record.network, monospace: false },
              { label: 'Timestamp', value: formatDate(record.timestamp), monospace: false },
            ].map(({ label, value, monospace, copyable, display }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide flex-shrink-0">
                  {label}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-sm text-ink-primary truncate ${
                      monospace ? 'font-mono' : ''
                    }`}
                  >
                    {display ?? value}
                  </span>
                  {copyable && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(value, label)}
                      className="flex-shrink-0 p-1 rounded-lg hover:bg-surface-3 text-ink-muted hover:text-ink-secondary transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="h-px bg-surface-3" />

            {/* Explorer link */}
            <a
              href={record.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-sm font-semibold text-violet-400 transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              View on Block Explorer
            </a>
          </motion.div>
        ) : (
          <div className="card border border-dashed border-surface-4 py-16 text-center">
            <GitBranch className="w-10 h-10 text-ink-muted mx-auto mb-3" />
            <p className="text-ink-secondary font-medium">Record not available yet</p>
            <p className="text-xs text-ink-muted mt-1 mb-6">
              Blockchain confirmation may take a few minutes
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchRecord}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>
        )}

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl bg-surface-2 border border-surface-3"
        >
          <p className="text-xs text-ink-secondary leading-relaxed">
            <span className="text-ink-primary font-medium">Why blockchain?</span>{' '}
            Every claim decision is written to an immutable smart contract. This ensures no
            data can be altered after settlement — protecting both policyholders and insurers
            from post-decision disputes.
          </p>
        </motion.div>

        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="w-full"
        >
          ← Go Back
        </Button>
      </div>
    </AppLayout>
  )
}
