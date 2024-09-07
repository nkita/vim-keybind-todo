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

export const postFetch = (url: string, token: string, body: Object) => {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body)
    }).then(res => res.json());
}

export const useFetchList = (id: string, token: string) => useSWR(token ? [`${process.env.NEXT_PUBLIC_API}/api/list${id ? "/" + id : ""}`, token] : null, ([url, token]) => getFetch(url, token))
export const useFetchTodo = (list_id: string, token: string) => useSWR(token ? [`${process.env.NEXT_PUBLIC_API}/api/list${list_id ? "/" + list_id + "/todo" : ""}`, token] : null, ([url, token]) => getFetch(url, token))
export const useFetchPostList = (body: Object, token: string) => postFetch(`${process.env.NEXT_PUBLIC_API}/api/list`, token, body)