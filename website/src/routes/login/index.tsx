import { Box, Button, TextField, Typography } from '@mui/material'
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 400,
        margin: '0 auto',
        height: '100vh',
        gap: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="h5">Bem-vindo à CommitPT</Typography>
      <TextField
        color="primary"
        size="small"
        label="Nome de utilizador do discord"
        type="email"
        fullWidth
      />
      <TextField
        color="primary"
        size="small"
        label="Palavra-passe"
        type="password"
        fullWidth
      />
      <Button variant="contained" color="primary" fullWidth>
        Iniciar Sessão
      </Button>
      <Typography variant="body2">
        Não tem uma conta?{' '}
        <Typography
          variant="body2"
          component={Link}
          color="primary"
          to="/login"
        >
          Crie uma conta
        </Typography>
      </Typography>
    </Box>
  )
}
