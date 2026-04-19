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

const step1Schema = z.object({
  vehicleNumber: z.string().min(6, 'Enter a valid vehicle number').max(15).transform((v) => v.toUpperCase().trim()),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

const step2Schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

export default function AuthPage() {
  const navigate = useNavigate()
  const setAuth = useAppStore((s) => s.setAuth)
  const [step, setStep] = useState<1 | 2>(1)
  const [credentials, setCredentials] = useState<Step1Data | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema), defaultValues: { vehicleNumber: '', phone: '' } })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema), defaultValues: { otp: '' } })

  const startResendTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer((t) => { if (t <= 1) { clearInterval(interval); return 0 } return t - 1 })
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
      const response = await authApi.verifyOtp({ vehicleNumber: credentials.vehicleNumber, phone: credentials.phone, otp: data.otp })
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
    <div className="min-h-dvh flex flex-col" style={{
      background: 'linear-gradient(135deg, #F0F7FF 0%, #E8F5E9 50%, #F0F7FF 100%)',
    }}>
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #10B981, transparent)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800">
            Claim<span className="gradient-text">Titans</span>
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl p-8" style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(191,219,254,0.6)',
            boxShadow: '0 20px 60px rgba(59,130,246,0.1), 0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h1>
                    <p className="text-slate-500 text-sm">Enter your vehicle number and phone to receive an OTP.</p>
                  </div>

                  {/* Google */}
                  <button type="button"
                    onClick={() => toast('Google sign-in coming soon!', { icon: '🔗' })}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-slate-600 mb-6 transition-all hover:shadow-md"
                    style={{ background: 'white', border: '1.5px solid #E2E8F0' }}>
                    <Chrome className="w-4 h-4" />
                    Continue with Google
                  </button>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white text-xs text-slate-400">or continue with vehicle details</span>
                    </div>
                  </div>

                  <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
                    <Input label="Vehicle Number" placeholder="UP15ER2915"
                      prefix={<Car className="w-4 h-4 text-blue-400" />}
                      error={form1.formState.errors.vehicleNumber?.message}
                      {...form1.register('vehicleNumber')}
                      className="font-mono uppercase" />
                    <Input label="Mobile Number" placeholder="9876543210"
                      type="tel" maxLength={10}
                      prefix={<span className="text-xs font-mono text-slate-400">+91</span>}
                      error={form1.formState.errors.phone?.message}
                      {...form1.register('phone')}
                      className="font-mono" />
                    <Button type="submit" variant="primary" size="lg" loading={isLoading}
                      className="w-full mt-2" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                      Send OTP
                    </Button>
                  </form>

                  <p className="text-xs text-slate-400 text-center mt-6">
                    By continuing, you agree to our{' '}
                    <span className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span>.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="step2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                >
                  <button type="button" onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 text-sm mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
                      <KeyRound className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Enter OTP</h1>
                    <p className="text-slate-500 text-sm">
                      Sent to <span className="font-mono font-semibold text-slate-700">+91 {credentials?.phone}</span>
                    </p>
                  </div>

                  <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-4">
                    <Input label="One-Time Password" placeholder="• • • • • •"
                      type="text" inputMode="numeric" maxLength={6}
                      prefix={<Phone className="w-4 h-4 text-blue-400" />}
                      error={form2.formState.errors.otp?.message}
                      {...form2.register('otp')}
                      className="font-mono text-lg tracking-[0.5em] text-center" autoFocus />
                    <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full">
                      Verify & Continue
                    </Button>
                  </form>

                  <div className="text-center mt-6">
                    <button type="button" onClick={handleResend} disabled={resendTimer > 0}
                      className="text-sm text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <div className="mt-6 p-4 rounded-2xl text-center"
                    style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)', border: '1px solid #BFDBFE' }}>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Demo mode:</span> use OTP{' '}
                      <span className="font-mono font-bold text-blue-600">123456</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}