"use client"
import { FC, PropsWithChildren, useState, useEffect } from "react";
import { createContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getFetch, postFetch, useFetchList } from "@/lib/fetch";
import { mutate } from "swr";

type TodoConfigProps = {
    list: string | null
    token: string | null
    isLoading: boolean
    isLogin: boolean
    error: string | undefined
}
const defaultValue = { list: null, token: null, isLoading: true, isLogin: false, error: undefined }

export const TodoContext = createContext<TodoConfigProps>(defaultValue)

export const TodoProvider: FC<PropsWithChildren> = ({ children }) => {
    const { getAccessTokenSilently, user, isLoading } = useAuth0();
    const [config, setConfig] = useState<TodoConfigProps>(defaultValue)

    useEffect(() => {
        async function getToken() {
            try {
                const token = await getAccessTokenSilently()
                setConfig(prev => ({ ...prev, token: token, isLoading: !!token, isLogin: !!token, error: undefined }))
            } catch (e) {
                setConfig(prev => ({ ...prev, isLoading: false, error: "認証に失敗しました。ログインし直すか、時間をおいてから再度お試しください。" }))
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
            const getList = async (url: string, token: string) => await getFetch<any[]>(url, config.token)
            const u = `${process.env.NEXT_PUBLIC_API}/api/list`
            getList(u, config.token).then(l => {
                if (l === null) {
                    postFetch(u, config.token, { name: "first list" })
                        .then(_ => {
                            mutate(u)
                            setConfig(prev => ({ ...prev, error: undefined }))
                        })
                        .catch(e => { setConfig(prev => ({ ...prev, error: "リストの作成に失敗しました" })) })
                } else if (l && l.length > 0) {
                    setConfig(prev => ({ ...prev, list: l[0].id, isLoading: false, error: undefined }))
                }
            }).catch(e => {
                setConfig(prev => ({ ...prev, isLoading: false, error: "リストの取得に失敗しました。" }))
            })
        }
    }, [config])


    return (
        <TodoContext.Provider value={config}>
            {children}
        </TodoContext.Provider>
    )
}