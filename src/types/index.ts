// ─── Auth & User ────────────────────────────────────────────────────────────

export interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: User | null
}

export interface User {
  id: string
  name: string
  phone: string
  vehicleNumber: string
  policyStatus: 'active' | 'expired' | 'pending'
  policyExpiry: string
  email?: string
  avatar?: string
}

export interface AuthPayload {
  vehicleNumber: string
  phone: string
}

export interface OtpPayload {
  vehicleNumber: string
  phone: string
  otp: string
}

export interface AuthResponse {
  token: string
  user: User
}

// ─── Claim ───────────────────────────────────────────────────────────────────

export type ClaimStatus =
  | 'uploaded'
  | 'ai_analysis'
  | 'insurance_check'
  | 'fraud_detection'
  | 'decision'
  | 'garage_assigned'
  | 'payment_processing'
  | 'completed'
  | 'rejected'

export type DamageSeverity = 'low' | 'medium' | 'high' | 'total_loss'

export type ClaimDecision = 'approved' | 'rejected' | 'under_review'

export interface ClaimSubmission {
  vehicleNumber: string
  description: string
  imageBase64?: string
  videoBase64?: string
  timestamp: string
  latitude?: number
  longitude?: number
  locationLabel?: string
}

export interface Claim {
  id: string
  vehicleNumber: string
  status: ClaimStatus
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
}

export interface ClaimStatusResponse {
  claimId: string
  status: ClaimStatus
  currentStep: number
  totalSteps: number
  message: string
  updatedAt: string
}

export interface GarageInfo {
  name: string
  address: string
  phone: string
  distance: string
  rating: number
  assignedAt: string
}

export interface PaymentInfo {
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'released' | 'failed'
  transactionId?: string
  releasedAt?: string
}

export interface ClaimResult {
  claimId: string
  decision: ClaimDecision
  damageSeverity: DamageSeverity
  fraudScore: number
  fraudRiskLabel: 'low' | 'medium' | 'high'
  estimatedRepairCost: number
  detectedDamages: string[]
  aiConfidence: number
  explainability: string[]
  garage?: GarageInfo
  payment?: PaymentInfo
  blockchainTxHash?: string
  decidedAt: string
}

// ─── Blockchain ──────────────────────────────────────────────────────────────

export interface BlockchainRecord {
  claimId: string
  txHash: string
  blockNumber: number
  network: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: string
  explorerUrl: string
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// ─── UI State ────────────────────────────────────────────────────────────────

export interface ClaimStepInfo {
  id: ClaimStatus
  label: string
  description: string
  icon: string
}

export interface ToastConfig {
  type: 'success' | 'error' | 'info' | 'loading'
  message: string
  duration?: number
}
