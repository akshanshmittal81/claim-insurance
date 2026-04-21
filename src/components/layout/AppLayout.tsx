import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Plus, ListChecks, LogOut, Shield, ChevronRight, Sun, Moon,
} from 'lucide-react'
import { useAppStore } from '@/store'
import { cn } from '@/utils'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'

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
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('ct_theme') === 'dark'
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('ct_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('ct_theme', 'light')
    }
  }, [darkMode])

  const handleLogout = () => {
    clearAuth()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{
      background: darkMode
        ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
        : 'linear-gradient(135deg, #F0F7FF 0%, #E8F5E9 50%, #F0F7FF 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{
        background: darkMode ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: darkMode ? '1px solid rgba(51,65,85,0.8)' : '1px solid rgba(191,219,254,0.6)',
        boxShadow: '0 2px 20px rgba(59,130,246,0.08)'
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2563EB, #10B981)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-lg tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Claim<span className="gradient-text">Titans</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = location.pathname === href
              return (
                <Link key={href} to={href} className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'text-blue-500 font-semibold'
                    : darkMode
                      ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                )} style={active ? {
                  background: darkMode ? 'rgba(37,99,235,0.15)' : 'linear-gradient(135deg, #EFF6FF, #F0FDF4)',
                  border: darkMode ? '1px solid rgba(37,99,235,0.3)' : '1px solid #BFDBFE'
                } : {}}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold"
                style={{
                  background: darkMode ? 'rgba(37,99,235,0.15)' : 'linear-gradient(135deg, #DBEAFE, #D1FAE5)',
                  border: darkMode ? '1px solid rgba(37,99,235,0.3)' : '1px solid #BFDBFE',
                  color: darkMode ? '#60A5FA' : '#1D4ED8'
                }}>
                {user.vehicleNumber}
              </div>
            )}

            {/* Dark/Light toggle */}
            <button
              onClick={() => setDarkMode(d => !d)}
              className="p-2 rounded-xl transition-all duration-200"
              style={{
                background: darkMode ? 'rgba(51,65,85,0.8)' : 'rgba(241,245,249,0.8)',
                border: darkMode ? '1px solid rgba(71,85,105,0.5)' : '1px solid #E2E8F0',
              }}>
              {darkMode
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-slate-500" />
              }
            </button>

            <button onClick={handleLogout}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40" style={{
        background: darkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: darkMode ? '1px solid rgba(51,65,85,0.8)' : '1px solid rgba(191,219,254,0.6)',
        boxShadow: '0 -4px 20px rgba(59,130,246,0.08)'
      }}>
        <div className="grid grid-cols-3 h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location.pathname === href
            return (
              <Link key={href} to={href} className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200',
                active
                  ? 'text-blue-500'
                  : darkMode ? 'text-slate-500' : 'text-slate-400'
              )}>
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main */}
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

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3" />}
          {item.href ? (
            <Link to={item.href} className="hover:text-blue-600 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-slate-600 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}