// ─── Mock Data ────────────────────────────────────────────────────────────────
// Yeh file real API ki jagah use hoti hai jab backend ready na ho.
// Sab kuch yahan se aata hai — koi network call nahi.

import type {
  User, Claim, ClaimStatusResponse, ClaimResult,
  GarageInfo, PaymentInfo, BlockchainRecord, AuthResponse,
} from '@/types'

export const MOCK_USER: User = {
  id: 'user-001',
  name: 'Aniket Kansal',
  phone: '9876543210',
  vehicleNumber: 'UP14AB1234',
  policyStatus: 'active',
  policyExpiry: '2027-03-31T00:00:00Z',
  email: 'aniket@miet.ac.in',
}

export const MOCK_AUTH_RESPONSE: AuthResponse = {
  token: 'mock-jwt-token-claimtitans-2026',
  user: MOCK_USER,
}

export const MOCK_CLAIMS: Claim[] = [
  // {
  //   id: 'clm-aabbcc11',
  //   vehicleNumber: 'UP14AB1234',
  //   status: 'completed',
  //   createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  //   updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  // },
  // {
  //   id: 'clm-ddeeff22',
  //   vehicleNumber: 'UP14AB1234',
  //   status: 'ai_analysis',
  //   createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  //   updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  // },
]

export const MOCK_CLAIM_RESULT: ClaimResult = {
  claimId: 'clm-aabbcc11',
  decision: 'approved',
  damageSeverity: 'medium',
  fraudScore: 12,
  fraudRiskLabel: 'low',
  estimatedRepairCost: 45000,
  detectedDamages: [
    'Dent on rear bumper',
    'Broken left tail light',
    'Minor scratch on boot lid',
  ],
  aiConfidence: 94,
  explainability: [
    'Damage patterns are consistent with rear-end collision physics.',
    'No signs of image manipulation or digital tampering detected.',
    'Vehicle registration UP14AB1234 matches policyholder records.',
    'Claim history shows no prior similar incidents — low fraud signal.',
  ],
  garage: {
    name: 'AutoCare Service Center',
    address: 'Plot 12, Industrial Area, Meerut — 250001',
    phone: '+91-9876500001',
    distance: '2.3 km',
    rating: 4.5,
    assignedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  payment: {
    amount: 45000,
    currency: 'INR',
    status: 'released',
    transactionId: 'TXN-2026-001234',
    releasedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  blockchainTxHash: '0xf4ca9c3d8a1b2e7f9d0c5a6b3e8f1d4c7a2b5e9f0d3c6a9b2e5f8d1c4a7b0e3',
  decidedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
}

export const MOCK_GARAGE: GarageInfo = MOCK_CLAIM_RESULT.garage!

export const MOCK_PAYMENT: PaymentInfo = MOCK_CLAIM_RESULT.payment!

export const MOCK_BLOCKCHAIN: BlockchainRecord = {
  claimId: 'clm-aabbcc11',
  txHash: '0xf4ca9c3d8a1b2e7f9d0c5a6b3e8f1d4c7a2b5e9f0d3c6a9b2e5f8d1c4a7b0e3',
  blockNumber: 19847523,
  network: 'Polygon Mainnet',
  status: 'confirmed',
  timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  explorerUrl: 'https://polygonscan.com/tx/0xf4ca9c3d8a1b2e7f9d0c5a6b3e8f1d4c7a2b5e9f0d3c6a9b2e5f8d1c4a7b0e3',
}

// ─── Processing simulation (stepper animation ke liye) ────────────────────────
// Claim submit hone ke baad status steps automatically aage badhti hain

import type { ClaimStatus } from '@/types'

const STATUS_SEQUENCE: ClaimStatus[] = [
  'uploaded',
  'ai_analysis',
  'insurance_check',
  'fraud_detection',
  'decision',
  'garage_assigned',
  'payment_processing',
  'completed',
]

// In-memory store to track mock claim progress
const mockClaimProgress: Map<string, number> = new Map()

export function getMockClaimStatus(claimId: string): ClaimStatusResponse {
  const currentStep = mockClaimProgress.get(claimId) ?? 0
  const nextStep = Math.min(currentStep + 1, STATUS_SEQUENCE.length - 1)
  mockClaimProgress.set(claimId, nextStep)

  const status = STATUS_SEQUENCE[currentStep]

  return {
    claimId,
    status,
    currentStep,
    totalSteps: STATUS_SEQUENCE.length,
    message: getStatusMessage(status),
    updatedAt: new Date().toISOString(),
  }
}

function getStatusMessage(status: ClaimStatus): string {
  const messages: Record<ClaimStatus, string> = {
    uploaded: 'Images received and queued for processing.',
    ai_analysis: 'YOLOv8 model is detecting damage in your photos.',
    insurance_check: 'Verifying policy details and coverage.',
    fraud_detection: 'Analyzing claim authenticity and fraud signals.',
    decision: 'AI generating final claim decision.',
    garage_assigned: 'Nearest authorized service partner assigned.',
    payment_processing: 'Releasing payment to garage via smart contract.',
    completed: 'Claim fully processed and settled.',
    rejected: 'Claim rejected due to policy or fraud issues.',
  }
  return messages[status] ?? 'Processing...'
}
