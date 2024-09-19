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
  const [todosLS, setTodosLS] = useLocalStorage<TodoProps[]>("todo_data", [])
  const [prevTodos, setPrevTodos] = useState<TodoProps[]>([])
  const [isSave, setIsSave] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)
  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useLocalStorage<Sort>("sort-ls-key", undefined)

  const [todosLoading, setTodosLoading] = useState(true)
  const [listLoading, setListLoading] = useState(true)
  const { data: list } = useFetchList("", token)
  const { data: fetch_todo } = useFetchTodo(currentListID, token)

  useEffect(() => {
    async function getToken() {
      try {
        const token = await getAccessTokenSilently()
        if (token) {
          setToken(token)
        }
      } catch (e) {
        setListLoading(false)
        setTodosLoading(false)
      }
    }
    getToken()
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

  /**
   * オートセーブ
   * */
  const saveTodos = useCallback(debounce((todos, prevTodos, listID, token, isUpdate) => handleSaveTodos(todos, prevTodos, listID, token, isUpdate), 3000), [])

  useEffect(() => {
    if (token && currentListID && isUpdate) saveTodos(todos, prevTodos, currentListID, token, isUpdate)
  }, [saveTodos, isUpdate, todos, token, prevTodos, currentListID])
  //***

  const handleClickSaveButton = () => handleSaveTodos(todos, prevTodos, currentListID, token, isUpdate)

  const headerHeight = "80px"
  const mainPCHeight = `h-[calc(100vh-80px)]` // 100vh - headerHeight
  return (
    <article className="h-screen bg-muted/10">
      <Header height={headerHeight} user={user} userLoading={userLoading} list={list} isSave={isSave} isUpdate={isUpdate} onClickSaveButton={handleClickSaveButton} />
      <div className={`w-full ${mainPCHeight}`}>
        {(listLoading || todosLoading || userLoading) &&
          <div className={`absolute top-0  w-full h-full pr-2 bg-muted/50 backdrop-blur-sm z-50`}>
            <div className="flex text-sm items-center justify-center h-full w-full ">
              <span className="flex justify-center items-center px-10 py-5 font-semibold rounded-md bg-card text-card-foreground shadow-lg">
                <span className="animate-bounce">Loading...</span>
              </span>
            </div>
          </div>
        }
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
          onClickSaveButton={handleClickSaveButton}
        />
      </div>
    </article >
  );
}
