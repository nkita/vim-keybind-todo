import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { useState, useEffect } from "react";
import { TodoProps } from "@/types";

export const getFetch = async <T>(url: string, token: string | null): Promise<T> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export const postFetch = (url: string, token: string | null, body: Object) => {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body)
    }).then(res => res.json());
}

export const useFetch = <T>(url: string, token: string) => {
    const [data, setData] = useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result: T = await getFetch<T>(url, token);
                setData(result);
            } catch (error: any) {
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (token && url) {
            fetchData();
        }
    }, [url, token]);

    return { data, isLoading, error };
};

export const useFetchList = (id: string | null, token: string | null) => useSWRImmutable(token && id ? [`${process.env.NEXT_PUBLIC_API}/api/list${id ? "/" + id : ""}`, token] : null, ([url, token]) => getFetch(url, token))
export const useFetchTodo = (list_id: string | null, token: string | null) => useSWRImmutable<TodoProps[]>((token && list_id) ? [`${process.env.NEXT_PUBLIC_API}/api/list${list_id ? "/" + list_id + "/todo" : ""}`, token] : null, ([url, token]) => getFetch(url, token as string | null))
export const useFetchCompletedTodo = (list_id: string | null, page: number = 1, token: string | null) => useSWR<TodoProps[]>(token && list_id ? [`${process.env.NEXT_PUBLIC_API}/api/list${list_id ? "/" + list_id + "/todo?completionOnly=true" : ""}`, token] : null, ([url, token]) => getFetch(url, token as string | null))
export const useFetchPostList = (body: Object, token: string | null) => postFetch(`${process.env.NEXT_PUBLIC_API}/api/list`, token, body)
