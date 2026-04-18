import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, XCircle, Clock, MapPin, Phone, Star,
  Banknote, ExternalLink, RefreshCw, ChevronRight, Lightbulb,
} from 'lucide-react'
import { AppLayout, Breadcrumb } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ResultSkeleton } from '@/components/ui/Skeleton'
import { useAppStore } from '@/store'
import { claimApi } from '@/services/api'
import { formatCurrency, formatDate, claimIdToDisplay } from '@/utils'
import { DAMAGE_SEVERITY_CONFIG, DECISION_CONFIG, FRAUD_RISK_CONFIG } from '@/constants'
import type { ClaimResult } from '@/types'
import toast from 'react-hot-toast'

export default function ClaimResultPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { claimResult, setClaimResult } = useAppStore()

  const [result, setResult] = useState<ClaimResult | null>(claimResult)
  const [loading, setLoading] = useState(!claimResult)

  const fetchResult = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await claimApi.getResult(id)
      setResult(res.data.data)
      setClaimResult(res.data.data)
    } catch {
      toast.error('Failed to load claim result')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!claimResult && id) fetchResult()
  }, [id])

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <ResultSkeleton />
        </div>
      </AppLayout>
    )
  }

  if (!result) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto card text-center py-16">
          <p className="text-ink-secondary mb-4">Result not available</p>
          <Button variant="primary" onClick={fetchResult} icon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      </AppLayout>
    )
  }

  const decisionCfg = DECISION_CONFIG[result.decision]
  const damageCfg = DAMAGE_SEVERITY_CONFIG[result.damageSeverity]
  const fraudCfg = FRAUD_RISK_CONFIG[result.fraudRiskLabel]
  const fraudBarColor =
    result.fraudRiskLabel === 'low'
      ? 'bg-emerald-500'
      : result.fraudRiskLabel === 'medium'
      ? 'bg-amber-500'
      : 'bg-red-500'

  const DecisionIcon =
    result.decision === 'approved'
      ? CheckCircle2
      : result.decision === 'rejected'
      ? XCircle
      : Clock

  return (
    <AppLayout>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: claimIdToDisplay(result.claimId), href: '#' },
          { label: 'Result' },
        ]}
      />

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Decision banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`card border ${decisionCfg.border} ${decisionCfg.bg}`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl ${decisionCfg.bg} border ${decisionCfg.border} flex items-center justify-center flex-shrink-0`}
            >
              <DecisionIcon className={`w-7 h-7 ${decisionCfg.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">
                Claim Decision
              </p>
              <h1 className={`text-3xl font-bold ${decisionCfg.color}`}>{decisionCfg.label}</h1>
              <p className="text-xs text-ink-muted mt-1">{formatDate(result.decidedAt)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-ink-muted">AI Confidence</p>
              <p className="text-2xl font-bold font-mono text-ink-primary">
                {result.aiConfidence}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Damage & Fraud grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Damage severity */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card border border-white/5"
          >
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
              Damage Severity
            </p>
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-xl border text-sm font-semibold mb-4 ${damageCfg.bg} ${damageCfg.color} ${damageCfg.border}`}
            >
              {damageCfg.label}
            </div>
            <div className="space-y-2">
              {result.detectedDamages.map((dmg) => (
                <div
                  key={dmg}
                  className="flex items-center gap-2 text-xs text-ink-secondary"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-muted flex-shrink-0" />
                  {dmg}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-surface-3">
              <p className="text-xs text-ink-muted">Estimated Repair Cost</p>
              <p className="text-xl font-bold font-mono text-ink-primary mt-0.5">
                {formatCurrency(result.estimatedRepairCost)}
              </p>
            </div>
          </motion.div>

          {/* Fraud score */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card border border-white/5"
          >
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
              Fraud Analysis
            </p>
            <div className="flex items-end gap-2 mb-4">
              <span className={`text-4xl font-bold font-mono ${fraudCfg.color}`}>
                {result.fraudScore}
              </span>
              <span className="text-ink-muted text-sm mb-1">/100</span>
              <Badge
                variant={
                  result.fraudRiskLabel === 'low'
                    ? 'active'
                    : result.fraudRiskLabel === 'medium'
                    ? 'pending'
                    : 'expired'
                }
                className="ml-auto mb-1"
              >
                {fraudCfg.label}
              </Badge>
            </div>
            <ProgressBar
              value={result.fraudScore}
              colorClass={fraudBarColor}
              showValue={false}
              size="lg"
            />
            <p className="text-xs text-ink-muted mt-3">
              {result.fraudRiskLabel === 'low'
                ? 'No suspicious patterns detected. Claim appears legitimate.'
                : result.fraudRiskLabel === 'medium'
                ? 'Some anomalies flagged for manual review.'
                : 'High fraud indicators detected. Claim under investigation.'}
            </p>
          </motion.div>
        </div>

        {/* Explainability */}
        {result.explainability.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card border border-white/5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h2 className="font-semibold text-ink-primary text-sm">AI Decision Reasoning</h2>
            </div>
            <div className="space-y-2">
              {result.explainability.map((reason, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-ink-secondary">
                  <span className="font-mono text-xs text-ink-muted mt-0.5 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {reason}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Garage */}
        {result.garage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card border border-emerald-500/15 bg-emerald-500/5"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h2 className="font-semibold text-ink-primary text-sm">Assigned Garage</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-ink-primary">{result.garage.name}</p>
                <p className="text-sm text-ink-secondary mt-0.5">{result.garage.address}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-ink-secondary">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {result.garage.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {result.garage.distance}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  {result.garage.rating}/5
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment */}
        {result.payment && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card border border-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-blue-400" />
                <h2 className="font-semibold text-ink-primary text-sm">Payment Status</h2>
              </div>
              <Badge
                variant={
                  result.payment.status === 'released'
                    ? 'active'
                    : result.payment.status === 'failed'
                    ? 'expired'
                    : 'pending'
                }
                dot
              >
                {result.payment.status}
              </Badge>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-3xl font-bold font-mono text-ink-primary">
                {formatCurrency(result.payment.amount, result.payment.currency)}
              </span>
            </div>
            {result.payment.transactionId && (
              <p className="text-xs font-mono text-ink-muted mt-1">
                Txn: {result.payment.transactionId}
              </p>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="secondary"
            onClick={() => navigate(`/claim/${id}/blockchain`)}
            icon={<ExternalLink className="w-4 h-4" />}
            className="flex-1"
          >
            Blockchain Record
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
            className="flex-1"
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  )
}
