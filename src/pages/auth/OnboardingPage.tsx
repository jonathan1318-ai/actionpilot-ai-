import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrganization } from '@/services/firebase/organizations'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function OnboardingPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!user || !name.trim()) return
    setLoading(true)
    try {
      await createOrganization(user.uid, name.trim(), domain.trim())
      navigate('/meetings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-gray-900">Set up your workspace</h2>
      <p className="mb-6 text-sm text-gray-500">You can invite teammates after setup.</p>

      <div className="space-y-4">
        <Input label="Organisation name" value={name} onChange={e => setName(e.target.value)} placeholder="Acme Sdn. Bhd." />
        <Input label="Domain (optional)" value={domain} onChange={e => setDomain(e.target.value)} placeholder="acme.com" />
      </div>

      <Button className="mt-6 w-full justify-center" onClick={handleCreate} loading={loading} disabled={!name.trim()}>
        Create workspace
      </Button>
    </div>
  )
}
