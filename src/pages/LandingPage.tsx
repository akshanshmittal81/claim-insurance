import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Zap, Eye, Lock, ChevronRight, CheckCircle2,
  ArrowRight, ScanLine, Cpu, GitBranch,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const features = [
  {
    icon: ScanLine, title: 'AI Damage Detection',
    description: 'YOLOv8-powered computer vision instantly classifies damage severity in seconds.',
    gradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
    border: '#BFDBFE', iconBg: 'linear-gradient(135deg, #2563EB, #0EA5E9)', 
  },
  {
    icon: Eye, title: 'Fraud Detection',
    description: 'Every claim scored 0–100 using GAN detection, image tampering analysis, and claim history.',
    gradient: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
    border: '#BBF7D0', iconBg: 'linear-gradient(135deg, #059669, #10B981)',
  },
  {
    icon: Zap, title: 'Instant Processing',
    description: 'End-to-end automated pipeline from photo upload to garage assignment — no paperwork.',
    gradient: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
    border: '#A7F3D0', iconBg: 'linear-gradient(135deg, #0891B2, #06B6D4)',
  },
  {
    icon: Lock, title: 'Blockchain Records',
    description: 'Every claim decision written to an immutable blockchain ledger — tamper-proof and transparent.',
    gradient: 'linear-gradient(135deg, #EFF6FF, #E0F2FE)',
    border: '#BAE6FD', iconBg: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
  },
  {
    icon: Cpu, title: 'Explainable AI',
    description: 'Each verdict comes with human-readable reasoning — no black boxes.',
    gradient: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
    border: '#FDE68A', iconBg: 'linear-gradient(135deg, #D97706, #F59E0B)',
  },
  {
    icon: GitBranch, title: 'Smart Contracts',
    description: 'Payment releases automated via smart contracts — triggered only when all conditions are met.',
    gradient: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)',
    border: '#FECDD3', iconBg: 'linear-gradient(135deg, #DC2626, #EF4444)',
  },
]

const steps = [
  { n: '01', label: 'Capture damage photos or video' },
  { n: '02', label: 'GAN model verifies image authenticity' },
  { n: '03', label: 'AI analyzes damage in real-time' },
  { n: '04', label: 'Fraud score computed instantly' },
  { n: '05', label: 'Decision in seconds, garage assigned, payment released' },
]

const stats = [
  { value: '< 60s', label: 'Claim processing time' },
  { value: '98%', label: 'GAN detection accuracy' },
  { value: '₹0', label: 'Paperwork required' },
  { value: '24/7', label: 'System availability' },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden" style={{
      background: 'linear-gradient(135deg, #F0F7FF 0%, #E8F5E9 50%, #F0F7FF 100%)',
    }}>
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50" style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(191,219,254,0.5)',
        boxShadow: '0 2px 20px rgba(59,130,246,0.07)'
      }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">
              Claim<span className="gradient-text">Titans</span>
            </span>
          </div>
          <Link to="/auth" className="btn-primary text-sm py-2 px-5">
            Get Started <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
          <div className="absolute top-40 left-10 w-48 h-48 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #10B981, transparent)' }} />
          <div className="absolute bottom-10 right-1/3 w-56 h-56 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #0EA5E9, transparent)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-blue-700 mb-8"
            style={{ background: 'linear-gradient(135deg, #DBEAFE, #D1FAE5)', border: '1px solid #BFDBFE' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Cognizant Technoverse 2026 · Team ClaimTitans · MIET Meerut
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight mb-6 text-slate-900"
          >
            Insurance claims,{' '}
            <span className="gradient-text">reimagined</span>
            <br />with AI.
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Submit your vehicle damage claim in seconds. Our AI handles GAN detection,
            fraud analysis, damage assessment, and payment release — automatically and transparently.
          </motion.p>

          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/auth" className="btn-primary text-base py-3.5 px-8 w-full sm:w-auto">
              File a Claim <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="btn-secondary text-base py-3.5 px-8 w-full sm:w-auto">
              How it works
            </a>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative max-w-3xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="card text-center py-5 card-hover">
              <div className="text-2xl font-bold gradient-text mb-1">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} className="text-center mb-16"
          >
            <h2 className="section-title mb-4">Built for the future of insurance</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Every component designed to remove friction, detect fraud, and deliver decisions at machine speed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial="hidden" whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp} custom={i * 0.05}
                  className="rounded-3xl p-6 card-hover cursor-default"
                  style={{ background: feature.gradient, border: `1px solid ${feature.border}` }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-md"
                    style={{ background: feature.iconBg }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} className="text-center mb-16"
          >
            <h2 className="section-title mb-4">From photo to payment</h2>
            <p className="text-slate-500">Five steps, fully automated.</p>
          </motion.div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial="hidden" whileInView="visible"
                viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}
                className="flex items-center gap-5 rounded-2xl px-6 py-4 card-hover"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(191,219,254,0.6)',
                  boxShadow: '0 2px 12px rgba(59,130,246,0.06)'
                }}
              >
                <span className="font-mono text-xs font-bold text-white px-3 py-1.5 rounded-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
                  {step.n}
                </span>
                <span className="text-slate-700 font-medium">{step.label}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="rounded-3xl py-16 px-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1D4ED8, #0EA5E9, #10B981)',
              boxShadow: '0 20px 60px rgba(37,99,235,0.35)'
            }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to file your claim?
              </h2>
              <p className="text-blue-100 mb-8">Takes less than 2 minutes. No paperwork. No waiting.</p>
              <Link to="/auth"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-blue-700 transition-all duration-200 hover:scale-105"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6" style={{ borderColor: 'rgba(191,219,254,0.4)', background: 'rgba(255,255,255,0.5)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>ClaimTitans · Cognizant Technoverse 2026</span>
          </div>
          <span>MIET Meerut · Team ClaimTitans</span>
        </div>
      </footer>
    </div>
  )
}