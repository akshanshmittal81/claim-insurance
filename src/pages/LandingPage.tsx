import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  Zap,
  Eye,
  Lock,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  ScanLine,
  Cpu,
  GitBranch,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const features = [
  {
    icon: ScanLine,
    title: 'AI Damage Detection',
    description:
      'YOLOv8-powered computer vision instantly classifies damage severity — scratch, dent, or total loss — in seconds.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/15',
  },
  {
    icon: Eye,
    title: 'Fraud Detection',
    description:
      'Every claim is scored 0–100 using multi-layer fraud analysis including image tampering detection and claim history.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/15',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    description:
      'End-to-end automated pipeline from photo upload to garage assignment — no paperwork, no waiting weeks.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/15',
  },
  {
    icon: Lock,
    title: 'Blockchain Records',
    description:
      'Every claim decision is written to an immutable blockchain ledger — tamper-proof, auditable, and transparent.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/15',
  },
  {
    icon: Cpu,
    title: 'Explainable AI',
    description:
      "Decisions aren't black boxes. Each claim verdict comes with human-readable reasoning powered by explainable AI.",
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/15',
  },
  {
    icon: GitBranch,
    title: 'Smart Contracts',
    description:
      'Payment releases are automated via smart contracts — triggered only when all verification conditions are met.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/15',
  },
]

const steps = [
  { n: '01', label: 'Capture damage photos or video' },
  { n: '02', label: 'AI analyzes damage in real-time' },
  { n: '03', label: 'Fraud score computed instantly' },
  { n: '04', label: 'Decision in seconds, not days' },
  { n: '05', label: 'Garage assigned, payment released' },
]

const stats = [
  { value: '< 60s', label: 'Claim processing time' },
  { value: '94%', label: 'Fraud detection accuracy' },
  { value: '₹0', label: 'Paperwork required' },
  { value: '24/7', label: 'System availability' },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-surface-0 overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-primary tracking-tight">
              Claim<span className="gradient-text">Titans</span>
            </span>
          </div>
          <Link
            to="/auth"
            className="btn-primary text-sm py-2 px-5"
          >
            Get Started
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-blue-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-cyan-500/8 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-blue-500/20 text-xs font-semibold text-blue-400 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Cognizant Technoverse 2026 · Team ClaimTitans
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
          >
            Insurance claims,{' '}
            <span className="gradient-text">reimagined</span>
            <br />
            with AI.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-lg sm:text-xl text-ink-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Submit your vehicle damage claim in seconds. Our AI handles fraud detection,
            damage analysis, and payment release — automatically, transparently, and fairly.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/auth" className="btn-primary text-base py-3.5 px-8 w-full sm:w-auto">
              File a Claim
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary text-base py-3.5 px-8 w-full sm:w-auto"
            >
              How it works
            </a>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative max-w-3xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="card text-center py-5">
              <div className="text-2xl font-bold gradient-text mb-1">{value}</div>
              <div className="text-xs text-ink-muted">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for the future of insurance
            </h2>
            <p className="text-ink-secondary max-w-xl mx-auto">
              Every component of our system is designed to remove friction, detect fraud,
              and deliver decisions at machine speed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  custom={i * 0.05}
                  className={`card border ${feature.border} group hover:scale-[1.02] transition-transform duration-300`}
                >
                  <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-ink-primary mb-2">{feature.title}</h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-surface-1/50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">From photo to payment</h2>
            <p className="text-ink-secondary">Five steps, fully automated.</p>
          </motion.div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.1}
                className="flex items-center gap-5 card py-5"
              >
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 flex-shrink-0">
                  {step.n}
                </span>
                <span className="text-ink-primary font-medium">{step.label}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="relative card border border-blue-500/20 py-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-blue-500/8 via-transparent to-transparent" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to file your claim?
              </h2>
              <p className="text-ink-secondary mb-8">
                Takes less than 2 minutes. No paperwork. No waiting.
              </p>
              <Link to="/auth" className="btn-primary text-base py-3.5 px-10 inline-flex">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>ClaimTitans · Cognizant Technoverse 2026</span>
          </div>
          <span>MIET Meerut · Team ClaimTitans</span>
        </div>
      </footer>
    </div>
  )
}
