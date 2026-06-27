
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_OTP_REQUEST_WEBHOOK: string
  readonly VITE_OTP_VERIFY_WEBHOOK: string
  readonly VITE_DAMAGE_WEBHOOK_ID: string
  readonly VITE_DUPLICATEIMAGE_WEBHOOK_ID: string
  readonly VITE_PAYMENT_WEBHOOK_ID: string
  readonly VITE_GARAGE_WEBHOOK_ID: string
  readonly VITE_DECISION_WEBHOOK_ID: string
  readonly VITE_FRAUD_WEBHOOK_ID: string
  readonly VITE_POLICY_WEBHOOK_ID: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}