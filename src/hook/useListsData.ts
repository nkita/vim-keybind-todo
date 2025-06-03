import { useCallback } from "react";
import useSWR from "swr";
import { getFetch, postFetch } from "@/lib/fetch";
import { mutate } from "swr";
import { ListItem } from "@/types/todo-context";

interface UseListsDataReturn {
    lists: ListItem[] | null;
    isLoading: boolean;
    error: string | undefined;
    createInitialList: () => Promise<void>;
    refetchLists: () => Promise<void>;
}

const BASE_URL = `${process.env.NEXT_PUBLIC_API}/api/list`;

export const useListsData = (token: string | null): UseListsDataReturn => {
    const { 
        data: lists, 
        error: swrError, 
        isLoading 
    } = useSWR(
        token ? [BASE_URL, token] : null,
        ([url, authToken]) => getFetch<ListItem[]>(url, authToken),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            errorRetryCount: 3,
        }
    );

    const createInitialList = useCallback(async () => {
        if (!token) {
            throw new Error("認証トークンがありません");
        }

        try {
            await postFetch(BASE_URL, token, { name: "first list" });
            await mutate([BASE_URL, token]);
        } catch (error) {
            console.error('Failed to create initial list:', error);
            throw new Error("リストの作成に失敗しました");
        }
    }, [token]);

    const refetchLists = useCallback(async () => {
        if (token) {
            await mutate([BASE_URL, token]);
        }
    }, [token]);

    // エラーハンドリングの改善
    const error = swrError ? "リストの取得に失敗しました。" : undefined;

    return {
        lists: lists || null,
        isLoading,
        error,
        createInitialList,
        refetchLists,
    };
};