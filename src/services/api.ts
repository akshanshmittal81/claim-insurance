/// <reference types="vite/client" />

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import toast from 'react-hot-toast'
import {
  MOCK_USER,
  MOCK_CLAIMS,
  MOCK_CLAIM_RESULT,
  MOCK_GARAGE,
  MOCK_PAYMENT,
  MOCK_BLOCKCHAIN,
  getMockClaimStatus,
} from './mockData'
import type {
  AuthPayload,
  OtpPayload,
  AuthResponse,
  User,
  Claim,
  ClaimSubmission,
  ClaimStatusResponse,
  ClaimResult,
  GarageInfo,
  PaymentInfo,
  BlockchainRecord,
  ApiResponse,
} from '@/types'

// ─── Webhook URLs ───────────────────────────────────────────────────────────

const N8N_BASE = import.meta.env.VITE_API_BASE_URL || 'https://aniketkansal3007.app.n8n.cloud/webhook'

const OTP_REQUEST_ID = import.meta.env.VITE_OTP_REQUEST_WEBHOOK
const OTP_VERIFY_ID  = import.meta.env.VITE_OTP_VERIFY_WEBHOOK

const WEBHOOKS = {
  fraud:     `${N8N_BASE}/${import.meta.env.VITE_FRAUD_WEBHOOK_ID}`,
  decision:  `${N8N_BASE}/${import.meta.env.VITE_DECISION_WEBHOOK_ID}`,
  garage:    `${N8N_BASE}/${import.meta.env.VITE_GARAGE_WEBHOOK_ID}`,
  payment:   `${N8N_BASE}/${import.meta.env.VITE_PAYMENT_WEBHOOK_ID}`,
  damage:    `${N8N_BASE}/${import.meta.env.VITE_DAMAGE_WEBHOOK_ID}`,
  insurance: `${N8N_BASE}/${import.meta.env.VITE_POLICY_WEBHOOK_ID}`,
}

const MOCK_DELAY_MS = 600

// ─── MOCK FLAGS ─────────────────────────────────────────────────────────────
const MOCK = {
  damageAnalysis:  false,  // ? real n8n
  insuranceVerify: false,  // ? real n8n
  requestOtp:  false,  // ✅ real n8n
  verifyOtp:   false,  // ✅ real n8n
  getUser:     false,
  claimSubmit: false,  // ✅ real n8n
  claimStatus: false,  // ✅ real n8n
  claimResult: false,  // ✅ real n8n
  claimList:   false,
  garage:      false,  // ✅ real n8n
  payment:     false,  // ✅ real n8n
  blockchain:  false,  // ✅ real n8n
}

// ─── Mock helpers ────────────────────────────────────────────────────────────

function mockResponse<T>(data: T): ApiResponse<T> {
  return { data, success: true, message: 'OK' }
}

function wrapMock<T>(data: T, ms = MOCK_DELAY_MS): Promise<{ data: ApiResponse<T> }> {
  return new Promise((r) => setTimeout(() => r({ data: mockResponse(data) }), ms))
}

// ─── Axios instances ─────────────────────────────────────────────────────────

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: N8N_BASE,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('ct_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status
      if (status === 401) {
        localStorage.removeItem('ct_token')
        toast.error('Session expired. Please sign in again.')
        window.location.href = '/auth'
        return Promise.reject(error)
      }
      if (status === 429) toast.error('Too many requests. Please wait.')
      if (status && status >= 500) toast.error('Server error. Please try again.')
      if (!error.response) toast.error('Network error. Check your connection.')
      return Promise.reject(error)
    }
  )

  return client
}

export const apiClient = createApiClient()

const n8n = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Retry helper ────────────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

// ─── AUTH API ────────────────────────────────────────────────────────────────

