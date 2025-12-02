import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

// Import the generated route tree
import { ThemeProvider } from '@mui/material/styles'

import reportWebVitals from './reportWebVitals.ts'
import './styles.css'
import theme from './theme'
import App from './app.tsx'

// Create a new router instance

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
