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
import { useLocalStorage } from "@/hook/useLocalStrorage";
import { useOptimizedAuth } from "@/hook/useOptimizedAuth";
import { useOptimizedLists } from "@/hook/useOptimizedLists";
import { 
  TodoContextValue, 
  ListId, 
  AppMode, 
  isListId 
} from "@/types/todo-context";

// Performance monitoring
interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

// Provider options for customization
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

// Create context with null check
const TodoContext = createContext<TodoContextValue | null>(null);

export const OptimizedTodoProvider: FC<PropsWithChildren<{ options?: TodoProviderOptions }>> = ({ 
  children, 
  options = {} 
}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // Performance monitoring
  const performanceRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });
  
  // State management with optimized storage
  const [currentListId, setCurrentListId] = useLocalStorage<ListId | null>("current_list_id", null);
  const [mode, setMode] = useState<AppMode | null>(null);
  
  // Core hooks with optimization
  const { auth, refreshAuth, isStale } = useOptimizedAuth({
    retryCount: 3,
    retryDelay: 1000,
    enableAutoRefresh: true,
  });
  
  const authToken = auth.type === 'authenticated' ? auth.token : null;
  
  const { 
    lists, 
    actions: listActions, 
    computed: listComputed 
  } = useOptimizedLists(authToken, {
    enableOptimisticUpdates: config.enableOptimisticUpdates,
    cacheInvalidationStrategy: 'background',
    backgroundRefreshInterval: 30000,
  });

  // Intelligent list selection with validation
  const resolvedCurrentListId = useMemo(() => {
    if (lists.status !== 'success') return null;
    
    const availableLists = lists.data;
    if (availableLists.length === 0) return null;
    
    // Validate stored list ID
    if (currentListId && listComputed.findById(currentListId)) {
      return currentListId;
    }
    
    // Auto-select first list if enabled
    if (config.autoSelectFirstList && availableLists.length > 0) {
      const firstListId = availableLists[0].id;
      setCurrentListId(firstListId);
      return firstListId;
    }
    
    return null;
  }, [lists, currentListId, listComputed, config.autoSelectFirstList, setCurrentListId]);

  // Optimized action handlers with error boundaries
  const handleSetListId = useCallback((id: ListId | null) => {
    try {
      if (id !== null && !isListId(id)) {
        throw new Error(`Invalid list ID: ${id}`);
      }
      setCurrentListId(id);
    } catch (error) {
      console.error('Failed to set list ID:', error);
    }
  }, [setCurrentListId]);

  const handleSetMode = useCallback((newMode: AppMode | null) => {
    try {
      if (newMode !== null && typeof newMode !== 'string') {
        throw new Error(`Invalid mode: ${newMode}`);
      }
      setMode(newMode);
    } catch (error) {
      console.error('Failed to set mode:', error);
    }
  }, []);

  // Enhanced action creators with error handling
  const enhancedActions = useMemo(() => ({
    setListId: handleSetListId,
    setMode: handleSetMode,
    refreshLists: listActions.refresh,
    createList: async (name: string): Promise<ListId> => {
      try {
        const newListId = await listActions.create(name);
        if (config.autoSelectFirstList && !resolvedCurrentListId) {
          handleSetListId(newListId);
        }
        return newListId;
      } catch (error) {
        console.error('Failed to create list:', error);
        throw error;
      }
    },
    updateList: listActions.update,
    deleteList: async (id: ListId): Promise<void> => {
      try {
        await listActions.remove(id);
        // If deleted list was current, clear selection
        if (resolvedCurrentListId === id) {
          handleSetListId(null);
        }
      } catch (error) {
        console.error('Failed to delete list:', error);
        throw error;
      }
    },
  }), [
    handleSetListId,
    handleSetMode,
    listActions,
    config.autoSelectFirstList,
    resolvedCurrentListId
  ]);

  // Computed values with comprehensive state
  const computed = useMemo(() => {
    const isLoading = auth.type === 'authenticating' || lists.status === 'loading';
    const isAuthenticated = auth.type === 'authenticated';
    const hasLists = lists.status === 'success' && lists.data.length > 0;
    const currentListName = resolvedCurrentListId 
      ? listComputed.findById(resolvedCurrentListId)?.name || null
      : null;
    
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
    };
  }, [auth, lists, resolvedCurrentListId, listComputed]);

  // Context value with stable reference
  const contextValue = useMemo<TodoContextValue>(() => ({
    currentList: resolvedCurrentListId,
    lists,
    auth,
    mode,
    actions: enhancedActions,
    computed,
  }), [resolvedCurrentListId, lists, auth, mode, enhancedActions, computed]);

  // Performance monitoring in development
  useEffect(() => {
    if (!config.enablePerformanceMonitoring) return;
    
    const now = performance.now();
    const metrics = performanceRef.current;
    
    metrics.renderCount++;
    const renderTime = now - metrics.lastRenderTime;
    metrics.averageRenderTime = (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;
    metrics.lastRenderTime = now;
    
    if (metrics.renderCount % 10 === 0) {
      console.log(`TodoProvider Performance: ${metrics.renderCount} renders, avg: ${metrics.averageRenderTime.toFixed(2)}ms`);
    }
  });

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

// Optimized hook with error boundary
export const useOptimizedTodoContext = (): TodoContextValue => {
  const context = React.useContext(TodoContext);
  
  if (!context) {
    throw new Error(
      'useOptimizedTodoContext must be used within an OptimizedTodoProvider. ' +
      'Make sure to wrap your component tree with <OptimizedTodoProvider>.'
    );
  }
  
  return context;
};

// Legacy compatibility
export { TodoContext };
export type { TodoContextValue };
export { OptimizedTodoProvider as TodoProvider };