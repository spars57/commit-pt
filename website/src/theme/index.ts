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
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.01em',
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
