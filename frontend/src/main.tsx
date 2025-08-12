import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'
import { SettingsProvider } from './state/SettingsContext.tsx'
import { DraftsProvider } from './state/DraftsContext.tsx'
import { ClerkProvider } from '@clerk/clerk-react'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Clerk Publishable Key가 없으면 경고 표시하지만 앱은 계속 실행
if (!clerkPubKey) {
  console.warn('VITE_CLERK_PUBLISHABLE_KEY not found. Authentication will be disabled. Add your Clerk Publishable Key to .env file.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey || 'pk_test_fallback_key_demo_mode'}>
      <SettingsProvider>
        <DraftsProvider>
          <App />
        </DraftsProvider>
      </SettingsProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
