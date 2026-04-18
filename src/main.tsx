import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#181B22',
          color: '#F8FAFC',
          border: '1px solid #272C38',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Sora, sans-serif',
        },
        success: {
          iconTheme: { primary: '#10B981', secondary: '#181B22' },
        },
        error: {
          iconTheme: { primary: '#EF4444', secondary: '#181B22' },
        },
      }}
    />
  </StrictMode>
)
