import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

// Pages
import LandingPage from '@/pages/LandingPage'
import AuthPage from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import ClaimCapturePage from '@/pages/ClaimCapturePage'
import ClaimProcessingPage from '@/pages/ClaimProcessingPage'
import ClaimResultPage from '@/pages/ClaimResultPage'
import BlockchainPage from '@/pages/BlockchainPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claim/new"
          element={
            <ProtectedRoute>
              <ClaimCapturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claim/:id/processing"
          element={
            <ProtectedRoute>
              <ClaimProcessingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claim/:id/result"
          element={
            <ProtectedRoute>
              <ClaimResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claim/:id/blockchain"
          element={
            <ProtectedRoute>
              <BlockchainPage />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/claims" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
