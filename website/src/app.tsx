import { Box, useTheme } from '@mui/material'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { queryClient } from './lib/queryClient'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => {
  const { palette } = useTheme()
  return (
    <Box sx={{ background: palette.grey[200] }}>
      <RouterProvider router={router} />
    </Box>
  )
}

export default App
