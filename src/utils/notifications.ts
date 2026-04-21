// ─── Push Notification Utility ────────────────────────────────────────────────

import type { ClaimStatus } from '@/types'

export const NOTIFICATION_MESSAGES: Partial<Record<ClaimStatus, { title: string; body: string }>> = {
  processing: {
    title: '📸 Photos Verified',
    body: 'Your damage photos have been verified. AI analysis starting...',
  },
  ai_analysis: {
    title: '🤖 AI Analysis in Progress',
    body: 'Our AI is analyzing your claim damage. Almost there!',
  },
  insurance_check: {
    title: '📋 Insurance Check',
    body: 'Verifying your policy details and coverage.',
  },
  fraud_detection: {
    title: '🔍 Fraud Detection Running',
    body: 'Checking claim authenticity. This is routine.',
  },
  garage_assigned: {
    title: '🔧 Garage Assigned!',
    body: 'A nearby authorized garage has been assigned to your claim.',
  },
  payment_processing: {
    title: '💰 Payment Processing',
    body: 'Releasing your payment via smart contract...',
  },
  completed: {
    title: '✅ Claim Approved!',
    body: 'Your claim has been approved. Payment is being released!',
  },
  rejected: {
    title: '❌ Claim Update',
    body: 'Your claim could not be approved. Tap to view details.',
  },
}

// Permission maango
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Notification bhejo
export function sendClaimNotification(
  status: ClaimStatus,
  claimDisplayId: string,
  claimId: string,
) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const msg = NOTIFICATION_MESSAGES[status]
  if (!msg) return

  const notification = new Notification(msg.title, {
    body: `${claimDisplayId} — ${msg.body}`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `claim-${claimId}`,       // same tag = pehli notification replace hogi
    requireInteraction: status === 'completed' || status === 'rejected', // important ones stay
  })

  // Click pe result page pe jaao
  notification.onclick = () => {
    window.focus()
    const isTerminal = status === 'completed' || status === 'rejected'
    window.location.href = isTerminal
      ? `/claim/${claimId}/result`
      : `/claim/${claimId}/processing`
    notification.close()
  }
}