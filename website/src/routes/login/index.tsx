import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi, authStorage } from '../../lib/auth'

export const Route = createFileRoute('/login/')({
  component: LoginPage,
  beforeLoad: () => {
    if (authStorage.isAuthenticated()) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

function LoginPage() {
  const navigate = useNavigate()
  const { setIsAuthenticated } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await authApi.login({ identifier, password })
      authStorage.setTokens(response.accessToken, response.refreshToken)
      setIsAuthenticated(true)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 400,
        margin: '0 auto',
        height: '100vh',
        gap: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
      }}
    >
      <Typography variant="h5">Bem-vindo à CommitPT</Typography>
      <Typography variant="body2" color="text.secondary">
        Inicie sessão com o seu email ou nome de utilizador do Discord
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
        }}
      >
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          label="Email ou Nome de utilizador do Discord"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          fullWidth
          disabled={loading}
        />

        <TextField
          label="Palavra-passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          disabled={loading}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Iniciar Sessão'}
        </Button>
      </Box>

      <Typography variant="body2">
        Não tem uma conta?{' '}
        <Typography
          variant="body2"
          component={Link}
          to="/register"
          color="primary"
          sx={{
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Crie uma conta
        </Typography>
      </Typography>
    </Box>
  )
}
