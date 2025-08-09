import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Settings = {
  apiBaseUrl: string;
  authToken: string;
  setApiBaseUrl: (v: string) => void;
  setAuthToken: (v: string) => void;
};

const SettingsContext = createContext<Settings | null>(null);

function useLocalStorage(key: string, initialValue: string) {
  const [value, setValue] = useState<string>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? item : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiBaseUrl, setApiBaseUrl] = useLocalStorage('apiBaseUrl', (import.meta as any).env?.VITE_API_BASE_URL || '/api');
  const [authToken, setAuthToken] = useLocalStorage('authToken', '');

  const value = useMemo<Settings>(() => ({ apiBaseUrl, authToken, setApiBaseUrl, setAuthToken }), [apiBaseUrl, authToken]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}