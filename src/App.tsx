import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuth } from '@/hooks/useAuth'

function AppContent() {
  useAuth()
  return <RouterProvider router={router} />
}

export default function App() {
  return <AppContent />
}
