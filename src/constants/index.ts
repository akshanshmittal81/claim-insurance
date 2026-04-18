import type { ClaimStepInfo } from '@/types'

export const CLAIM_STEPS: ClaimStepInfo[] = [
  {
    id: 'uploaded',
    label: 'Uploaded',
    description: 'Claim images received',
    icon: 'Upload',
  },
  {
    id: 'ai_analysis',
    label: 'AI Analysis',
    description: 'YOLOv8 detecting damage',
    icon: 'ScanLine',
  },
  {
    id: 'insurance_check',
    label: 'Insurance Check',
    description: 'Verifying policy details',
    icon: 'ShieldCheck',
  },
  {
    id: 'fraud_detection',
    label: 'Fraud Detection',
    description: 'Analyzing claim authenticity',
    icon: 'Eye',
  },
  {
    id: 'decision',
    label: 'Decision',
    description: 'AI generating decision',
    icon: 'Cpu',
  },
  {
    id: 'garage_assigned',
    label: 'Garage Assigned',
    description: 'Nearest partner located',
    icon: 'MapPin',
  },
  {
    id: 'payment_processing',
    label: 'Payment',
    description: 'Releasing funds to garage',
    icon: 'Banknote',
  },
]

export const DAMAGE_SEVERITY_CONFIG = {
  low: { label: 'Low Damage', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  medium: { label: 'Medium Damage', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  high: { label: 'High Damage', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  total_loss: { label: 'Total Loss', color: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-400/30' },
}

export const DECISION_CONFIG = {
  approved: {
    label: 'Approved',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'CheckCircle2',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'XCircle',
  },
  under_review: {
    label: 'Under Review',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'Clock',
  },
}

export const FRAUD_RISK_CONFIG = {
  low: { label: 'Low Risk', color: 'text-emerald-400', barColor: 'bg-emerald-500' },
  medium: { label: 'Medium Risk', color: 'text-amber-400', barColor: 'bg-amber-500' },
  high: { label: 'High Risk', color: 'text-red-400', barColor: 'bg-red-500' },
}

export const POLLING_INTERVAL_MS = 4000

export const MAX_IMAGE_SIZE_MB = 10
export const MAX_VIDEO_SIZE_MB = 50

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  CLAIM_CAPTURE: '/claim/new',
  CLAIM_PROCESSING: '/claim/:id/processing',
  CLAIM_RESULT: '/claim/:id/result',
  BLOCKCHAIN: '/claim/:id/blockchain',
} as const
