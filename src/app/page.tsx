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
  const [apiTodoURL, setApiTodoURL] = useState("")
  const [currentListID, setCurrentListID] = useState("1d6b35c2-e62c-4fe5-89a0-6bd8287685dc")

  useEffect(() => {
    async function getToken() {
      try {
        const token = await getAccessTokenSilently()
        if (token) setToken(token)
      } catch (e) { }
    }
    return (() => { getToken() })
  }, [getAccessTokenSilently])

  const { data: list, isLoading: isLodingList } = useFetchList("", token)

  useEffect(() => {
    if (list === null) {
      const apiListURL = `${process.env.NEXT_PUBLIC_API}/api/list`
      postFetch(apiListURL, token, { name: "first list" })
      mutate(apiListURL)
    }
  }, [list, token])

  const [todos, setTodos] = useState<TodoProps[]>([])
  const { data: fetch_todo, isLoading: isLoadingTodo } = useFetchTodo(currentListID, token)
  useEffect(() => {
    if (fetch_todo && token && currentListID) {
      setTodos(fetch_todo)
      setPrevTodos(fetch_todo)
    }
  }, [fetch_todo, token, currentListID])

  const [prevTodos, setPrevTodos] = useState<TodoProps[]>([])
  const [isSave, setIsSave] = useState(false)
  useEffect(() => {
    console.log("isSave=", isSave)
  }, [isSave])

  const handleSaveTodos = async (
    todos: TodoProps[],
    prevTodos: TodoProps[],
    token: string,
  ) => {
    try {
      setIsSave(true)
      const api = `${process.env.NEXT_PUBLIC_API}/api/list/${currentListID}/todo`
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
      if (postData.length > 0) postFetch(api, token, postData).then(_ => {
        setPrevTodos([...todos])
        setIsUpdate(false)
      }).catch(e => console.error(e))

    } catch (e) {
      console.error(e)
    } finally {
      setIsSave(false)
    }
  }

  const [isUpdate, setIsUpdate] = useState(false)

  const saveTodos = useCallback(debounce((todos, prevTodos, token) => handleSaveTodos(todos, prevTodos, token), 5000), [])
  useEffect(() => {
    if (token && isUpdate) saveTodos(todos, prevTodos, token)
  }, [saveTodos, isUpdate, todos, token, prevTodos])

  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useState<Sort>(undefined)
  const [isHelp, setHelp] = useState(false)

  const handleToggleHelp = () => setHelp(!isHelp)

  return (
    <article className="h-screen bg-sky-50/50">
      <Header list={list} isSave={isSave} />
      <div className={`px-4 w-full ${isHelp ? "h-screen sm:h-[calc(100vh-400px)]" : " h-[calc(100vh-100px)]"} `}>
        {isLoadingTodo && "loading"}
        <Todo
          todos={todos}
          filterdTodos={filterdTodos}
          mode={mode}
          sort={sort}
          setTodos={setTodos}
          setFilterdTodos={setFilterdTodos}
          setMode={setMode}
          setSort={setSort}
          setIsUpdate={setIsUpdate}
          toggleHelp={handleToggleHelp}
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
