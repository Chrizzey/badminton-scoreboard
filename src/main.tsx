import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { getLocale, getMessages } from './i18n'

const locale = getLocale()
const messages = getMessages(locale)
document.documentElement.lang = locale
document.title = messages.appTitle

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App locale={locale} />
  </StrictMode>,
)
