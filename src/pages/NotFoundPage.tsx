import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh bg-surface-0 flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
          <Shield className="w-8 h-8 text-white" />
        </div>

        <div>
          <p className="font-mono text-6xl font-bold gradient-text mb-2">404</p>
          <h1 className="text-xl font-bold text-ink-primary mb-2">Page not found</h1>
          <p className="text-ink-secondary text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          to="/"
          className="btn-primary inline-flex"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </motion.div>
    </div>
  )
}