export const authApi = {

  requestOtp: (payload: AuthPayload) => {
    if (MOCK.requestOtp) {
      return wrapMock({ success: true, message: 'OTP sent successfully' })
    }
    return withRetry(() =>
      n8n.post(`${N8N_BASE}/${OTP_REQUEST_ID}`, {
        vehicle_no: payload.vehicleNumber,
        phone: payload.phone,
      })
    ).then((res) => {
      const d = res.data as { success: boolean; message: string }
      if (!d.success) throw new Error(d.message || 'Failed to send OTP')
      return { data: mockResponse({ message: d.message }) }
    })
  },

  verifyOtp: (payload: OtpPayload) => {
    if (MOCK.verifyOtp) {
      if (payload.otp !== '123456') return Promise.reject(new Error('Invalid OTP'))
      return wrapMock<AuthResponse>({
        token: 'mock-token-' + Date.now(),
        user: {
          id: 'user-mock',
          name: 'ClaimTitans User',
          phone: payload.phone,
          vehicleNumber: payload.vehicleNumber.toUpperCase(),
          policyStatus: 'active',
          policyExpiry: '2027-03-31T00:00:00Z',
        },
      })
    }
    return withRetry(() =>
      n8n.post(`${N8N_BASE}/${OTP_VERIFY_ID}`, {
        vehicle_no: payload.vehicleNumber,
        phone: payload.phone,
        otp: payload.otp,
      })
    ).then((res) => {
      const d = res.data as {
        success: boolean
        message?: string
        token?: string
        user?: User
      }
      if (!d.success) throw new Error(d.message || 'Invalid OTP')

      const user: User = d.user ?? {
        id: 'user-' + Date.now(),
        name: 'ClaimTitans User',
        phone: payload.phone,
        vehicleNumber: payload.vehicleNumber.toUpperCase(),
        policyStatus: 'active',
        policyExpiry: '2027-03-31T00:00:00Z',
      }
      const token = d.token ?? ('session-' + Date.now())
      return { data: mockResponse<AuthResponse>({ token, user }) }
    })
  },

  getUser: () => {
    if (MOCK.getUser) return wrapMock<User>(MOCK_USER)
    return withRetry(() => apiClient.get<ApiResponse<User>>('/user'))
  },

  logout: () => {
    return apiClient.post('/auth/logout').catch(() => {})
  },
}

// ─── CLAIM API ───────────────────────────────────────────────────────────────

