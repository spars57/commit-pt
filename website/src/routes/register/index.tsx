import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link, createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { authApi, authStorage } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';

export const Route = createFileRoute('/register/')({
  component: RegisterPage,
  beforeLoad: () => {
    if (authStorage.isAuthenticated()) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

function RegisterPage() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        email,
        discordUsername,
        password,
      });
      authStorage.setTokens(response.accessToken, response.refreshToken);
      setIsAuthenticated(true);
      navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

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
      <Typography variant="h5">Criar Conta</Typography>
      <Typography variant="body2" color="text.secondary">
        Registe-se para começar a usar a CommitPT
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
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          disabled={loading}
        />

        <TextField
          label="Nome de utilizador do Discord"
          type="text"
          value={discordUsername}
          onChange={(e) => setDiscordUsername(e.target.value.replace('@', ''))}
          required
          fullWidth
          disabled={loading}
          helperText="O símbolo @ será removido automaticamente"
        />

        <TextField
          label="Palavra-passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          disabled={loading}
          helperText="Mínimo de 6 caracteres"
        />

        <TextField
          label="Confirmar palavra-passe"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? <CircularProgress size={24} /> : 'Criar Conta'}
        </Button>
      </Box>

      <Typography variant="body2">
        Já tem uma conta?{' '}
        <Typography
          variant="body2"
          component={Link}
          to="/login"
          color="primary"
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Inicie sessão
        </Typography>
      </Typography>
    </Box>
  );
}

