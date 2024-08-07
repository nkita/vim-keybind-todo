'use client'

import { Todo } from "@/components/todo";
import { useState, useEffect, useCallback } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { Usage } from "@/components/usage";
import Header from "@/components/header";
import { mutate } from "swr";
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchList, useFetchTodo, postFetch } from "@/lib/fetch";
import { debounce } from "@/lib/utils";
import { todoFunc } from "@/lib/todo";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

export default function Home() {
  const { getAccessTokenSilently, user, isLoading: userLoading } = useAuth0();
  const [token, setToken] = useState("")
  const [currentListID, setCurrentListID] = useState("")
  const [todos, setTodos] = useState<TodoProps[]>([])
  const [todosLS, setTodosLS] = useLocalStorage<TodoProps[]>("todo-local-storage", [])
  const [prevTodos, setPrevTodos] = useState<TodoProps[]>([])
  const [isSave, setIsSave] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)
  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useState<Sort>(undefined)
  const [isHelp, setHelp] = useLocalStorage("todo_is_help", false)

  const [todosLoading, setTodosLoading] = useState(true)
  const [listLoading, setListLoading] = useState(true)
  const { data: list } = useFetchList("", token)
  const { data: fetch_todo } = useFetchTodo(currentListID, token)

  useEffect(() => {
    async function getToken() {
      try {
        const token = await getAccessTokenSilently()
        if (token) setToken(token)
      } catch (e) {
        setListLoading(false)
        setTodosLoading(false)
      }
    }
    return (() => { getToken() })
  }, [getAccessTokenSilently])

  useEffect(() => {
    try {
      if (token) {
        if (list === null) {
          const apiListURL = `${process.env.NEXT_PUBLIC_API}/api/list`
          postFetch(apiListURL, token, { name: "first list" })
          mutate(apiListURL)
          setListLoading(false)
        } else if (list && list.length > 0) {
          setCurrentListID(list[0].id)
          setListLoading(false)
        }
      }
    } catch (e) {
      console.error(e)
      setListLoading(false)
    }
  }, [list, token])

  useEffect(() => {
    try {
      if (fetch_todo && token && currentListID) {
        setTodos(fetch_todo)
        setPrevTodos(fetch_todo)
        setTodosLoading(false)
      }
    } catch (e) {
      console.error(e)
      setTodosLoading(false)
    }
  }, [user, userLoading, fetch_todo, token, currentListID])

  const handleSaveTodos = async (
    todos: TodoProps[],
    prevTodos: TodoProps[],
    listID: string,
    token: string,
    isUpdate: boolean,
  ) => {
    try {
      if (!isUpdate) return
      setIsSave(true)
      const api = `${process.env.NEXT_PUBLIC_API}/api/list/${listID}/todo`
      const postData = todoFunc.diff(todos, prevTodos)
      if (postData.length > 0) {
        postFetch(api, token, postData).then(_ => {
          setPrevTodos([...todos])
          setIsUpdate(false)
        }).catch(e => console.error(e)).finally(() => setIsSave(false))
      } else {
        setIsSave(false)
        setIsUpdate(false)
      }
    } catch (e) {
      console.error(e)
    }
  }
  const saveTodos = useCallback(debounce((todos, prevTodos, listID, token, isUpdate) => handleSaveTodos(todos, prevTodos, listID, token, isUpdate), 30000), [])

  useEffect(() => {
    if (token && currentListID && isUpdate) saveTodos(todos, prevTodos, currentListID, token, isUpdate)
  }, [saveTodos, isUpdate, todos, token, prevTodos, currentListID])

  const handleClickSaveButton = () => handleSaveTodos(todos, prevTodos, currentListID, token, isUpdate)

  const handleToggleHelp = () => setHelp(!isHelp)
  return (
    <article className="h-screen bg-sky-50/50">
      <Header user={user} userLoading={userLoading} list={list} isSave={isSave} isUpdate={isUpdate} onClickSaveButton={handleClickSaveButton} />
      <div className={`px-4 w-full ${isHelp ? "h-screen sm:h-[calc(100vh-400px)]" : " h-[calc(100vh-100px)]"} `}>
        <Todo
          todos={!userLoading && user ? todos : todosLS}
          prevTodos={prevTodos}
          filterdTodos={filterdTodos}
          mode={mode}
          sort={sort}
          loading={listLoading || todosLoading || userLoading}
          setTodos={!userLoading && user ? setTodos : setTodosLS}
          setFilterdTodos={setFilterdTodos}
          setMode={setMode}
          setSort={setSort}
          setIsUpdate={setIsUpdate}
          toggleHelp={handleToggleHelp}
          onClickSaveButton={handleClickSaveButton}
        />
      </div>
      <div className={`absolute bottom-0 w-full p-4 ${isHelp ? "hidden sm:block sm:h-4/6" : "hidden"} border-t-2 shadow-2xl rounded-t-3xl bg-popover text-popover-foreground`}>
        <div className="flex justify-between">
          <h1 className="flex gap-1 p-2 text-md font-semibold text-center"><Keyboard /> ショートカット</h1>
          <Button variant={"link"} className="text-xs" onClick={_ => setHelp(!isHelp)}> ヘルプを閉じる<kbd>?</kbd></Button>
        </div>
        <Usage
          sort={sort}
          mode={mode}
          isTodos={filterdTodos.length > 0}
        />
      </div>
      {!isHelp && <div className="w-full text-slate-500 text-right pr-2 absolute bottom-1">
        <Button variant={"link"} className="text-xs" onClick={_ => setHelp(!isHelp)}> ヘルプを開く<kbd>?</kbd></Button>
      </div>}
    </article >
  );
}
