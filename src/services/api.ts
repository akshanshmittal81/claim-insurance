/// <reference types="vite/client" />

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import toast from 'react-hot-toast'
import {
  MOCK_AUTH_RESPONSE,
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

// ─── Config ───────────────────────────────────────────────────────────────────

const N8N_BASE = import.meta.env.VITE_API_BASE_URL || 'https://aniketkansal3007.app.n8n.cloud/webhook'
const OTP_REQUEST_ID = import.meta.env.VITE_OTP_REQUEST_WEBHOOK || '7d0d0d60-44cf-4e20-9fe5-19217c319055'
const OTP_VERIFY_ID  = import.meta.env.VITE_OTP_VERIFY_WEBHOOK  || '7d0d0d60-44cf-4e20-9fe5-19217c319055'

const MOCK_DELAY_MS = 600

const MOCK = {
  requestOtp:  false,  // ✅ n8n real
  verifyOtp:   false,  // ✅ n8n real
  getUser:     true,   // ⏳ mock
  claimSubmit: true,   // ⏳ mock
  claimStatus: true,   // ⏳ mock
  claimResult: true,   // ⏳ mock
  claimList:   true,   // ⏳ mock
  garage:      true,   // ⏳ mock
  payment:     true,   // ⏳ mock
  blockchain:  true,   // ⏳ mock
}

// ─── Mock helpers ─────────────────────────────────────────────────────────────

function mockResponse<T>(data: T): ApiResponse<T> {
  return { data, success: true, message: 'OK' }
}

function wrapMock<T>(data: T, ms = MOCK_DELAY_MS): Promise<{ data: ApiResponse<T> }> {
  return new Promise((r) => setTimeout(() => r({ data: mockResponse(data) }), ms))
}

// ─── Axios instances ──────────────────────────────────────────────────────────

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

const n8n = axios.create({ timeout: 30000, headers: { 'Content-Type': 'application/json' } })

// ─── Retry helper ─────────────────────────────────────────────────────────────

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

// ─── AUTH API ─────────────────────────────────────────────────────────────────

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
        ...MOCK_AUTH_RESPONSE,
        user: {
          ...MOCK_AUTH_RESPONSE.user,
          vehicleNumber: payload.vehicleNumber.toUpperCase(),
          phone: payload.phone,
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

// ─── CLAIM API ────────────────────────────────────────────────────────────────

export const claimApi = {

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
    return withRetry(() => apiClient.post<ApiResponse<Claim>>('/claim', payload))
  },

  getStatus: (claimId: string) => {
    if (MOCK.claimStatus) {
      return wrapMock<ClaimStatusResponse>(getMockClaimStatus(claimId), 400)
    }
    return apiClient.get<ApiResponse<ClaimStatusResponse>>('/claim/' + claimId + '/status')
  },

  getResult: (claimId: string) => {
    if (MOCK.claimResult) return wrapMock<ClaimResult>({ ...MOCK_CLAIM_RESULT, claimId })
    return withRetry(() => apiClient.get<ApiResponse<ClaimResult>>('/claim/' + claimId + '/result'))
  },

  getGarage: (claimId: string) => {
    if (MOCK.garage) return wrapMock<GarageInfo>(MOCK_GARAGE)
    return withRetry(() => apiClient.get<ApiResponse<GarageInfo>>('/claim/' + claimId + '/garage'))
  },

  getPayment: (claimId: string) => {
    if (MOCK.payment) return wrapMock<PaymentInfo>(MOCK_PAYMENT)
    return withRetry(() => apiClient.get<ApiResponse<PaymentInfo>>('/claim/' + claimId + '/payment'))
  },

  list: () => {
    if (MOCK.claimList) return wrapMock<Claim[]>(MOCK_CLAIMS)
    return withRetry(() => apiClient.get<ApiResponse<Claim[]>>('/claim'))
  },
}

// ─── BLOCKCHAIN API ───────────────────────────────────────────────────────────

export const blockchainApi = {
  getRecord: (claimId: string) => {
    if (MOCK.blockchain) return wrapMock<BlockchainRecord>({ ...MOCK_BLOCKCHAIN, claimId })
    return withRetry(() =>
      apiClient.get<ApiResponse<BlockchainRecord>>('/claim/' + claimId + '/blockchain')
    )
  },
}