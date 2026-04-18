import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Plus,
  ListChecks,
  LogOut,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { useAppStore } from '@/store'
import { cn } from '@/utils'
import toast from 'react-hot-toast'

interface AppLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/claim/new', label: 'New Claim', icon: Plus },
  { href: '/claims', label: 'My Claims', icon: ListChecks },
]

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAppStore()

  const handleLogout = () => {
    clearAuth()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-0">
      {/* Top nav */}
      <header className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-primary tracking-tight">
              Claim<span className="gradient-text">Titans</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = location.pathname === href
              return (
                <Link
                  key={href}
                  to={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-2'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-ink-secondary">
                <span className="font-mono text-xs bg-surface-2 px-2.5 py-1 rounded-lg border border-surface-3">
                  {user.vehicleNumber}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-ink-secondary hover:text-red-400 hover:bg-red-500/5 text-sm font-medium transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-white/5">
        <div className="grid grid-cols-3 h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200',
                  active ? 'text-blue-400' : 'text-ink-muted'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="max-w-6xl mx-auto px-4 sm:px-6 py-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-ink-muted mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3" />}
          {item.href ? (
            <Link to={item.href} className="hover:text-ink-secondary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-secondary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
