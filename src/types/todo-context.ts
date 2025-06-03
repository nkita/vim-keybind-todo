// 完全な型安全性を保証する高度な型定義

// Brand types for ID validation
declare const __listId: unique symbol;
declare const __token: unique symbol;
declare const __mode: unique symbol;

export type ListId = string & { readonly [__listId]: never };
export type AuthToken = string & { readonly [__token]: never };
export type AppMode = string & { readonly [__mode]: never };

// Utility types for state management
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type AsyncResult<T, E = Error> = 
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E }
  | { status: 'idle' };

// List item with strict typing
export interface ListItem {
  readonly id: ListId;
  readonly name: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

// Immutable list collection
export type ListCollection = readonly ListItem[];

// Authentication state with discriminated unions
export type AuthState = 
  | { readonly type: 'unauthenticated' }
  | { readonly type: 'authenticating' }
  | { readonly type: 'authenticated'; readonly token: AuthToken }
  | { readonly type: 'error'; readonly error: string };

// Context value with strict typing and performance hints
export interface TodoContextValue {
  // Core state
  readonly currentList: ListId | null;
  readonly lists: AsyncResult<ListCollection>;
  readonly auth: AuthState;
  readonly mode: AppMode | null;
  
  // Actions with optimal signatures
  readonly actions: {
    readonly setListId: (id: ListId | null) => void;
    readonly setMode: (mode: AppMode | null) => void;
    readonly refreshLists: () => Promise<void>;
    readonly createList: (name: string) => Promise<ListId>;
    readonly updateList: (id: ListId, name: string) => Promise<void>;
    readonly deleteList: (id: ListId) => Promise<void>;
  };
  
  // Computed values for performance
  readonly computed: {
    readonly isLoading: boolean;
    readonly isAuthenticated: boolean;
    readonly hasLists: boolean;
    readonly currentListName: string | null;
    readonly error: string | null;
  };
}

// Type guards for runtime safety
export const isListId = (value: unknown): value is ListId => 
  typeof value === 'string' && value.length > 0;

export const isAuthToken = (value: unknown): value is AuthToken => 
  typeof value === 'string' && value.length > 0;

export const isAppMode = (value: unknown): value is AppMode => 
  typeof value === 'string';

// Factory functions for type safety
export const createListId = (id: string): ListId => {
  if (!isListId(id)) throw new Error(`Invalid list ID: ${id}`);
  return id as ListId;
};

export const createAuthToken = (token: string): AuthToken => {
  if (!isAuthToken(token)) throw new Error('Invalid auth token');
  return token as AuthToken;
};

export const createAppMode = (mode: string): AppMode => {
  if (!isAppMode(mode)) throw new Error(`Invalid app mode: ${mode}`);
  return mode as AppMode;
};