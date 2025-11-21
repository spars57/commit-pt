import { createFileRoute, redirect } from '@tanstack/react-router';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { authStorage } from '../../lib/auth';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
  beforeLoad: ({ location }) => {
    if (!authStorage.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function DashboardPage() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        padding: 4,
      }}
    >
      <Paper
        sx={{
          padding: 4,
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 3,
          }}
        >
          <Typography variant="h4">Dashboard</Typography>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Sair
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Bem-vindo! Está autenticado e pode aceder a esta página protegida.
        </Typography>
      </Paper>
    </Box>
  );
}

