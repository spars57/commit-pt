import { createFileRoute, redirect } from '@tanstack/react-router'
import { authStorage } from '../lib/auth'

export const Route = createFileRoute('/')({
  component: App,
  loader: () => {
    if (authStorage.isAuthenticated()) {
      throw redirect({ to: '/dashboard' })
    } else {
      throw redirect({ to: '/login' })
    }
  },
})

function App() {
  return <div className="text-center"></div>
}
