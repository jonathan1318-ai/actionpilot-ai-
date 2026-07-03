import { useNavigate } from 'react-router-dom'
import { signInWithGoogle } from '@/services/firebase/auth'
import { Button } from '@/components/ui/Button'
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
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">ActionPilot AI</h1>
        <p className="mt-2 text-sm text-gray-500">Meetings → Action. Automatically.</p>
      </div>

      <Button className="w-full justify-center" variant="secondary" onClick={handleGoogleSignIn} loading={loading}>
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-4 w-4" />
        Continue with Google
      </Button>

      {error && <p className="mt-3 text-center text-xs text-red-600">{error}</p>}

      <p className="mt-6 text-center text-xs text-gray-400">
        By continuing you agree to our Terms of Service.
      </p>
    </div>
  )
}
