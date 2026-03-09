import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import posthog from 'posthog-js'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.jsx'

posthog.init('phc_1YY2gkzJm1rdUX34l953TOHkeeupv6cfu56KRIriKzf', {
  api_host: 'https://eu.i.posthog.com',
  person_profiles: 'identified_only',
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
