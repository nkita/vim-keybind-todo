"use client"
import { FC, PropsWithChildren, createContext, useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import { useAuthToken } from "@/hook/useAuthToken";
import { useListsData } from "@/hook/useListsData";

// 型定義の改善
export interface ListItem {
    id: string;
    name: string;
}

export interface TodoContextValue {
    list: string | null;
    lists: ListItem[] | null;
    token: string | null;
    isLoading: boolean;
    isLogin: boolean;
    error: string | undefined;
    mode: string | null;
    setListId: (id: string | null) => void;
    setMode: (mode: string | null) => void;
}

// デフォルト値の改善
const createDefaultValue = (): TodoContextValue => ({
    list: null,
    lists: null,
    token: null,
    isLoading: true,
    isLogin: false,
    error: undefined,
    mode: null,
    setListId: () => {},
    setMode: () => {},
});

export const TodoContext = createContext<TodoContextValue>(createDefaultValue());

export const TodoProvider: FC<PropsWithChildren> = ({ children }) => {
    const [listId, setListId] = useLocalStorage<string | null>("list_id", null);
    const [mode, setMode] = useState<string | null>(null);
    
    // 認証関連のロジックを分離
    const { token, isLoading: authLoading, isLogin, error: authError } = useAuthToken();
    
    // リストデータ関連のロジックを分離
    const { 
        lists, 
        isLoading: listsLoading, 
        error: listsError,
        createInitialList 
    } = useListsData(token);

    // リストIDの設定ロジック
    const handleSetListId = useCallback((id: string | null) => {
        setListId(id);
    }, [setListId]);

    // モードの設定ロジック
    const handleSetMode = useCallback((newMode: string | null) => {
        setMode(newMode);
    }, [setMode]);

    // 現在選択されているリストIDの決定
    const currentListId = useMemo(() => {
        if (!lists || lists.length === 0) return null;
        
        // 保存されているlistIdが有効な場合はそれを使用
        if (listId && lists.find(l => l.id === listId)) {
            return listId;
        }
        
        // そうでなければ最初のリストを使用
        const firstListId = lists[0].id;
        if (firstListId !== listId) {
            handleSetListId(firstListId);
        }
        return firstListId;
    }, [lists, listId, handleSetListId]);

    // 全体のローディング状態
    const isLoading = authLoading || listsLoading;
    
    // エラーの統合
    const error = authError || listsError;

    // 空のリストの場合の初期リスト作成
    const handleEmptyLists = useCallback(async () => {
        if (lists !== null && lists.length === 0 && token && !isLoading) {
            try {
                await createInitialList();
            } catch (err) {
                console.error('Failed to create initial list:', err);
            }
        }
    }, [lists, token, isLoading, createInitialList]);

    // 空のリストの場合の処理
    useMemo(() => {
        handleEmptyLists();
    }, [handleEmptyLists]);

    // Context値の生成
    const contextValue = useMemo<TodoContextValue>(() => ({
        list: currentListId,
        lists: lists,
        token: token,
        isLoading: isLoading,
        isLogin: isLogin,
        error: error,
        mode: mode,
        setListId: handleSetListId,
        setMode: handleSetMode,
    }), [
        currentListId,
        lists,
        token,
        isLoading,
        isLogin,
        error,
        mode,
        handleSetListId,
        handleSetMode,
    ]);

    return (
        <TodoContext.Provider value={contextValue}>
            {children}
        </TodoContext.Provider>
    );
};