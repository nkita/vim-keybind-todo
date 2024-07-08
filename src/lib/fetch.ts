import useSWR from "swr";

const getFetch = (url: string, token: string) => {
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    }).then(res => res.json());
}

const postFetch = (url: string, token: string, body: Object) => {
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
export const useFetchPostList = (id: string, body: Object, token: string) => useSWR(token ? [`${process.env.NEXT_PUBLIC_API}/api/list${id ? "/" + id : ""}`, body, token] : null, ([url, body, token]) => postFetch(url, token, body))

