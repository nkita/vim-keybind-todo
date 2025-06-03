"use client"
import { FC, PropsWithChildren, useState, useEffect, useRef } from "react";
import { createContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getFetch, postFetch, useFetchList } from "@/lib/fetch";
import { mutate } from "swr";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import useSWR from "swr";

type TodoConfigProps = {
    list: string | null
    lists: { id: string, name: string }[] | null
    token: string | null
    isLoading: boolean
    isLogin: boolean
    error: string | undefined
    mode: string | null
    setListId: (id: string | null) => void
    setMode: (mode: string | null) => void
}
const defaultValue = { list: null, lists: [], token: null, isLoading: true, isLogin: false, error: undefined, mode: null, setListId: () => { }, setMode: () => { } }


export const TodoContext = createContext<TodoConfigProps>(defaultValue)

export const TodoProvider: FC<PropsWithChildren> = ({ children }) => {
    const { getAccessTokenSilently, user, isLoading } = useAuth0();
    const [config, setConfig] = useState<TodoConfigProps>(defaultValue)
    const [listId, setListId] = useLocalStorage<string | null>("list_id", null)
    const [mode, setMode] = useState<string | null>(null)
    
    const baseUrl = `${process.env.NEXT_PUBLIC_API}/api/list`
    const { data: fetchedLists, error: swrError } = useSWR(
        config.token ? [baseUrl, config.token] : null,
        ([url, token]) => getFetch<{ id: string, name: string }[]>(url, token)
    )

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

    const prevListsRef = useRef<{ id: string, name: string }[] | null>(null)
    
    // リスト一覧の取得と初期設定
    useEffect(() => {
        if (fetchedLists && fetchedLists.length > 0) {
            // 前回のリストと比較して変更があった場合のみ処理
            if (JSON.stringify(prevListsRef.current) !== JSON.stringify(fetchedLists)) {
                prevListsRef.current = fetchedLists
                
                let _id = fetchedLists[0].id
                if (listId && fetchedLists.find(l => l.id === listId)) _id = listId
                
                setListId(_id)
                setConfig(prev => ({ ...prev, list: _id, lists: fetchedLists, isLoading: false, error: undefined }))
            }
        } else if (fetchedLists !== undefined && fetchedLists.length === 0 && config.token) {
            // リストがない場合は初期リストを作成
            postFetch(baseUrl, config.token, { name: "first list" })
                .then(_ => {
                    mutate([baseUrl, config.token])
                    setConfig(prev => ({ ...prev, error: undefined }))
                })
                .catch(e => { setConfig(prev => ({ ...prev, error: "リストの作成に失敗しました" })) })
        }
        
        if (swrError) {
            setConfig(prev => ({ ...prev, isLoading: false, error: "リストの取得に失敗しました。" }))
        }
    }, [fetchedLists, swrError])

    const handleSetListId = (id: string | null) => {
        console.log("setListId kokokita?" )
        setListId(id)
        setConfig(prev => ({ ...prev, list: id }))
    }

    const handleSetMode = (mode: string | null) => {
        setMode(mode)
        setConfig(prev => ({ ...prev, mode: mode }))
    }

    return (
        <TodoContext.Provider value={{ ...config, mode: mode, setListId: handleSetListId, setMode: handleSetMode }}>
            {children}
        </TodoContext.Provider>
    )
}