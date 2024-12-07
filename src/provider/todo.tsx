"use client"
import { FC, PropsWithChildren, useState, useEffect } from "react";
import { createContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getFetch, postFetch, useFetchList } from "@/lib/fetch";
import { mutate } from "swr";

type TodoConfigProps = {
    list: string | null
    token: string | null
}
const defaultValue = { list: null, token: null }

export const TodoContext = createContext<TodoConfigProps>(defaultValue)

export const TodoProvider: FC<PropsWithChildren> = ({ children }) => {
    const { getAccessTokenSilently, user, isLoading } = useAuth0();
    const [config, setConfig] = useState<TodoConfigProps>(defaultValue)
    const [list, setList] = useState(null)
    const [token, setToken] = useState("")
    useEffect(() => {
        async function getToken() {
            try {
                const token = await getAccessTokenSilently()
                if (token) {
                    setToken(token)
                }
            } catch (e) {
            }
        }
        if (!isLoading && user) getToken()
    }, [getAccessTokenSilently, user, isLoading])

    useEffect(() => {
        if (token) {
            try {
                const getList = async (url: string, token: string) => await getFetch(url, token)
                const u = `${process.env.NEXT_PUBLIC_API}/api/list`
                getList(u, token).then(l => {
                    if (l === null) {
                        postFetch(u, token, { name: "first list" }).then(_ => mutate(u)).catch(e => { console.log(e) })
                        mutate(u)
                    } else if (l && l.length > 0) {
                        setList(l[0].id)
                    }
                })
            } catch (e) {
                console.error(e)
            }
        }
    }, [token])

    useEffect(() => {
        setConfig({
            list: list,
            token: token
        })
    }, [list, token])

    return (
        <TodoContext.Provider value={config}>
            {children}
        </TodoContext.Provider>
    )
}