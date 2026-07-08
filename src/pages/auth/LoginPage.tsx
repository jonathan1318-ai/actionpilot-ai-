import { useNavigate } from 'react-router-dom'
import { signInWithGoogle } from '@/services/firebase/auth'
import { useState } from 'react'

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      navigate('/meetings')
    } catch (err) {
      setError((err as Error).message || 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[380px] max-w-[90vw] animate-ap-fade-up rounded-3xl border border-ap-border bg-ap-surface p-9 text-center shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-ap-accent to-ap-accent-dark shadow-[0_8px_20px_var(--ap-accent-soft)]">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.8" /><circle cx="12" cy="12" r="2.2" fill="white" /></svg>
      </div>
      <h1 className="mb-1.5 text-[22px] font-bold tracking-tight text-ap-text-primary">ActionPilot AI</h1>
      <p className="mb-7 text-sm leading-relaxed text-ap-text-secondary">
        Turn meetings into tasks, schedules, and accountability — automatically.
      </p>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2.5 rounded-[14px] bg-ap-text-primary px-4 py-[13px] text-[15px] font-semibold text-ap-bg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38z" />
            <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77z" />
          </svg>
        )}
        Continue with Google
      </button>

      {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}

      <p className="mt-5 text-xs text-ap-text-tertiary">
        SSO available on Enterprise. Your data is never used to train public models.
      </p>
    </div>
  )
}
