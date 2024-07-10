'use client'
import { Todo } from "@/components/todo";
import { useState, useEffect, useCallback } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { Usage } from "@/components/usage";
import Header from "@/components/header";
import useSWR, { mutate } from "swr";
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchList, postFetch } from "@/lib/fetch";
import { debounce } from "@/lib/utils";

export default function Home() {
  const { getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState("")
  const [apiTodoURL, setApiTodoURL] = useState("")
  useEffect(() => {
    async function getToken() {
      const token = await getAccessTokenSilently()
      if (token) setToken(token)
    }
    return (() => { getToken() })
  }, [getAccessTokenSilently])

  const { data: list, isLoading: isLodingList } = useFetchList("", token)

  useEffect(() => {
    const apiListURL = `${process.env.NEXT_PUBLIC_API}/api/list`
    if (list) {
      setApiTodoURL(`${apiListURL}/${list[0].id}/todo`)
    } else if (list === null) {
      postFetch(apiListURL, token, { name: "first list" })
      mutate(apiListURL)
    }
  }, [list, token])

  const [todos, setTodos] = useState<TodoProps[]>([
    { id: 0, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 1, text: 'プロジェクトAの締め切り日に対してメールするがどうなるんだろう。おかしいな', priority: 'b', project: "job", context: "family", creationDate: "2024-01-10" },
    { id: 2, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
    { id: 3, text: '材料を買う', project: "hobby", creationDate: "2024-01-10" },
    { id: 4, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 14, text: 'プロジェクトAの締め切り日に対してメールする', priority: 'b', project: "job", context: "family", creationDate: "2024-01-10" },
    { id: 12, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
    { id: 13, text: '材料を買う', project: "hobby", creationDate: "2024-01-10" },
    { id: 10, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", completionDate: "2024-01-12", creationDate: "2024-01-10" },
    { id: 20, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 21, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 30, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 31, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 40, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 41, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 50, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 52, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 60, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 80, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 90, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
  ])


  const [prevTodos, setPrevTodos] = useState<TodoProps[]>(todos)
  // const test = useCallback(debounce(() => console.log(todos), 1000), [])

  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useState<Sort>(undefined)
  const [isHelp, setHelp] = useState(true)

  const handleToggleHelp = () => setHelp(!isHelp)

  return (
    <article className="h-screen bg-sky-50/50">
      <Header list={list} />
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
