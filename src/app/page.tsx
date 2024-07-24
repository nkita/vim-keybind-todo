'use client'

import { Todo } from "@/components/todo";
import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { Usage } from "@/components/usage";
import Header from "@/components/header";
import { mutate } from "swr";
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchList, useFetchTodo, postFetch } from "@/lib/fetch";
import { debounce } from "@/lib/utils";
import { isEqual } from "lodash";

export default function Home() {
  const { getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState("")
  const [currentListID, setCurrentListID] = useState("")
  const [todos, setTodos] = useState<TodoProps[]>([])
  const [prevTodos, setPrevTodos] = useState<TodoProps[]>([])
  const [isSave, setIsSave] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)
  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useState<Sort>(undefined)
  const [isHelp, setHelp] = useState(false)

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
        setTodos([])
        setFilterdTodos([])
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
  }, [fetch_todo, token, currentListID])

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
      const updates = todos.filter(t => {
        const _t = prevTodos.filter(pt => pt.id === t.id)
        // modify or new task
        return (_t.length > 0 && !isEqual(_t[0], t)) || _t.length === 0
      })

      const _ids = todos.map(t => t.id)
      const deletes = prevTodos.filter(pt => !_ids.includes(pt.id)).map(pt => {
        pt.isArchived = true
        return pt
      })
      const postData = [...updates, ...deletes]
      if (postData.length > 0) {
        postFetch(api, token, postData).then(_ => {
          setPrevTodos([...todos])
          setIsUpdate(false)
        }).catch(e => console.error(e)).finally(() => setIsSave(false))
      } else {
        setIsSave(false)
      }

    } catch (e) {
      console.error(e)
    }
  }
  const saveTodos = useCallback(debounce((todos, prevTodos, listID, token, isUpdate) => handleSaveTodos(todos, prevTodos, listID, token, isUpdate), 5000), [])

  useEffect(() => {
    if (token && currentListID && isUpdate) saveTodos(todos, prevTodos, currentListID, token, isUpdate)
  }, [saveTodos, isUpdate, todos, token, prevTodos, currentListID])

  const handleClickSaveButton = () => handleSaveTodos(todos, prevTodos, currentListID, token, isUpdate)

  const handleToggleHelp = () => setHelp(!isHelp)

  return (
    <article className="h-screen bg-sky-50/50">
      <Header list={list} isSave={isSave} isUpdate={isUpdate} onClickSaveButton={handleClickSaveButton} />
      <div className={`px-4 w-full ${isHelp ? "h-screen sm:h-[calc(100vh-400px)]" : " h-[calc(100vh-100px)]"} `}>
        <Todo
          todos={todos}
          filterdTodos={filterdTodos}
          mode={mode}
          sort={sort}
          loading={listLoading && todosLoading}
          setTodos={setTodos}
          setFilterdTodos={setFilterdTodos}
          setMode={setMode}
          setSort={setSort}
          setIsUpdate={setIsUpdate}
          toggleHelp={handleToggleHelp}
          onClickSaveButton={handleClickSaveButton}
        />
      </div>
      <div className={`absolute bottom-0 w-full p-4 ${isHelp ? "hidden sm:block sm:h-[350px]" : "hidden"} border-t shadow-lg rounded-t-3xl bg-popover text-popover-foreground`}>
        <h1 className="p-2 text-sm font-semibold text-center">ショートカット</h1>
        <Usage
          sort={sort}
          mode={mode}
          isTodos={filterdTodos.length > 0}
        />
      </div>
    </article >
  );
}
