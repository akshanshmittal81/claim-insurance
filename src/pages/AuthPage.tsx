import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Car, Phone, ArrowRight, ArrowLeft, KeyRound, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authApi } from '@/services/api'
import { useAppStore } from '@/store'
import toast from 'react-hot-toast'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  vehicleNumber: z
    .string()
    .min(6, 'Enter a valid vehicle number')
    .max(15)
    .transform((v) => v.toUpperCase().trim()),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

const step2Schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const navigate = useNavigate()
  const setAuth = useAppStore((s) => s.setAuth)

  const [step, setStep] = useState<1 | 2>(1)
  const [credentials, setCredentials] = useState<Step1Data | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { vehicleNumber: '', phone: '' },
  })

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: '' },
  })

  const startResendTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const onStep1Submit = async (data: Step1Data) => {
    setIsLoading(true)
    try {
      await authApi.requestOtp({ vehicleNumber: data.vehicleNumber, phone: data.phone })
      setCredentials(data)
      setStep(2)
      startResendTimer()
      toast.success(`OTP sent to +91 ${data.phone}`)
    } catch {
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onStep2Submit = async (data: Step2Data) => {
    if (!credentials) return
    setIsLoading(true)
    try {
      const response = await authApi.verifyOtp({
        vehicleNumber: credentials.vehicleNumber,
        phone: credentials.phone,
        otp: data.otp,
      })
      const { token, user } = response.data.data
      setAuth(token, user)
      toast.success(`Welcome, ${user.name}!`)
      navigate('/dashboard')
    } catch {
      toast.error('Invalid OTP. Please try again.')
      form2.setError('otp', { message: 'Incorrect OTP' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!credentials || resendTimer > 0) return
    setIsLoading(true)
    try {
      await authApi.requestOtp(credentials)
      startResendTimer()
      toast.success('OTP resent!')
    } catch {
      toast.error('Failed to resend OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-surface-0 flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-blue-500/8 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-cyan-500/6 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-ink-primary">
            Claim<span className="gradient-text">Titans</span>
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-ink-primary mb-2">Sign in</h1>
                  <p className="text-ink-secondary text-sm">
                    Enter your vehicle number and phone to receive an OTP.
                  </p>
                </div>

                {/* Google Sign In (UI only) */}
                <button
                  type="button"
                  className="w-full btn-secondary mb-6 py-3.5 text-sm"
                  onClick={() => toast('Google sign-in will be available soon.', { icon: '🔗' })}
                >
                  <Chrome className="w-4 h-4" />
                  Continue with Google
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/8" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-surface-0 text-xs text-ink-muted">or continue with vehicle details</span>
                  </div>
                </div>

                <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-5">
                  <Input
                    label="Vehicle Number"
                    placeholder="MH12AB1234"
                    prefix={<Car className="w-4 h-4" />}
                    error={form1.formState.errors.vehicleNumber?.message}
                    {...form1.register('vehicleNumber')}
                    className="font-mono uppercase"
                  />
                  <Input
                    label="Mobile Number"
                    placeholder="9876543210"
                    type="tel"
                    maxLength={10}
                    prefix={<span className="text-xs font-mono text-ink-muted">+91</span>}
                    error={form1.formState.errors.phone?.message}
                    {...form1.register('phone')}
                    className="font-mono"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    className="w-full mt-2"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Send OTP
                  </Button>
                </form>

                <p className="text-xs text-ink-muted text-center mt-6">
                  By continuing, you agree to our{' '}
                  <span className="text-blue-400 cursor-pointer hover:underline">Terms of Service</span>.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-ink-secondary hover:text-ink-primary text-sm mb-8 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <KeyRound className="w-6 h-6 text-blue-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-ink-primary mb-2">Enter OTP</h1>
                  <p className="text-ink-secondary text-sm">
                    We sent a 6-digit code to{' '}
                    <span className="text-ink-primary font-mono">+91 {credentials?.phone}</span>
                  </p>
                </div>

                <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-5">
                  <Input
                    label="One-Time Password"
                    placeholder="• • • • • •"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    prefix={<Phone className="w-4 h-4" />}
                    error={form2.formState.errors.otp?.message}
                    {...form2.register('otp')}
                    className="font-mono text-lg tracking-[0.5em] text-center"
                    autoFocus
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    className="w-full"
                  >
                    Verify & Continue
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className="text-sm text-ink-secondary hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0
                      ? `Resend OTP in ${resendTimer}s`
                      : 'Resend OTP'}
                  </button>
                </div>

                {/* Demo hint */}
                <div className="mt-8 p-4 rounded-2xl bg-surface-2 border border-surface-3">
                  <p className="text-xs text-ink-muted text-center">
                    <span className="text-ink-secondary font-medium">Demo mode:</span> use OTP{' '}
                    <span className="font-mono text-blue-400">123456</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
