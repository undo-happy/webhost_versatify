import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './styles.css'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey} afterSignInUrl="/" afterSignUpUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>
)