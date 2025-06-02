"use client"
import { FC, PropsWithChildren, useState, useEffect } from "react";
import { createContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getFetch, postFetch, useFetchList } from "@/lib/fetch";
import { mutate } from "swr";
import { useLocalStorage } from "@/hook/useLocalStrorage";

type TodoConfigProps = {
    list: string | null
    lists: { id: string, name: string }[] | null
    token: string | null
    isLoading: boolean
    isLogin: boolean
    error: string | undefined
    setListId: (id: string | null) => void
}
const defaultValue = { list: null, lists: [], token: null, isLoading: true, isLogin: false, error: undefined, setListId: () => { } }


export const TodoContext = createContext<TodoConfigProps>(defaultValue)

export const TodoProvider: FC<PropsWithChildren> = ({ children }) => {
    const { getAccessTokenSilently, user, isLoading } = useAuth0();
    const [config, setConfig] = useState<TodoConfigProps>(defaultValue)
    const [listId, setListId] = useLocalStorage<string | null>("list_id", null)

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
                    let _id = l[0].id
                    if (listId && l.find(l => l.id === listId)) _id = listId
                    setListId(_id)
                    setConfig(prev => ({ ...prev, list: _id, lists: l, isLoading: false, error: undefined }))
                }
            }).catch(e => {
                setConfig(prev => ({ ...prev, isLoading: false, error: "リストの取得に失敗しました。" }))
            })
        }
    }, [config.token, config.isLoading, listId, setListId])

    const handleSetListId = (id: string | null) => {
        console.log("setListId kokokita?" )
        setListId(id)
        setConfig(prev => ({ ...prev, list: id }))
    }

    return (
        <TodoContext.Provider value={{ ...config, setListId: handleSetListId }}>
            {children}
        </TodoContext.Provider>
    )
}