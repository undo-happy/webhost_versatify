import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'
import { SettingsProvider } from './state/SettingsContext.tsx'
import { DraftsProvider } from './state/DraftsContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <DraftsProvider>
        <App />
      </DraftsProvider>
    </SettingsProvider>
  </React.StrictMode>,
)
