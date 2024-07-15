'use client'
import { Todo } from "@/components/todo";
import { useState, useEffect, useCallback } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { Usage } from "@/components/usage";
import Header from "@/components/header";
import { mutate } from "swr";
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchList, postFetch } from "@/lib/fetch";
import { debounce } from "@/lib/utils";

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
      // const apiListURL = `${process.env.NEXT_PUBLIC_API}/api/list`
      const apiListURL = `http://localhost:3001/api/list`
      postFetch(apiListURL, token, { name: "first list" })
      mutate(apiListURL)
    }
  }, [list, token])

  const [todos, setTodos] = useState<TodoProps[]>([
    { id: "0", text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: "1", text: 'プロジェクトAの締め切り日に対してメールするがどうなるんだろう。おかしいな', priority: 'b', project: "job", context: "family", creationDate: "2024-01-10" },
    { id: "2", text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
    { id: "90", text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
  ])


  const [prevTodos, setPrevTodos] = useState<TodoProps[]>([])
  const [isSave, setIsSave] = useState(false)
  const handleSaveTodos = async (_todos: TodoProps[]) => {
    try {
      setIsSave(true)
      let update = []
      const api = `${process.env.NEXT_PUBLIC_API}/api/list/${currentListID}/todo`
      try {
        const _t = await Promise.all(_todos.map(t => {
          if (t.isUpdate && api) {
            postFetch(api, token,
              {
                id: t.id,
                created_at: t.creationDate,
                text: t.text,
                project: t.project,
                context: t.context
              })

            //todo is update

          } else {
            return t
          }
          //delete 
        }))

        setTodos(
          _todos.map(t => {
            if (t.isUpdate) {
              t.isUpdate = false
            }
            return t
          })
        )
        setPrevTodos(_todos)
      } catch (e) {
        console.error(e)
      }
    } finally {
      setIsSave(false)
    }
  }

  const saveTodos = useCallback(debounce((_todos) => handleSaveTodos(_todos), 3000), [])
  useEffect(() => saveTodos(todos), [saveTodos, todos])

  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useState<Sort>(undefined)
  const [isHelp, setHelp] = useState(true)

  const handleToggleHelp = () => setHelp(!isHelp)

  return (
    <article className="h-screen bg-sky-50/50">
      <Header list={list} isSave={isSave} />
      <div className={`px-4 w-full ${isHelp ? "h-screen sm:h-[calc(100vh-400px)]" : " h-[calc(100vh-100px)]"} `}>
        <Todo
          todos={todos}
          filterdTodos={filterdTodos}
          mode={mode}
          sort={sort}
          setTodos={setTodos}
          setFilterdTodos={setFilterdTodos}
          setMode={setMode}
          setSort={setSort}
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
