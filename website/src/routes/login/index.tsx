import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
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
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'A palavra-passe deve ter pelo menos 6 caracteres')
    .max(32),
})

type LoginFormData = z.infer<typeof schema>

function LoginPage() {
  const navigate = useNavigate()
  const { setIsAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setLoading(true)

    try {
      const response = await authApi.login({
        identifier: data.email,
        password: data.password,
      })
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
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 400,
          margin: '0 auto',
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
          onSubmit={handleSubmit(onSubmit)}
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
            {...register('email')}
            size="small"
            label="Email ou Nome de Utilizador"
            type="text"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            {...register('password')}
            size="small"
            label="Palavra-passe"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
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
      </Paper>
    </Box>
  )
}
