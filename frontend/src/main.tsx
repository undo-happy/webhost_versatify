import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'
import { SettingsProvider } from './state/SettingsContext.tsx'
import { DraftsProvider } from './state/DraftsContext.tsx'
import { ClerkProvider } from '@clerk/clerk-react'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey || 'pk_test_demo'}>
      <SettingsProvider>
        <DraftsProvider>
          <App />
        </DraftsProvider>
      </SettingsProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
