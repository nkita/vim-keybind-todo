import { useCallback, useEffect, useRef, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthState, AuthToken, createAuthToken } from "@/types/todo-context";

interface UseOptimizedAuthOptions {
  readonly retryCount?: number;
  readonly retryDelay?: number;
  readonly enableAutoRefresh?: boolean;
}

interface UseOptimizedAuthReturn {
  readonly auth: AuthState;
  readonly refreshAuth: () => Promise<void>;
  readonly isStale: boolean;
}

const DEFAULT_OPTIONS: Required<UseOptimizedAuthOptions> = {
  retryCount: 3,
  retryDelay: 1000,
  enableAutoRefresh: true,
};

export const useOptimizedAuth = (
  options: UseOptimizedAuthOptions = {}
): UseOptimizedAuthReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { getAccessTokenSilently, user, isLoading: auth0Loading } = useAuth0();
  
  // Ref-based state to avoid unnecessary re-renders
  const authStateRef = useRef<AuthState>({ type: 'unauthenticated' });
  const lastRefreshRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  
  // Token freshness check (15 minutes)
  const TOKEN_FRESH_DURATION = 15 * 60 * 1000;
  
  const isStale = useMemo(() => {
    return Date.now() - lastRefreshRef.current > TOKEN_FRESH_DURATION;
  }, []);

  // Optimized token refresh with exponential backoff
  const refreshAuth = useCallback(async (): Promise<void> => {
    if (!user || auth0Loading) {
      authStateRef.current = { type: 'unauthenticated' };
      return;
    }

    authStateRef.current = { type: 'authenticating' };

    try {
      const token = await getAccessTokenSilently({
        cacheMode: 'off', // Force fresh token
        timeoutInSeconds: 10,
      });
      
      const authToken = createAuthToken(token);
      authStateRef.current = { 
        type: 'authenticated', 
        token: authToken 
      };
      
      lastRefreshRef.current = Date.now();
      retryCountRef.current = 0; // Reset retry count on success
      
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '認証に失敗しました';
        
      authStateRef.current = { 
        type: 'error', 
        error: errorMessage 
      };
      
      // Exponential backoff retry
      if (retryCountRef.current < config.retryCount) {
        retryCountRef.current++;
        const delay = config.retryDelay * Math.pow(2, retryCountRef.current - 1);
        
        setTimeout(() => {
          refreshAuth();
        }, delay);
      }
    }
  }, [user, auth0Loading, getAccessTokenSilently, config.retryCount, config.retryDelay]);

  // Initial authentication
  useEffect(() => {
    if (!auth0Loading) {
      refreshAuth();
    }
  }, [auth0Loading, refreshAuth]);

  // Auto-refresh when token becomes stale
  useEffect(() => {
    if (!config.enableAutoRefresh) return;
    
    const interval = setInterval(() => {
      if (isStale && authStateRef.current.type === 'authenticated') {
        refreshAuth();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isStale, refreshAuth, config.enableAutoRefresh]);

  return {
    auth: authStateRef.current,
    refreshAuth,
    isStale,
  };
};