import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, MapPin, Phone, Star, Banknote, ExternalLink, RefreshCw, ChevronRight, Lightbulb, Download } from 'lucide-react'
import { AppLayout, Breadcrumb } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store'
import { claimApi } from '@/services/api'
import { formatCurrency, formatDate, claimIdToDisplay } from '@/utils'
import { DAMAGE_SEVERITY_CONFIG, DECISION_CONFIG, FRAUD_RISK_CONFIG } from '@/constants'
import type { ClaimResult } from '@/types'
import toast from 'react-hot-toast'

// ─── PDF Generator ─────────────────────────────────────────────────────────────
async function generateClaimPDF(result: ClaimResult, claimDisplayId: string) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = 210
  const margin = 18
  let y = 0

  const decisionColor: [number, number, number] =
    result.decision === 'approved' ? [5, 150, 105] :
    result.decision === 'rejected' ? [220, 38, 38] : [217, 119, 6]

  // ── Header ──
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, W, 38, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('ClaimTitans', margin, 16)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('AI Insurance Claims Platform', margin, 23)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('CLAIM REPORT', W - margin, 16, { align: 'right' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(claimDisplayId, W - margin, 23, { align: 'right' })
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, W - margin, 29, { align: 'right' })

  y = 48

  // ── Decision Card ──
  doc.setFillColor(...decisionColor)
  doc.roundedRect(margin, y, W - margin * 2, 28, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text('CLAIM DECISION', margin + 8, y + 9)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(result.decision.toUpperCase(), margin + 8, y + 21)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`AI Confidence`, W - margin - 8, y + 9, { align: 'right' })
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`${result.aiConfidence}%`, W - margin - 8, y + 21, { align: 'right' })

  y += 36

  // ── Helpers ──
  const sectionTitle = (title: string) => {
    doc.setFillColor(241, 245, 249)
    doc.rect(margin, y, W - margin * 2, 8, 'F')
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text(title.toUpperCase(), margin + 4, y + 5.5)
    y += 12
  }

  const row = (label: string, value: string, bold = false) => {
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.text(label, margin + 4, y)
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.text(value, W - margin - 4, y, { align: 'right' })
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.2)
    doc.line(margin, y + 2.5, W - margin, y + 2.5)
    y += 9
  }

  // ── Claim Details ──
  sectionTitle('Claim Details')
  row('Claim ID', claimDisplayId, true)
  row('Decision Date', formatDate(result.decidedAt))
  row('Damage Severity', result.damageSeverity.toUpperCase(), true)
  row('Fraud Risk', `${result.fraudRiskLabel.toUpperCase()} (Score: ${result.fraudScore}/100)`)
  row('Estimated Repair Cost', formatCurrency(result.estimatedRepairCost), true)
  y += 4

  // ── Detected Damages ──
  sectionTitle('Detected Damages')
  result.detectedDamages.forEach((dmg) => {
    doc.setFillColor(37, 99, 235)
    doc.circle(margin + 6, y - 1.5, 1, 'F')
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.text(dmg, margin + 10, y)
    y += 8
  })
  y += 4

  // ── AI Reasoning ──
  if (result.explainability.length > 0) {
    sectionTitle('AI Decision Reasoning')
    result.explainability.forEach((reason, i) => {
      doc.setTextColor(217, 119, 6)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`${String(i + 1).padStart(2, '0')}`, margin + 4, y)
      doc.setTextColor(15, 23, 42)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(reason, W - margin * 2 - 14)
      doc.text(lines, margin + 12, y)
      y += lines.length * 6 + 3
    })
    y += 4
  }

  // ── Garage ──
  if (result.garage) {
    sectionTitle('Assigned Garage')
    row('Garage Name', result.garage.name, true)
    row('Address', result.garage.address)
    row('Phone', result.garage.phone)
    row('Distance', result.garage.distance)
    row('Rating', `${result.garage.rating}/5`)
    y += 4
  }

  // ── Payment ──
  if (result.payment) {
    sectionTitle('Payment Details')
    row('Status', result.payment.status.toUpperCase(), true)
    row('Amount', formatCurrency(result.payment.amount, result.payment.currency), true)
    if (result.payment.transactionId) row('Transaction ID', result.payment.transactionId)
    if (result.payment.releasedAt) row('Released At', formatDate(result.payment.releasedAt))
    y += 4
  }

  // ── Blockchain ──
  if (result.blockchainTxHash) {
    sectionTitle('Blockchain Record')
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text('Transaction Hash:', margin + 4, y)
    y += 6
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    const hashLines = doc.splitTextToSize(result.blockchainTxHash, W - margin * 2 - 8)
    doc.text(hashLines, margin + 4, y)
    y += hashLines.length * 5 + 6
  }

  // ── Footer ──
  const pageH = doc.internal.pageSize.getHeight()
  doc.setFillColor(37, 99, 235)
  doc.rect(0, pageH - 16, W, 16, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('ClaimTitans — AI Insurance Claims Platform', margin, pageH - 6)
  doc.text('AI-generated report. For queries, contact support.', W - margin, pageH - 6, { align: 'right' })

  doc.save(`ClaimReport_${claimDisplayId}.pdf`)
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function ClaimResultPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setClaimResult } = useAppStore()
  const [result, setResult] = useState<ClaimResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)

  const fetchResult = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await claimApi.getResult(id)
      setResult(res.data.data)
      setClaimResult(res.data.data)
    } catch {
      toast.error('Failed to load result')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResult() }, [id])

  const handleDownloadPDF = async () => {
    if (!result) return
    setPdfLoading(true)
    try {
      await generateClaimPDF(result, claimIdToDisplay(result.claimId))
      toast.success('PDF downloaded!')
    } catch (e) {
      console.error(e)
      toast.error('PDF generation failed')
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {[1,2,3].map(i => <div key={i} className="rounded-3xl h-32 shimmer-bg" />)}
      </div>
    </AppLayout>
  )

  if (!result) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto rounded-3xl p-16 text-center"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE' }}>
        <p className="text-slate-500 mb-4">Result not available</p>
        <Button variant="primary" onClick={fetchResult} icon={<RefreshCw className="w-4 h-4" />}>Retry</Button>
      </div>
    </AppLayout>
  )

  const decisionCfg = DECISION_CONFIG[result.decision]
  const damageCfg = DAMAGE_SEVERITY_CONFIG[result.damageSeverity]
  const fraudCfg = FRAUD_RISK_CONFIG[result.fraudRiskLabel]
  const fraudBarColor = result.fraudRiskLabel === 'low'
    ? 'linear-gradient(90deg,#059669,#10B981)'
    : result.fraudRiskLabel === 'medium'
    ? 'linear-gradient(90deg,#D97706,#F59E0B)'
    : 'linear-gradient(90deg,#DC2626,#EF4444)'
  const DecisionIcon = result.decision === 'approved' ? CheckCircle2
    : result.decision === 'rejected' ? XCircle : Clock
  const decisionGradient = result.decision === 'approved'
    ? { bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '#86EFAC', icon: '#059669' }
    : result.decision === 'rejected'
    ? { bg: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)', border: '#FCA5A5', icon: '#DC2626' }
    : { bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '#FDE68A', icon: '#D97706' }

  return (
    <AppLayout>
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: claimIdToDisplay(result.claimId) },
        { label: 'Result' }
      ]} />
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Decision Banner */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="rounded-3xl p-6"
          style={{ background: decisionGradient.bg, border: `1.5px solid ${decisionGradient.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: 'white' }}>
              <DecisionIcon className="w-8 h-8" style={{ color: decisionGradient.icon }} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Claim Decision</p>
              <h1 className="text-3xl font-bold" style={{ color: decisionGradient.icon }}>{decisionCfg.label}</h1>
              <p className="text-xs text-slate-400 mt-1">{formatDate(result.decidedAt)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400">AI Confidence</p>
              <p className="text-3xl font-bold font-mono text-slate-700">{result.aiConfidence}%</p>
            </div>
          </div>
        </motion.div>

        {/* Damage + Fraud Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl p-5"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 20px rgba(59,130,246,0.06)' }}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Damage Severity</p>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold mb-4 ${damageCfg.bg} ${damageCfg.color} ${damageCfg.border}`}>
              {damageCfg.label}
            </div>
            <div className="space-y-2 mb-4">
              {result.detectedDamages.map((dmg) => (
                <div key={dmg} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />{dmg}
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-blue-50">
              <p className="text-xs text-slate-400">Estimated Repair Cost</p>
              <p className="text-2xl font-bold font-mono text-slate-800 mt-0.5">{formatCurrency(result.estimatedRepairCost)}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-3xl p-5"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 20px rgba(59,130,246,0.06)' }}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Fraud Analysis</p>
            <div className="flex items-end gap-2 mb-3">
              <span className={`text-4xl font-bold font-mono ${fraudCfg.color}`}>{result.fraudScore}</span>
              <span className="text-slate-400 text-sm mb-1">/100</span>
              <span className="ml-auto mb-1 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  background: result.fraudRiskLabel === 'low' ? '#D1FAE5' : result.fraudRiskLabel === 'medium' ? '#FEF3C7' : '#FEE2E2',
                  color: result.fraudRiskLabel === 'low' ? '#065F46' : result.fraudRiskLabel === 'medium' ? '#92400E' : '#991B1B',
                }}>
                {fraudCfg.label}
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background: '#F1F5F9' }}>
              <motion.div className="h-full rounded-full" style={{ background: fraudBarColor }}
                initial={{ width: 0 }} animate={{ width: `${result.fraudScore}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {result.fraudRiskLabel === 'low' ? 'No suspicious patterns detected. Claim appears legitimate.'
                : result.fraudRiskLabel === 'medium' ? 'Some anomalies flagged for manual review.'
                : 'High fraud indicators detected. Claim under investigation.'}
            </p>
          </motion.div>
        </div>

        {/* AI Reasoning */}
        {result.explainability.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-3xl p-5"
            style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '1px solid #FDE68A', boxShadow: '0 4px 20px rgba(245,158,11,0.08)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-slate-700 text-sm">AI Decision Reasoning</h2>
            </div>
            <div className="space-y-2">
              {result.explainability.map((reason, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="font-mono text-xs text-amber-500 mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  {reason}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Garage */}
        {result.garage && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-3xl p-5"
            style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0', boxShadow: '0 4px 20px rgba(16,185,129,0.08)' }}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h2 className="font-bold text-slate-700 text-sm">Assigned Garage</h2>
            </div>
            <p className="font-bold text-slate-800">{result.garage.name}</p>
            <p className="text-sm text-slate-500 mt-0.5">{result.garage.address}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{result.garage.phone}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{result.garage.distance}</span>
              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400" />{result.garage.rating}/5</span>
            </div>
          </motion.div>
        )}

        {/* Payment */}
        {result.payment && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-3xl p-5"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #DBEAFE', boxShadow: '0 4px 20px rgba(59,130,246,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-blue-500" />
                <h2 className="font-bold text-slate-700 text-sm">Payment Status</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: result.payment.status === 'released' ? '#D1FAE5' : result.payment.status === 'failed' ? '#FEE2E2' : '#FEF3C7',
                  color: result.payment.status === 'released' ? '#065F46' : result.payment.status === 'failed' ? '#991B1B' : '#92400E',
                }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                {result.payment.status}
              </span>
            </div>
            <p className="text-3xl font-bold font-mono text-slate-800">{formatCurrency(result.payment.amount, result.payment.currency)}</p>
            {result.payment.transactionId && (
              <p className="text-xs font-mono text-slate-400 mt-1">Txn: {result.payment.transactionId}</p>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={() => navigate(`/claim/${id}/blockchain`)}
            icon={<ExternalLink className="w-4 h-4" />} className="flex-1">
            Blockchain Record
          </Button>
          <Button variant="secondary" onClick={handleDownloadPDF} loading={pdfLoading}
            icon={<Download className="w-4 h-4" />} className="flex-1">
            Download PDF
          </Button>
          <Button variant="primary" onClick={() => navigate('/dashboard')}
            icon={<ChevronRight className="w-4 h-4" />} iconPosition="right" className="flex-1">
            Back to Dashboard
          </Button>
        </motion.div>

      </div>
    </AppLayout>
  )
}