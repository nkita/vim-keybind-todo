import { useCallback, useMemo, useRef, useEffect } from "react";
import useSWR from "swr";
import { mutate } from "swr";
import { getFetch, postFetch, deleteFetch } from "@/lib/fetch";
import { 
  ListCollection, 
  ListItem, 
  ListId, 
  AuthToken, 
  AsyncResult,
  createListId 
} from "@/types/todo-context";

interface UseOptimizedListsOptions {
  readonly enableOptimisticUpdates?: boolean;
  readonly cacheInvalidationStrategy?: 'immediate' | 'background' | 'none';
  readonly backgroundRefreshInterval?: number;
}

interface UseOptimizedListsReturn {
  readonly lists: AsyncResult<ListCollection>;
  readonly actions: {
    readonly create: (name: string) => Promise<ListId>;
    readonly update: (id: ListId, name: string) => Promise<void>;
    readonly remove: (id: ListId) => Promise<void>;
    readonly refresh: () => Promise<void>;
  };
  readonly computed: {
    readonly isEmpty: boolean;
    readonly count: number;
    readonly findById: (id: ListId) => ListItem | undefined;
    readonly findByName: (name: string) => ListItem | undefined;
  };
}

const DEFAULT_OPTIONS: Required<UseOptimizedListsOptions> = {
  enableOptimisticUpdates: true,
  cacheInvalidationStrategy: 'background',
  backgroundRefreshInterval: 30000, // 30 seconds
};

const BASE_URL = `${process.env.NEXT_PUBLIC_API}/api/list`;

export const useOptimizedLists = (
  token: AuthToken | null,
  options: UseOptimizedListsOptions = {}
): UseOptimizedListsReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const optimisticUpdatesRef = useRef<Map<string, 'creating' | 'updating' | 'deleting'>>(new Map());
  
  // SWR with advanced configuration
  const swrKey = token ? [BASE_URL, token] : null;
  const { 
    data: rawLists, 
    error, 
    isLoading,
    mutate: swrMutate 
  } = useSWR(
    swrKey,
    ([url, authToken]) => getFetch<ListItem[]>(url, authToken),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: config.backgroundRefreshInterval,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      dedupingInterval: 5000,
      // Custom compare function for deep equality
      compare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    }
  );

  // Memoized lists result with optimistic updates
  const lists: AsyncResult<ListCollection> = useMemo(() => {
    if (error) {
      return { 
        status: 'error', 
        error: error instanceof Error ? error : new Error('リストの取得に失敗しました') 
      };
    }
    
    if (isLoading && !rawLists) {
      return { status: 'loading' };
    }
    
    if (!rawLists) {
      return { status: 'idle' };
    }

    // Apply optimistic updates
    let processedLists = [...rawLists];
    
    optimisticUpdatesRef.current.forEach((operation, id) => {
      switch (operation) {
        case 'deleting':
          processedLists = processedLists.filter(list => list.id !== id);
          break;
        case 'creating':
          // Creating items are added during the action
          break;
        case 'updating':
          // Updates are applied during the action
          break;
      }
    });

    return { 
      status: 'success', 
      data: processedLists as ListCollection 
    };
  }, [rawLists, error, isLoading]);

  // Optimized cache key generator
  const getCacheKey = useCallback((authToken: AuthToken): [string, AuthToken] => {
    return [BASE_URL, authToken];
  }, []);

  // Background refresh with cache invalidation
  const refresh = useCallback(async (): Promise<void> => {
    if (!token) return;
    
    try {
      await swrMutate();
    } catch (error) {
      console.error('Failed to refresh lists:', error);
      throw error;
    }
  }, [token, swrMutate]);

  // Optimistic create with rollback capability
  const create = useCallback(async (name: string): Promise<ListId> => {
    if (!token) throw new Error('認証が必要です');
    
    const tempId = `temp_${Date.now()}` as ListId;
    const tempList: ListItem = {
      id: tempId,
      name,
      createdAt: new Date().toISOString(),
    };

    try {
      if (config.enableOptimisticUpdates) {
        optimisticUpdatesRef.current.set(tempId, 'creating');
        
        // Optimistic update
        await swrMutate(
          (current: ListItem[] = []) => [...current, tempList],
          false
        );
      }

      const response = await postFetch(BASE_URL, token, { name });
      const newListId = createListId(response.id);
      
      // Replace temp item with real item
      await swrMutate();
      optimisticUpdatesRef.current.delete(tempId);
      
      return newListId;
      
    } catch (error) {
      // Rollback optimistic update
      optimisticUpdatesRef.current.delete(tempId);
      await swrMutate();
      
      throw new Error('リストの作成に失敗しました');
    }
  }, [token, swrMutate, config.enableOptimisticUpdates]);

  // Optimistic update with rollback
  const update = useCallback(async (id: ListId, name: string): Promise<void> => {
    if (!token) throw new Error('認証が必要です');
    
    const originalList = rawLists?.find(list => list.id === id);
    if (!originalList) throw new Error('リストが見つかりません');

    try {
      if (config.enableOptimisticUpdates) {
        optimisticUpdatesRef.current.set(id, 'updating');
        
        // Optimistic update
        await swrMutate(
          (current: ListItem[] = []) => 
            current.map(list => 
              list.id === id 
                ? { ...list, name, updatedAt: new Date().toISOString() }
                : list
            ),
          false
        );
      }

      await postFetch(`${BASE_URL}/${id}`, token, { name });
      await swrMutate();
      optimisticUpdatesRef.current.delete(id);
      
    } catch (error) {
      // Rollback optimistic update
      optimisticUpdatesRef.current.delete(id);
      await swrMutate();
      
      throw new Error('リストの更新に失敗しました');
    }
  }, [token, rawLists, swrMutate, config.enableOptimisticUpdates]);

  // Optimistic delete with rollback
  const remove = useCallback(async (id: ListId): Promise<void> => {
    if (!token) throw new Error('認証が必要です');
    
    const originalList = rawLists?.find(list => list.id === id);
    if (!originalList) throw new Error('リストが見つかりません');

    try {
      if (config.enableOptimisticUpdates) {
        optimisticUpdatesRef.current.set(id, 'deleting');
        
        // Optimistic update
        await swrMutate(
          (current: ListItem[] = []) => current.filter(list => list.id !== id),
          false
        );
      }

      await deleteFetch(`${BASE_URL}/${id}`, token);
      await swrMutate();
      optimisticUpdatesRef.current.delete(id);
      
    } catch (error) {
      // Rollback optimistic update
      optimisticUpdatesRef.current.delete(id);
      await swrMutate();
      
      throw new Error('リストの削除に失敗しました');
    }
  }, [token, rawLists, swrMutate, config.enableOptimisticUpdates]);

  // Computed values with memoization
  const computed = useMemo(() => {
    const listsData = lists.status === 'success' ? lists.data : [];
    
    return {
      isEmpty: listsData.length === 0,
      count: listsData.length,
      findById: (id: ListId) => listsData.find(list => list.id === id),
      findByName: (name: string) => listsData.find(list => list.name === name),
    };
  }, [lists]);

  // Cleanup optimistic updates on unmount
  useEffect(() => {
    // refの値をeffect内でコピー
    const currentOptimisticUpdates = optimisticUpdatesRef.current;
    
    return () => {
      // クリーンアップ関数ではコピーした値を使用
      if (currentOptimisticUpdates) {
        // クリーンアップ処理
      }
    };
  }, []);

  return {
    lists,
    actions: {
      create,
      update,
      remove,
      refresh,
    },
    computed,
  };
};