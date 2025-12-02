import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#002c6a',
    },
    secondary: {
      main: '#f8d99b',
    },
    common: {
      black: '#2c2d2d',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    body1: {
      fontSize: '1rem',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 15px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          letterSpacing: '0.1rem',
          fontFamily: 'Inter, sans-serif',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.01)',
            cursor: 'pointer',
          },
          '&:active': {
            transform: 'scale(0.99)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily: 'Inter, sans-serif',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'primary.main',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        },
      },
    },
  },
})

export default theme
