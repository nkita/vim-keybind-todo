"use client"
import { FC, PropsWithChildren, useState, useEffect } from "react";
import { createContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getFetch, postFetch, useFetchList } from "@/lib/fetch";
import { mutate } from "swr";
import { TodoProps } from "@/types";

type TodoConfigProps = {
    list: string | null
    token: string | null
    isLoading: boolean
    isLogin: boolean
}
const defaultValue = { list: null, token: null, isLoading: true, isLogin: false }

export const TodoContext = createContext<TodoConfigProps>(defaultValue)

export const TodoProvider: FC<PropsWithChildren> = ({ children }) => {
    const { getAccessTokenSilently, user, isLoading } = useAuth0();
    const [config, setConfig] = useState<TodoConfigProps>(defaultValue)

    useEffect(() => {
        async function getToken() {
            try {
                const token = await getAccessTokenSilently()
                setConfig(prev => ({ ...prev, token: token, isLoading: !!token, isLogin: !!token }))
            } catch (e) {
                setConfig(prev => ({ ...prev, isLoading: false }))
                console.error(e)
            }
        }
        if (!isLoading) {
            if (user) {
                getToken()
            } else {
                setConfig(prev => ({ ...prev, isLoading: false }))
            }
        }
    }, [getAccessTokenSilently, user, isLoading])

    useEffect(() => {
        if (config.token && config.isLoading) {
            try {
                const getList = async (url: string, token: string) => await getFetch<any[]>(url, config.token)
                const u = `${process.env.NEXT_PUBLIC_API}/api/list`
                getList(u, config.token).then(l => {
                    if (l === null) {
                        postFetch(u, config.token, { name: "first list" }).then(_ => mutate(u)).catch(e => { console.log(e) })
                    } else if (l && l.length > 0) {
                        setConfig(prev => ({ ...prev, list: l[0].id, isLoading: false }))
                    }
                })
            } catch (e) {
                console.error(e)
                setConfig(prev => ({ ...prev, isLoading: false }))
            }
        }
    }, [config])


    return (
        <TodoContext.Provider value={config}>
            {children}
        </TodoContext.Provider>
    )
}