import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Claim, ClaimResult, ClaimStatus, BlockchainRecord } from '@/types'

// ─── Auth Slice ───────────────────────────────────────────────────────────────

interface AuthSlice {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  setUser: (user: User) => void
  clearAuth: () => void
}

// ─── Claim Slice ──────────────────────────────────────────────────────────────

interface ClaimSlice {
  activeClaim: Claim | null
  claimStatus: ClaimStatus | null
  claimResult: ClaimResult | null
  claimList: Claim[]
  blockchainRecord: BlockchainRecord | null
  setActiveClaim: (claim: Claim) => void
  setClaimStatus: (status: ClaimStatus) => void
  setClaimResult: (result: ClaimResult) => void
  setClaimList: (claims: Claim[]) => void
  setBlockchainRecord: (record: BlockchainRecord) => void
  clearClaim: () => void
}

// ─── UI Slice ─────────────────────────────────────────────────────────────────

interface UiSlice {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

// ─── Combined Store ───────────────────────────────────────────────────────────

type AppStore = AuthSlice & ClaimSlice & UiSlice

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Auth
      isAuthenticated: false,
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('ct_token', token)
        set({ isAuthenticated: true, token, user })
      },
      setUser: (user) => set({ user }),
      clearAuth: () => {
        localStorage.removeItem('ct_token')
        set({ isAuthenticated: false, token: null, user: null })
      },

      // Claim
      activeClaim: null,
      claimStatus: null,
      claimResult: null,
      claimList: [],
      blockchainRecord: null,
      setActiveClaim: (claim) => set({ activeClaim: claim, claimStatus: claim.status }),
      setClaimStatus: (status) => set({ claimStatus: status }),
      setClaimResult: (result) => set({ claimResult: result }),
      setClaimList: (claims) => set({ claimList: claims }),
      setBlockchainRecord: (record) => set({ blockchainRecord: record }),
      clearClaim: () =>
        set({
          activeClaim: null,
          claimStatus: null,
          claimResult: null,
          blockchainRecord: null,
        }),

      // UI
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'claimtitans-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
    }
  )
)

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAuth = (s: AppStore) => ({
  isAuthenticated: s.isAuthenticated,
  token: s.token,
  user: s.user,
})

export const selectClaim = (s: AppStore) => ({
  activeClaim: s.activeClaim,
  claimStatus: s.claimStatus,
  claimResult: s.claimResult,
  claimList: s.claimList,
})
