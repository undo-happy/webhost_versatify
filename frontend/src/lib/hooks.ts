import { useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSettings } from '../state/SettingsContext';
import { createApi } from './api';
import type { ApiClient } from './types';

/**
 * Custom hook that provides an API client with automatic authentication
 * Uses Clerk JWT if available, otherwise falls back to manual token
 */
export function useApiClient() {
  const { apiBaseUrl, authToken } = useSettings();
  const { getToken } = useAuth();
  
  return useMemo(() => {
    return {
      async getClient(): Promise<ApiClient> {
        const clerkToken = await getToken();
        const token = clerkToken || authToken;
        return createApi(apiBaseUrl, token) as unknown as ApiClient;
      }
    };
  }, [apiBaseUrl, authToken, getToken]);
}