"use client"
import React, { 
  FC, 
  PropsWithChildren, 
  createContext, 
  useCallback, 
  useMemo, 
  useState,
  useEffect,
  useRef
} from "react";
import { useOfflineStorage } from "@/hook/useOfflineStorage";
import { useOptimizedAuth } from "@/hook/useOptimizedAuth";
import { useOptimizedLists } from "@/hook/useOptimizedLists";
import { 
  TodoContextValue, 
  ListId, 
  AppMode,
  ListItem,
  AsyncResult,
  ListCollection
} from "@/types/todo-context";

interface TodoProviderOptions {
  readonly enablePerformanceMonitoring?: boolean;
  readonly enableOptimisticUpdates?: boolean;
  readonly autoSelectFirstList?: boolean;
  readonly persistMode?: boolean;
}

const DEFAULT_OPTIONS: Required<TodoProviderOptions> = {
  enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
  enableOptimisticUpdates: true,
  autoSelectFirstList: true,
  persistMode: false,
};

const TodoContext = createContext<TodoContextValue | null>(null);

export const OfflineTodoProvider: FC<PropsWithChildren<{ options?: TodoProviderOptions }>> = ({ 
  children, 
  options = {} 
}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // State management
  const [mode, setMode] = useState<AppMode | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [onlineCurrentListId, setOnlineCurrentListId] = useState<ListId | null>(null);
  
  // Core hooks
  const { auth, refreshAuth, isStale } = useOptimizedAuth({
    retryCount: 3,
    retryDelay: 1000,
    enableAutoRefresh: true,
  });
  
  const authToken = auth.type === 'authenticated' ? auth.token : null;
  
  // Online lists management
  const { 
    lists: onlineLists, 
    actions: onlineListActions, 
    computed: onlineListComputed 
  } = useOptimizedLists(authToken, {
    enableOptimisticUpdates: config.enableOptimisticUpdates,
    cacheInvalidationStrategy: 'background',
    backgroundRefreshInterval: 30000,
  });

  // Offline storage hook
  const {
    currentListId: offlineCurrentListId,
    setCurrentListId: setOfflineCurrentListId,
    lists: offlineLists,
    createList: createOfflineList,
    updateList: updateOfflineList,
    removeList: removeOfflineList,
    isInitialized: offlineInitialized
  } = useOfflineStorage();

  // Determine which data source to use
  // オンラインでログインしている場合はオンラインモード、それ以外はオフラインモード
  const useOfflineMode = !navigator.onLine || auth.type !== 'authenticated';

  // Combined current list ID
  const currentListId = useOfflineMode ? offlineCurrentListId : onlineCurrentListId;

  // Combined lists
  const lists: AsyncResult<ListCollection> = useMemo(() => {
    if (useOfflineMode) {
      if (!offlineInitialized) {
        return { status: 'loading' };
      }
      return { 
        status: 'success', 
        data: offlineLists as ListCollection 
      };
    }
    return onlineLists;
  }, [useOfflineMode, offlineInitialized, offlineLists, onlineLists]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // TODO: Sync offline changes when coming online
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // オンライン時に初回リストを自動選択
  useEffect(() => {
    if (!useOfflineMode && 
        onlineLists.status === 'success' && 
        onlineLists.data.length > 0 && 
        !onlineCurrentListId) {
      setOnlineCurrentListId(onlineLists.data[0].id);
    }
  }, [useOfflineMode, onlineLists, onlineCurrentListId]);

  // Action handlers
  const handleSetListId = useCallback((id: ListId | null) => {
    if (useOfflineMode) {
      if (id !== null) {
        setOfflineCurrentListId(id);
      }
    } else {
      setOnlineCurrentListId(id);
    }
  }, [useOfflineMode, setOfflineCurrentListId]);

  const handleSetMode = useCallback((newMode: AppMode | null) => {
    setMode(newMode);
  }, []);

  // Enhanced actions for offline/online handling
  const enhancedActions = useMemo(() => ({
    setListId: handleSetListId,
    setMode: handleSetMode,
    refreshLists: useOfflineMode ? async () => {} : onlineListActions.refresh,
    createList: async (name: string): Promise<ListId> => {
      if (useOfflineMode) {
        const newListId = createOfflineList(name);
        return newListId as ListId;
      } else {
        return await onlineListActions.create(name);
      }
    },
    updateList: async (id: ListId, name: string): Promise<void> => {
      if (useOfflineMode) {
        updateOfflineList(id, name);
      } else {
        await onlineListActions.update(id, name);
      }
    },
    deleteList: async (id: ListId): Promise<void> => {
      if (useOfflineMode) {
        removeOfflineList(id);
      } else {
        await onlineListActions.remove(id);
      }
    },
  }), [
    handleSetListId,
    handleSetMode,
    useOfflineMode,
    onlineListActions,
    createOfflineList,
    updateOfflineList,
    removeOfflineList
  ]);

  // Computed values
  const computed = useMemo(() => {
    const isLoading = auth.type === 'authenticating' || lists.status === 'loading';
    const isAuthenticated = auth.type === 'authenticated';
    const hasLists = lists.status === 'success' && lists.data.length > 0;
    
    const findListById = (id: ListId | null) => {
      if (!id || lists.status !== 'success') return null;
      return lists.data.find(list => list.id === id);
    };
    
    const currentListName = currentListId ? findListById(currentListId)?.name || null : null;
    
    // Aggregate errors
    const errors: string[] = [];
    if (auth.type === 'error') errors.push(auth.error);
    if (lists.status === 'error') errors.push(lists.error.message);
    
    return {
      isLoading,
      isAuthenticated,
      hasLists,
      currentListName,
      error: errors.length > 0 ? errors.join('; ') : null,
      isOffline: useOfflineMode,
    };
  }, [auth, lists, currentListId, useOfflineMode]);

  // Context value
  const contextValue = useMemo<TodoContextValue>(() => ({
    currentList: currentListId,
    lists,
    auth,
    mode,
    actions: enhancedActions,
    computed,
  }), [currentListId, lists, auth, mode, enhancedActions, computed]);

  // Auto-refresh stale authentication
  useEffect(() => {
    if (isStale && auth.type === 'authenticated') {
      refreshAuth();
    }
  }, [isStale, auth.type, refreshAuth]);

  return (
    <TodoContext.Provider value={contextValue}>
      {children}
    </TodoContext.Provider>
  );
};

// Hook with error boundary
export const useOfflineTodoContext = (): TodoContextValue => {
  const context = React.useContext(TodoContext);
  
  if (!context) {
    throw new Error(
      'useOfflineTodoContext must be used within an OfflineTodoProvider. ' +
      'Make sure to wrap your component tree with <OfflineTodoProvider>.'
    );
  }
  
  return context;
};

export { TodoContext };
export type { TodoContextValue };