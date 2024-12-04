import useSWR from "swr";
import useSWRImmutable from "swr/immutable";

export const getFetch = (url: string, token: string) => {
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }).then(res => res.json());
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

export const useFetchList = (id: string | null, token: string | null) => useSWRImmutable(token && id ? [`${process.env.NEXT_PUBLIC_API}/api/list${id ? "/" + id : ""}`, token] : null, ([url, token]) => getFetch(url, token))
export const useFetchTodo = (list_id: string | null, token: string | null) => useSWR(token && list_id ? [`${process.env.NEXT_PUBLIC_API}/api/list${list_id ? "/" + list_id + "/todo" : ""}`, token] : null, ([url, token]) => getFetch(url, token))
export const useFetchCompletedTodo = (list_id: string | null, page: number = 1, token: string | null) => useSWR(token && list_id ? [`${process.env.NEXT_PUBLIC_API}/api/list${list_id ? "/" + list_id + "/todo?completionOnly=true" : ""}`, token] : null, ([url, token]) => getFetch(url, token))
export const useFetchPostList = (body: Object, token: string | null) => postFetch(`${process.env.NEXT_PUBLIC_API}/api/list`, token, body)
export const useFetchSummary = (token: string | null) => useSWR(token ? [`${process.env.NEXT_PUBLIC_API}/api/summary`, token] : null, ([url, token]) => getFetch(url, token))
export const useFetchActivity = (token: string | null, year: string) => useSWR(token && year ? [`${process.env.NEXT_PUBLIC_API}/api/summary/${year}`, token] : null, ([url, token]) => getFetch(url, token))
export const useFetchTimeline = (token: string | null) => useSWR(token ? [`${process.env.NEXT_PUBLIC_API}/api/timeline?page=1&limit=10`, token] : null, ([url, token]) => getFetch(url, token))