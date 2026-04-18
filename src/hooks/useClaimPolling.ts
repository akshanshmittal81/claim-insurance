import { useEffect, useRef, useCallback } from 'react'
import { claimApi } from '@/services/api'
import { useAppStore } from '@/store'
import type { ClaimStatus } from '@/types'
import { POLLING_INTERVAL_MS } from '@/constants'

const TERMINAL_STATUSES: ClaimStatus[] = ['completed', 'rejected']

interface UseClaimPollingOptions {
  claimId: string
  onComplete?: (status: ClaimStatus) => void
  onError?: (error: unknown) => void
}

export function useClaimPolling({ claimId, onComplete, onError }: UseClaimPollingOptions) {
  const setClaimStatus = useAppStore((s) => s.setClaimStatus)
  const claimStatus = useAppStore((s) => s.claimStatus)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPollingRef = useRef(false)

  const poll = useCallback(async () => {
    if (!claimId || isPollingRef.current) return
    isPollingRef.current = true

    try {
      const response = await claimApi.getStatus(claimId)
      const { status } = response.data.data
      setClaimStatus(status)

      if (TERMINAL_STATUSES.includes(status)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        onComplete?.(status)
      }
    } catch (error) {
      onError?.(error)
    } finally {
      isPollingRef.current = false
    }
  }, [claimId, setClaimStatus, onComplete, onError])

  useEffect(() => {
    if (!claimId) return
    if (claimStatus && TERMINAL_STATUSES.includes(claimStatus)) return

    poll()
    intervalRef.current = setInterval(poll, POLLING_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [claimId, poll, claimStatus])

  return { claimStatus }
}