export const claimApi = {

  // Step 1: Fraud check webhook
  submit: (payload: ClaimSubmission) => {
    if (MOCK.claimSubmit) {
      const newClaim: Claim = {
        id: 'clm-' + Date.now().toString(36),
        vehicleNumber: payload.vehicleNumber,
        status: 'uploaded',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return wrapMock<Claim>(newClaim, 1200)
    }

    return withRetry(() =>
      n8n.post(WEBHOOKS.fraud, {
        vehicle_no: payload.vehicleNumber,
        description: payload.description,
        image_base64: payload.imageBase64 ?? '',
        video_base64: payload.videoBase64 ?? '',
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        location_label: payload.locationLabel ?? '',
        timestamp: payload.timestamp,
      })
    ).then((res) => {
      const d = res.data as {
        success?: boolean
        claimId?: string
        claim_id?: string
        fraudScore?: number
        fraud_score?: number
      }

      const claimId = d.claimId ?? d.claim_id ?? ('clm-' + Date.now().toString(36))
      const fraudScore = d.fraudScore ?? d.fraud_score ?? 0

      const newClaim: Claim = {
        id: claimId,
        vehicleNumber: payload.vehicleNumber,
        status: fraudScore > 70 ? 'rejected' : 'uploaded',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return { data: mockResponse<Claim>(newClaim) }
    })
  },

  // Step 2: Decision Engine — status polling
  getStatus: (claimId: string) => {
    if (MOCK.claimStatus) {
      return wrapMock<ClaimStatusResponse>(getMockClaimStatus(claimId), 400)
    }

    return withRetry(() =>
      n8n.post(WEBHOOKS.decision, {
        claim_id: claimId,
        action: 'get_status',
      })
    ).then((res) => {
      const d = res.data as {
        status?: string
        decision?: string
        claimId?: string
        claim_id?: string
        currentStep?: number
        current_step?: number
        totalSteps?: number
        total_steps?: number
        message?: string
        updatedAt?: string
      }

      return {
        data: mockResponse<ClaimStatusResponse>({
          claimId: d.claimId ?? d.claim_id ?? claimId,
          status: (d.status ?? d.decision ?? 'ai_analysis') as ClaimStatusResponse['status'],
          currentStep: d.currentStep ?? d.current_step ?? 1,
          totalSteps: d.totalSteps ?? d.total_steps ?? 8,
          message: d.message ?? 'Processing your claim...',
          updatedAt: d.updatedAt ?? new Date().toISOString(),
        })
      }
    })
  },

  // Step 3: Decision Engine — final result
  getResult: (claimId: string) => {
    if (MOCK.claimResult) {
      return wrapMock<ClaimResult>({ ...MOCK_CLAIM_RESULT, claimId })
    }

    return withRetry(() =>
      n8n.post(WEBHOOKS.decision, {
        claim_id: claimId,
        action: 'get_result',
      })
    ).then((res) => {
      const d = res.data as {
        decision?: string
        status?: string
        damageSeverity?: string
        damage_severity?: string
        fraudScore?: number
        fraud_score?: number
        fraudRiskLabel?: string
        fraud_risk_label?: string
        estimatedRepairCost?: number
        estimated_repair_cost?: number
        detectedDamages?: string[]
        detected_damages?: string[]
        aiConfidence?: number
        ai_confidence?: number
        explainability?: string[]
        blockchainTxHash?: string
        blockchain_tx_hash?: string
        decidedAt?: string
        decided_at?: string
      }

      return {
        data: mockResponse<ClaimResult>({
          claimId,
          decision: (d.decision ?? d.status ?? 'approved') as ClaimResult['decision'],
          damageSeverity: (d.damageSeverity ?? d.damage_severity ?? 'medium') as ClaimResult['damageSeverity'],
          fraudScore: d.fraudScore ?? d.fraud_score ?? 0,
          fraudRiskLabel: (d.fraudRiskLabel ?? d.fraud_risk_label ?? 'low') as ClaimResult['fraudRiskLabel'],
          estimatedRepairCost: d.estimatedRepairCost ?? d.estimated_repair_cost ?? 0,
          detectedDamages: d.detectedDamages ?? d.detected_damages ?? [],
          aiConfidence: d.aiConfidence ?? d.ai_confidence ?? 0,
          explainability: d.explainability ?? [],
          blockchainTxHash: d.blockchainTxHash ?? d.blockchain_tx_hash,
          decidedAt: d.decidedAt ?? d.decided_at ?? new Date().toISOString(),
        })
      }
    })
  },

  // Step 4: Garage assign
  getGarage: (claimId: string) => {
    if (MOCK.garage) return wrapMock<GarageInfo>(MOCK_GARAGE)

    return withRetry(() =>
      n8n.post(WEBHOOKS.garage, {
        claim_id: claimId,
      })
    ).then((res) => {
      const d = res.data as {
        name?: string
        garage_name?: string
        address?: string
        phone?: string
        distance?: string
        rating?: number
        assignedAt?: string
        assigned_at?: string
      }

      return {
        data: mockResponse<GarageInfo>({
          name: d.name ?? d.garage_name ?? 'Assigned Garage',
          address: d.address ?? 'Address not provided',
          phone: d.phone ?? '',
          distance: d.distance ?? 'N/A',
          rating: d.rating ?? 4.0,
          assignedAt: d.assignedAt ?? d.assigned_at ?? new Date().toISOString(),
        })
      }
    })
  },

  // Step 5: Payment release
  getPayment: (claimId: string) => {
    if (MOCK.payment) return wrapMock<PaymentInfo>(MOCK_PAYMENT)

    return withRetry(() =>
      n8n.post(WEBHOOKS.payment, {
        claim_id: claimId,
      })
    ).then((res) => {
      const d = res.data as {
        amount?: number
        currency?: string
        status?: string
        transactionId?: string
        transaction_id?: string
        releasedAt?: string
        released_at?: string
      }

      return {
        data: mockResponse<PaymentInfo>({
          amount: d.amount ?? 0,
          currency: d.currency ?? 'INR',
          status: (d.status ?? 'released') as PaymentInfo['status'],
          transactionId: d.transactionId ?? d.transaction_id,
          releasedAt: d.releasedAt ?? d.released_at,
        })
      }
    })
  },


  // Step 6: AI Damage Analysis
  analyzeDamage: (claimId: string, imageBase64?: string) => {
    if (MOCK.damageAnalysis) {
      return wrapMock({
        claimId,
        detectedDamages: ['Dent on bumper', 'Broken tail light'],
        severity: 'medium',
        confidence: 92,
        estimatedCost: 45000,
      })
    }
    return withRetry(() =>
      n8n.post(WEBHOOKS.damage, {
        claim_id: claimId,
        image_base64: imageBase64 ?? '',
      })
    ).then((res) => {
      const d = res.data as {
        detectedDamages?: string[]
        detected_damages?: string[]
        severity?: string
        confidence?: number
        estimatedCost?: number
        estimated_cost?: number
      }
      return {
        data: mockResponse({
          claimId,
          detectedDamages: d.detectedDamages ?? d.detected_damages ?? [],
          severity: d.severity ?? 'medium',
          confidence: d.confidence ?? 0,
          estimatedCost: d.estimatedCost ?? d.estimated_cost ?? 0,
        })
      }
    })
  },

  // Step 7: Insurance Policy Verification
  verifyInsurance: (vehicleNumber: string, claimId: string) => {
    if (MOCK.insuranceVerify) {
      return wrapMock({
        claimId,
        vehicleNumber,
        policyStatus: 'active',
        coverageValid: true,
        policyExpiry: '2027-03-31T00:00:00Z',
        insuredAmount: 500000,
      })
    }
    return withRetry(() =>
      n8n.post(WEBHOOKS.insurance, {
        claim_id: claimId,
        vehicle_no: vehicleNumber,
      })
    ).then((res) => {
      const d = res.data as {
        policyStatus?: string
        policy_status?: string
        coverageValid?: boolean
        coverage_valid?: boolean
        policyExpiry?: string
        policy_expiry?: string
        insuredAmount?: number
        insured_amount?: number
      }
      return {
        data: mockResponse({
          claimId,
          vehicleNumber,
          policyStatus: d.policyStatus ?? d.policy_status ?? 'active',
          coverageValid: d.coverageValid ?? d.coverage_valid ?? true,
          policyExpiry: d.policyExpiry ?? d.policy_expiry ?? '',
          insuredAmount: d.insuredAmount ?? d.insured_amount ?? 0,
        })
      }
    })
  },
  list: () => {
    if (MOCK.claimList) return wrapMock<Claim[]>(MOCK_CLAIMS)
    return withRetry(() => apiClient.get<ApiResponse<Claim[]>>('/claim'))
  },
}

// ─── BLOCKCHAIN API ──────────────────────────────────────────────────────────

export const blockchainApi = {
  getRecord: async (claimId: string) => {
    if (MOCK.blockchain) return wrapMock<BlockchainRecord>({ ...MOCK_BLOCKCHAIN, claimId })

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/payments?claim_id=eq.${claimId}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    )
    const data = await res.json()
    const record = data[0] ?? {}
    const txHash = record.transaction_hash ?? ''

    return {
      data: mockResponse<BlockchainRecord>({
        claimId,
        txHash,
        blockNumber: record.block_number ?? 0,
        network: 'Sepolia Testnet',
        status: txHash ? 'confirmed' : 'pending',
        timestamp: record.created_at ?? new Date().toISOString(),
        explorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
      })
    }
  },
}