import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
  loader: () => {
    throw redirect({ to: '/login' })
  },
})

function App() {
  return <div className="text-center"></div>
}
