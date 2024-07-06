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
export const useFetchList = (id: string, token: string) => useSWR(token ? [`http://localhost:3001/api/list${id ? "/" + id : ""}`, token] : null, ([url, token]) => getFetch(url, token))
